/**
 * WAJAH Client-Side PII Sanitizer
 * Pure TypeScript — Zero Dependencies
 * Protects: P4 (Never ask for secrets) and P10 (Privacy by default)
 * Runs BEFORE normalization step N5 (which removes digits).
 */

export interface SanitiseResult {
  maskedText: string;
  hasPii: boolean;
  piiTypes: string[];
}

// Regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Aadhaar: 12 digits (continuous or 4-4-4 separated by space/dash)
const AADHAAR_REGEX = /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g;

// Indian mobile: 10 digits starting with 6-9 (optional +91 or 0 prefix)
const PHONE_REGEX = /(?:\+91[\s-]?)?[6-9]\d{9}\b/g;

// Generic long number runs (4+ consecutive digits, like application IDs or roll numbers)
const GENERIC_NUM_REGEX = /\b\d{4,}\b/g;

export function sanitiseText(rawText: string): SanitiseResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      maskedText: '',
      hasPii: false,
      piiTypes: [],
    };
  }

  let text = rawText;
  const piiFound = new Set<string>();

  // 1. Scan and mask Email addresses
  if (EMAIL_REGEX.test(text)) {
    piiFound.add('email');
    text = text.replace(EMAIL_REGEX, '[EMAIL]');
  }

  // 2. Scan and mask Aadhaar numbers (12 digits)
  if (AADHAAR_REGEX.test(text)) {
    piiFound.add('aadhaar');
    text = text.replace(AADHAAR_REGEX, '[ID]');
  }

  // 3. Scan and mask Phone numbers (10 digits starting with 6-9)
  if (PHONE_REGEX.test(text)) {
    piiFound.add('phone');
    text = text.replace(PHONE_REGEX, '[NUM]');
  }

  // 4. Scan and mask other 4+ digit runs (application IDs, roll numbers)
  if (GENERIC_NUM_REGEX.test(text)) {
    piiFound.add('number_run');
    text = text.replace(GENERIC_NUM_REGEX, '[NUM]');
  }

  return {
    maskedText: text,
    hasPii: piiFound.size > 0,
    piiTypes: Array.from(piiFound),
  };
}

