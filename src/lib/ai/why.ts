import whyTemplatesData from './why-templates.json' with { type: 'json' };

export type AgreementType = 'agree' | 'disagree' | 'local_only' | 'ai_only';
export type MatchPathType = 'tap' | 'local' | 'ai' | 'both' | 'chosen' | 'none';

export interface WhyLineContext {
  match_path: MatchPathType;
  agreement?: AgreementType;
  matched_terms?: string[];
  entry_category?: string;
  who_acts?: string;
}

export interface WhyLineResult {
  en: string;
  hi: string;
  template_key: string;
  evidence_terms: string[];
}

export function composeWhyLine(context: WhyLineContext): WhyLineResult {
  const templates = whyTemplatesData.templates as Record<string, { en: string; hi: string }>;
  let templateKey = 'fallback';

  // 1. Determine template key
  if (context.match_path === 'tap') {
    templateKey = 'tap_selection';
  } else if (context.match_path === 'chosen' || context.agreement === 'disagree') {
    templateKey = 'disagreement_choice';
  } else if (context.agreement === 'agree' || context.match_path === 'both') {
    templateKey = 'ai_agreement';
  } else if (context.match_path === 'ai') {
    templateKey = 'ai_understanding';
  } else if (context.match_path === 'local') {
    templateKey = context.matched_terms && context.matched_terms.length > 0
      ? 'local_keywords'
      : 'fallback';
  }

  // 2. Select and sanitize terms (max 2 terms, strip any numbers/identifiers)
  const rawTerms = context.matched_terms || [];
  const safeTerms: string[] = [];

  for (const term of rawTerms) {
    if (!term || typeof term !== 'string') continue;
    // Strip numbers
    const clean = term.replace(/\b\d+\b/g, '').trim();
    if (clean.length >= 2 && !safeTerms.includes(clean)) {
      safeTerms.push(clean);
    }
    if (safeTerms.length >= 2) break;
  }

  const termsString = safeTerms.length > 0
    ? safeTerms.map(t => `'${t}'`).join(' & ')
    : (context.entry_category || 'scholarship status');

  const template = templates[templateKey] || templates.fallback;

  return {
    en: template.en.replace('{terms}', termsString),
    hi: template.hi.replace('{terms}', termsString),
    template_key: templateKey,
    evidence_terms: safeTerms,
  };
}

