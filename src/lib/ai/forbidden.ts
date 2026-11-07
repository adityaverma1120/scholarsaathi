import forbiddenData from '../../../content/lint/forbidden.json' with { type: 'json' };

export interface ForbiddenCheckResult {
  hasForbidden: boolean;
  matchedPhrases: string[];
}

/**
 * Checks a string against both English and Hindi forbidden phrases (case-insensitive).
 * Enforces Architectural Invariants:
 * - P1: No false affiliation ("official Wajah", "government service", "NSP team")
 * - P2: No eligibility decisions or payment promises ("you will be paid", "you are eligible", "will be approved")
 * - P4: No requests for secrets ("enter your password", "share your OTP", "type your Aadhaar")
 */
export function checkForbiddenPhrases(text: string): ForbiddenCheckResult {
  if (!text || typeof text !== 'string') {
    return { hasForbidden: false, matchedPhrases: [] };
  }

  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const phrase of forbiddenData.forbidden_en) {
    if (lower.includes(phrase.toLowerCase())) {
      matched.push(phrase);
    }
  }

  for (const phrase of forbiddenData.forbidden_hi) {
    if (lower.includes(phrase.toLowerCase())) {
      matched.push(phrase);
    }
  }

  return {
    hasForbidden: matched.length > 0,
    matchedPhrases: matched,
  };
}

/**
 * Validates an AI-generated grievance slot.
 * If the slot contains any forbidden phrase, digits resembling identifiers, or exceeds length cap,
 * safely reverts to the reviewed fixed template sentence.
 */
export function validateSlot(slotText: string, fallbackText: string, maxLength: number = 300): string {
  if (!slotText || typeof slotText !== 'string') {
    return fallbackText;
  }

  const trimmed = slotText.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return fallbackText;
  }

  // Check forbidden phrases
  const forbidden = checkForbiddenPhrases(trimmed);
  if (forbidden.hasForbidden) {
    return fallbackText;
  }

  // Check runs of digits (>= 10 digits) that look like Aadhaar or phone numbers
  if (/\b\d{10,12}\b/.test(trimmed)) {
    return fallbackText;
  }

  return trimmed;
}

