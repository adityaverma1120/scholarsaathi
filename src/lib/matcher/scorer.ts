import type { LibraryEntry } from '../library/types';
import { normalise } from './normaliser';

export type DecisionBand = 'CONFIDENT' | 'AMBIGUOUS' | 'WEAK';

export interface MatchScore {
  entry: LibraryEntry;
  score: number;
  matchedTriggers: string[];
}

export interface MatchOutcome {
  band: DecisionBand;
  topScore: number;
  lead: number;
  candidates: MatchScore[];
}

/**
 * Deterministic Local Matcher Scorer
 * Pure TypeScript — Offline-First
 * Follows documented thresholds:
 * - Score >= 0.85 and lead >= 0.20: CONFIDENT
 * - Confidence between 0.50 and 0.79 (or lead < 0.20): AMBIGUOUS (top 3 choices)
 * - Confidence below 0.50: WEAK (no match)
 * - Insufficient evidence: WEAK with 0 candidates
 */
export function scoreEntries(input: string, library: LibraryEntry[]): MatchOutcome {
  if (!input || typeof input !== 'string') {
    return { band: 'WEAK', topScore: 0, lead: 0, candidates: [] };
  }

  const normInput = normalise(input);
  if (normInput.tokens.length === 0) {
    return { band: 'WEAK', topScore: 0, lead: 0, candidates: [] };
  }

  const inputTokens = new Set(normInput.tokens);
  const rawLower = input.toLowerCase();
  const inputPhrase = normInput.tokens.join(' ');

  const scored: MatchScore[] = [];

  for (const entry of library) {
    if (entry.status === 'retired') continue;

    let totalScore = 0;
    const matchedTriggers: string[] = [];
    let triggerHits = 0;

    // 1. Negative Triggers Check (Strong Penalty: -1.0)
    if (entry.negative_triggers && entry.negative_triggers.length > 0) {
      for (const neg of entry.negative_triggers) {
        const normNeg = normalise(neg).tokens.join(' ');
        if (rawLower.includes(neg.toLowerCase()) || (normNeg && inputPhrase.includes(normNeg))) {
          totalScore -= 1.0;
          break;
        }
      }
    }

    // 2. Primary Triggers Matching
    if (entry.triggers && entry.triggers.length > 0) {
      for (const trigger of entry.triggers) {
        const normTrigger = normalise(trigger);
        const trigPhrase = normTrigger.tokens.join(' ');

        if (!trigPhrase) continue;

        // Exact phrase match in normalized tokens
        if (inputPhrase.includes(trigPhrase)) {
          totalScore += 1.0;
          triggerHits++;
          matchedTriggers.push(trigger);
        } else {
          // Token subset match
          const matchingTokens = normTrigger.tokens.filter(t => inputTokens.has(t));
          if (matchingTokens.length === normTrigger.tokens.length) {
            totalScore += 0.85;
            triggerHits++;
            matchedTriggers.push(trigger);
          } else if (normTrigger.tokens.length > 2 && matchingTokens.length >= normTrigger.tokens.length * 0.66) {
            totalScore += 0.50 * (matchingTokens.length / normTrigger.tokens.length);
            triggerHits++;
            matchedTriggers.push(trigger);
          }
        }
      }
    }

    // 3. Language Variants Matching (en, hi, hinglish)
    if (entry.language_variants) {
      const allVariants = [
        ...(entry.language_variants.en || []),
        ...(entry.language_variants.hi || []),
        ...(entry.language_variants.hinglish || [])
      ];

      for (const variant of allVariants) {
        const normVar = normalise(variant);
        const varPhrase = normVar.tokens.join(' ');
        if (!varPhrase) continue;

        if (inputPhrase.includes(varPhrase) || rawLower.includes(variant.toLowerCase())) {
          totalScore += 0.90;
          triggerHits++;
          matchedTriggers.push(variant);
        } else {
          const varTokens = normVar.tokens.filter(t => inputTokens.has(t));
          if (varTokens.length === normVar.tokens.length) {
            totalScore += 0.80;
            triggerHits++;
            matchedTriggers.push(variant);
          } else if (normVar.tokens.length > 2 && varTokens.length >= normVar.tokens.length * 0.66) {
            totalScore += 0.45 * (varTokens.length / normVar.tokens.length);
            triggerHits++;
            matchedTriggers.push(variant);
          }
        }
      }
    }

    // 4. Keyword Matching
    if (entry.keywords && entry.keywords.length > 0) {
      let keywordBonus = 0;
      for (const kw of entry.keywords) {
        const normKw = normalise(kw).tokens.join(' ');
        if (normKw && (inputTokens.has(normKw) || inputPhrase.includes(normKw))) {
          keywordBonus += 0.08;
          matchedTriggers.push(kw);
        }
      }
      totalScore += Math.min(keywordBonus, 0.20);
    }

    // 5. Extra Trigger Hits Bonus: +0.10 per extra hit (max +0.20)
    if (triggerHits > 1) {
      const bonus = Math.min((triggerHits - 1) * 0.10, 0.20);
      totalScore += bonus;
    }

    // 6. Clamp score to [0, 1.0]
    const clampedScore = Math.max(0, Math.min(totalScore, 1.0));
    if (clampedScore > 0) {
      scored.push({
        entry,
        score: Number(clampedScore.toFixed(3)),
        matchedTriggers: Array.from(new Set(matchedTriggers)),
      });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      band: 'WEAK',
      topScore: 0,
      lead: 0,
      candidates: [],
    };
  }

  const top = scored[0];
  const runnerUp = scored[1];
  const topScore = top.score;
  const lead = runnerUp ? Number((topScore - runnerUp.score).toFixed(3)) : topScore;

  // Decision Thresholds:
  // - Score >= 0.85 and lead >= 0.20: CONFIDENT
  // - Confidence between 0.50 and 0.79 (or score >= 0.85 without lead): AMBIGUOUS
  // - Confidence below 0.50: WEAK
  let band: DecisionBand = 'WEAK';
  if (topScore >= 0.85 && lead >= 0.20) {
    band = 'CONFIDENT';
  } else if (topScore >= 0.50) {
    band = 'AMBIGUOUS';
  } else {
    band = 'WEAK';
  }

  return {
    band,
    topScore,
    lead,
    candidates: band === 'WEAK' ? [] : scored.slice(0, 3),
  };
}
