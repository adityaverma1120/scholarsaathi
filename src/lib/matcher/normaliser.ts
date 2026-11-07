import { sanitiseText } from '../sanitise/sanitiser';
import variantsData from './variants.json' with { type: 'json' };

const STOP_WORDS = new Set([
  // English stop words
  'the', 'is', 'a', 'an', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'and', 'or', 'my', 'your', 'please', 'application',
  // Hindi/Hinglish stop words
  'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'par', 'kripya', 'mera', 'meri', 'mere', 'kya', 'aur', 'tha', 'thi', 'the'
]);

export interface NormalisedResult {
  raw: string;
  sanitised: string;
  hasPii: boolean;
  tokens: string[];
}

export function normalise(rawInput: string, options: { stripDigits?: boolean } = {}): NormalisedResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      raw: '',
      sanitised: '',
      hasPii: false,
      tokens: [],
    };
  }

  // N1: Unicode NFC Normalisation
  let text = rawInput.normalize('NFC');

  // N2: HTML and Markup Stripping
  text = text.replace(/<[^>]*>?/gm, ' ');
  text = text.replace(/&[a-z0-9#]+;/gi, ' ');

  // N3: PII Sanitisation (Runs BEFORE digit removal so sensitive numbers are never lost silently)
  const sanitisedResult = sanitiseText(text);
  text = sanitisedResult.maskedText;

  // N4: Lowercase Conversion
  text = text.toLowerCase();

  // N5: Digit-run removal (if enabled, remove remaining unmasked numbers)
  if (options.stripDigits) {
    text = text.replace(/\b\d+\b/g, ' ');
  }

  // N6: Punctuation and Special Character Removal
  text = text.replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, ' ');

  // N7: Variant and Synonym Mapping (from variants.json)
  const variants = variantsData.variants as Record<string, string[]>;
  for (const [canonical, synonymList] of Object.entries(variants)) {
    for (const syn of synonymList) {
      const synRegex = new RegExp(`\\b${syn}\\b`, 'g');
      text = text.replace(synRegex, canonical);
    }
  }

  // N10a: Collapse Whitespace and Tokenize
  const rawTokens = text.trim().split(/\s+/).filter(t => t.length > 0);

  // N8 & N9: Stop-Word Stripping and Suffix Normalisation
  const tokens: string[] = [];
  for (let token of rawTokens) {
    // N8: Skip stop words
    if (STOP_WORDS.has(token)) {
      continue;
    }

    // N9: Simple suffix stemming
    if (token.endsWith('ing') && token.length > 5) {
      token = token.slice(0, -3);
    } else if (token.endsWith('ed') && token.length > 4) {
      token = token.slice(0, -2);
    } else if (token.endsWith('s') && token.length > 3 && !token.endsWith('ss')) {
      token = token.slice(0, -1);
    }

    if (token.length > 1) {
      tokens.push(token);
    }
  }

  return {
    raw: rawInput,
    sanitised: sanitisedResult.maskedText,
    hasPii: sanitisedResult.hasPii,
    tokens,
  };
}

