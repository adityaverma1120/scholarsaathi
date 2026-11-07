import type { LibraryEntry } from '../library/types';
import type { MatchOutcome } from '../matcher/scorer';
import type { AgreementType, MatchPathType } from './why';

export interface AiMatchOutput {
  id: string;
  confidence: number;
  alternatives?: string[];
  situation?: {
    status?: string;
    level?: string;
    language?: string;
  } | null;
  is_simulated?: boolean;
}

export type ReconcileAction = 'auto_open' | 'choose' | 'no_match';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ReconciledResult {
  action: ReconcileAction;
  selectedEntryId: string | null;
  candidates: LibraryEntry[];
  match_path: MatchPathType;
  agreement: AgreementType;
  confidence_level: ConfidenceLevel;
  confidence_score: number;
  why_terms: string[];
}

/**
 * Reconciles Local Deterministic Matcher with AI Classifier Output
 * Enforces Architectural Invariants:
 * - AI never authors advice (all guidance comes from LibraryEntry)
 * - Local Confident (X) + AI Confident (Y != X) -> Always disambiguate via choose (never silent override)
 * - AI alone from weak local match never auto-opens a card
 * - AI failure / timeout -> Transparently falls back to local outcome
 */
export function reconcileMatches(
  localOutcome: MatchOutcome,
  aiResult: AiMatchOutput | null,
  library: LibraryEntry[]
): ReconciledResult {
  const libraryMap = new Map(library.map(e => [e.id, e]));

  const localConfident = localOutcome.band === 'CONFIDENT' && localOutcome.candidates.length > 0;
  const localAmbiguous = localOutcome.band === 'AMBIGUOUS' && localOutcome.candidates.length > 0;
  const localTop = localOutcome.candidates[0];

  const aiEntry = aiResult && aiResult.id && aiResult.id !== 'none'
    ? libraryMap.get(aiResult.id) || null
    : null;
  const aiConfident = Boolean(aiEntry && (aiResult?.confidence ?? 0) >= 0.80);

  // 1. Both Confident
  if (localConfident && aiConfident && aiEntry) {
    if (localTop.entry.id === aiEntry.id) {
      // Complete agreement between Local and AI -> Auto-open card
      return {
        action: 'auto_open',
        selectedEntryId: localTop.entry.id,
        candidates: [localTop.entry],
        match_path: 'both',
        agreement: 'agree',
        confidence_level: 'high',
        confidence_score: Number(Math.max(localTop.score, aiResult?.confidence ?? 0).toFixed(2)),
        why_terms: localTop.matchedTriggers.slice(0, 2),
      };
    } else {
      // Disagreement between Local and AI!
      // Invariant: NEVER silently pick. Route to Disambiguation (choose)
      const candidateList: LibraryEntry[] = [localTop.entry, aiEntry];
      for (const c of localOutcome.candidates.slice(1)) {
        if (!candidateList.some(e => e.id === c.entry.id)) {
          candidateList.push(c.entry);
        }
        if (candidateList.length >= 3) break;
      }
      return {
        action: 'choose',
        selectedEntryId: null,
        candidates: candidateList,
        match_path: 'chosen',
        agreement: 'disagree',
        confidence_level: 'medium',
        confidence_score: localTop.score,
        why_terms: localTop.matchedTriggers.slice(0, 2),
      };
    }
  }

  // 2. Local Confident alone (AI weak, failed, or local only)
  if (localConfident) {
    return {
      action: 'auto_open',
      selectedEntryId: localTop.entry.id,
      candidates: [localTop.entry],
      match_path: 'local',
      agreement: 'local_only',
      confidence_level: 'high',
      confidence_score: localTop.score,
      why_terms: localTop.matchedTriggers.slice(0, 2),
    };
  }

  // 3. Local Ambiguous & AI Confident
  if (localAmbiguous && aiConfident && aiEntry) {
    // Put AI entry first, followed by local candidates
    const candidateList: LibraryEntry[] = [aiEntry];
    for (const c of localOutcome.candidates) {
      if (!candidateList.some(e => e.id === c.entry.id)) {
        candidateList.push(c.entry);
      }
      if (candidateList.length >= 3) break;
    }
    return {
      action: 'choose',
      selectedEntryId: null,
      candidates: candidateList,
      match_path: 'ai',
      agreement: 'ai_only',
      confidence_level: 'medium',
      confidence_score: Number((aiResult?.confidence ?? 0.85).toFixed(2)),
      why_terms: localTop?.matchedTriggers.slice(0, 2) || [],
    };
  }

  // 4. Local Ambiguous alone (or AI ambiguous)
  if (localAmbiguous) {
    return {
      action: 'choose',
      selectedEntryId: null,
      candidates: localOutcome.candidates.map(c => c.entry),
      match_path: 'local',
      agreement: 'local_only',
      confidence_level: 'medium',
      confidence_score: localTop.score,
      why_terms: localTop.matchedTriggers.slice(0, 2),
    };
  }

  // 5. Local Weak & AI Confident
  if (aiConfident && aiEntry) {
    return {
      action: 'choose',
      selectedEntryId: null,
      candidates: [aiEntry],
      match_path: 'ai',
      agreement: 'ai_only',
      confidence_level: 'medium',
      confidence_score: Number((aiResult?.confidence ?? 0.80).toFixed(2)),
      why_terms: [],
    };
  }

  // 6. No Reliable Match
  return {
    action: 'no_match',
    selectedEntryId: null,
    candidates: [],
    match_path: 'none',
    agreement: 'local_only',
    confidence_level: 'low',
    confidence_score: 0,
    why_terms: [],
  };
}

