import knowledgeData from '../../../data/assistant_knowledge.json' with { type: 'json' };
import {
  type KnowledgeChunk,
  type Citation,
  KnowledgeChunkSchema,
} from './schema';

export interface ScoredChunk {
  chunk: KnowledgeChunk;
  score: number;
  matchedKeywords: string[];
}

export interface RetrievalResult {
  query: string;
  chunks: ScoredChunk[];
  topScore: number;
  insufficientEvidence: boolean;
  citations: Citation[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should',
  'now', 'my', 'me', 'i', 'you', 'your', 'we', 'our', 'he', 'him', 'his', 'she',
  'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
  'this', 'that', 'these', 'those', 'am', 'do', 'does', 'did', 'have', 'has', 'had',
  'है', 'हैं', 'हो', 'था', 'थी', 'थे', 'का', 'के', 'की', 'को', 'में', 'पर', 'से'
]);

/**
 * Normalise text for retrieval (English & Hindi)
 */
export function normaliseRetrievalText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract tokens for matching (filters short tokens & stop words)
 */
export function tokenizeRetrievalText(text: string): string[] {
  const norm = normaliseRetrievalText(text);
  if (!norm) return [];
  return norm.split(' ').filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Validates and returns all verified knowledge chunks
 */
export function getVerifiedKnowledgeChunks(): KnowledgeChunk[] {
  const list = knowledgeData as unknown as KnowledgeChunk[];
  return list.filter(chunk => {
    const valid = KnowledgeChunkSchema.safeParse(chunk);
    return valid.success && chunk.reviewStatus === 'verified';
  });
}

/**
 * Retrieves the most relevant knowledge chunks for a query
 * Spec 13 Section 4: Pure TypeScript, zero external vector DB.
 */
export function retrieveKnowledge(
  userQuery: string,
  preferredSchemeId?: string,
  academicYear: string = '2026-27',
  topK: number = 3
): RetrievalResult {
  const queryNorm = normaliseRetrievalText(userQuery);
  const queryTokens = tokenizeRetrievalText(userQuery);

  if (queryTokens.length === 0) {
    return {
      query: userQuery,
      chunks: [],
      topScore: 0,
      insufficientEvidence: true,
      citations: [],
    };
  }

  const allChunks = getVerifiedKnowledgeChunks();

  // Filter by academic year
  const activeChunks = allChunks.filter(
    c => c.academicYear === academicYear
  );

  const scored: ScoredChunk[] = [];

  for (const chunk of activeChunks) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Scheme match bonus
    if (preferredSchemeId && chunk.schemeId === preferredSchemeId) {
      score += 0.25;
    }

    // Combine all chunk keywords
    const allChunkKeywords = [
      ...chunk.keywordsEn.map(k => normaliseRetrievalText(k)),
      ...chunk.keywordsHi.map(k => normaliseRetrievalText(k)),
    ];

    // 1. Keyword scoring (whole phrase or exact token)
    for (const kw of allChunkKeywords) {
      if (kw.includes(' ')) {
        if (queryNorm.includes(kw)) {
          score += 0.35;
          matchedKeywords.push(kw);
        }
      } else if (queryTokens.includes(kw)) {
        score += 0.30;
        matchedKeywords.push(kw);
      }
    }

    // 2. Query token overlap with title & content tokens (word-boundary safe)
    const titleTokens = new Set(tokenizeRetrievalText(chunk.titleEn + ' ' + chunk.titleHi));
    const contentTokens = new Set(tokenizeRetrievalText(chunk.contentEn + ' ' + chunk.contentHi));

    let tokenMatches = 0;
    for (const token of queryTokens) {
      if (titleTokens.has(token)) {
        score += 0.20;
        tokenMatches++;
      } else if (contentTokens.has(token)) {
        score += 0.10;
        tokenMatches++;
      }
    }

    // Normalise score
    const tokenRatio = tokenMatches / queryTokens.length;
    score += tokenRatio * 0.25;

    // Cap score at 1.0
    const finalScore = Math.min(1.0, score);

    if (finalScore >= 0.20) {
      scored.push({
        chunk,
        score: Math.round(finalScore * 100) / 100,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK);

  const topScore = topChunks.length > 0 ? topChunks[0].score : 0;
  // Insufficient evidence threshold: Spec 13 Section 4 & Acceptance Criteria
  const insufficientEvidence = topScore < 0.35;

  const citations: Citation[] = insufficientEvidence
    ? []
    : topChunks.map(({ chunk }) => ({
        sourceTitle: chunk.sourceTitle,
        officialUrl: chunk.officialUrl,
        sectionLocator: chunk.sectionLocator,
        academicYear: chunk.academicYear,
        checkedDate: chunk.checkedDate,
      }));

  return {
    query: userQuery,
    chunks: topChunks,
    topScore,
    insufficientEvidence,
    citations,
  };
}
