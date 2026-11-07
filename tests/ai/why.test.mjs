import assert from 'node:assert/strict';
import { composeWhyLine } from '../../src/lib/ai/why.ts';

console.log('🧪 Testing WAJAH Why-Line Composer (Evidence-Grounded Explanations)...');

// 1. Template selection: Tap Selection
const tapResult = composeWhyLine({
  match_path: 'tap',
  agreement: 'local_only',
});
assert.strictEqual(tapResult.template_key, 'tap_selection');
assert.ok(tapResult.en.includes('Selected directly'));
assert.ok(tapResult.hi.includes('सीधे चुना गया'));

// 2. Template selection: Disagreement / Student Choice
const disagreeResult = composeWhyLine({
  match_path: 'chosen',
  agreement: 'disagree',
  matched_terms: ['defective', 'rejected'],
});
assert.strictEqual(disagreeResult.template_key, 'disagreement_choice');
assert.ok(disagreeResult.en.includes('Selected by student'));
assert.ok(disagreeResult.hi.includes('विद्यार्थी द्वारा चुना गया'));

// 3. Template selection: Both Local and AI Agree
const agreeResult = composeWhyLine({
  match_path: 'both',
  agreement: 'agree',
  matched_terms: ['defective', 'institute'],
});
assert.strictEqual(agreeResult.template_key, 'ai_agreement');
assert.ok(agreeResult.en.includes('Both local matching and AI analysis'));
assert.ok(agreeResult.en.includes("'defective' & 'institute'"));
assert.ok(agreeResult.hi.includes('स्थानीय मिलान और एआई विश्लेषण दोनों ने'));

// 4. Template selection: AI Understanding
const aiResult = composeWhyLine({
  match_path: 'ai',
  agreement: 'ai_only',
  matched_terms: ['bank validation'],
});
assert.strictEqual(aiResult.template_key, 'ai_understanding');
assert.ok(aiResult.en.includes('AI classification'));
assert.ok(aiResult.en.includes("'bank validation'"));

// 5. Template selection: Local Keywords
const localResult = composeWhyLine({
  match_path: 'local',
  agreement: 'local_only',
  matched_terms: ['pending', 'verification'],
});
assert.strictEqual(localResult.template_key, 'local_keywords');
assert.ok(localResult.en.includes('Matched based on portal keywords'));
assert.ok(localResult.en.includes("'pending' & 'verification'"));

// 6. Max 2 terms enforced (Invariant)
const manyTermsResult = composeWhyLine({
  match_path: 'local',
  matched_terms: ['alpha', 'beta', 'gamma', 'delta'],
});
assert.strictEqual(manyTermsResult.evidence_terms.length, 2);
assert.deepStrictEqual(manyTermsResult.evidence_terms, ['alpha', 'beta']);
assert.ok(!manyTermsResult.en.includes('gamma'));

// 7. Numbers stripped (Privacy Invariant: No phone numbers or IDs leak into why-line)
const numResult = composeWhyLine({
  match_path: 'local',
  matched_terms: ['9876543210', 'aadhaar 123456789012', 'defective'],
});
// 9876543210 strips to empty, aadhaar 123456789012 strips to 'aadhaar', defective stays 'defective'
assert.strictEqual(numResult.evidence_terms.length, 2);
assert.ok(numResult.evidence_terms.includes('aadhaar'));
assert.ok(numResult.evidence_terms.includes('defective'));
assert.ok(!numResult.en.includes('9876543210'));
assert.ok(!numResult.en.includes('123456789012'));

// 8. Fallback when terms empty
const fallbackResult = composeWhyLine({
  match_path: 'local',
  matched_terms: [],
});
assert.strictEqual(fallbackResult.template_key, 'fallback');
assert.ok(fallbackResult.en.includes('closest verified scholarship pattern'));

console.log('✅ Why-Line Composer: All evidence-grounding and privacy invariants verified!\n');

