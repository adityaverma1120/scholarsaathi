import assert from 'node:assert';
import { normalise } from '../../src/lib/matcher/normaliser.ts';

console.log('🧪 Testing WAJAH Normaliser (Stages N1-N10)...');

// 1. Empty & Invalid inputs
assert.strictEqual(normalise('').tokens.length, 0);
assert.strictEqual(normalise('   ').tokens.length, 0);
assert.strictEqual(normalise(null).tokens.length, 0);
assert.strictEqual(normalise(undefined).tokens.length, 0);

// 2. N1: Unicode NFC Normalisation
const nfcDecomposed = 'दोषपूर्ण'.normalize('NFD');
const nfcResult = normalise(nfcDecomposed);
assert.ok(nfcResult.tokens.length > 0);

// 3. N2: HTML and Markup Stripping
const htmlInput = '<div class="alert"><b>Application marked defective</b></div>';
const htmlResult = normalise(htmlInput);
assert.ok(!htmlResult.tokens.includes('div'));
assert.ok(!htmlResult.tokens.includes('alert'));
assert.ok(!htmlResult.tokens.includes('b'));
assert.ok(htmlResult.tokens.includes('defect') || htmlResult.tokens.includes('defective'));

// 4. N3: PII Sanitisation (Masked BEFORE digit stripping)
const piiInput = 'My Aadhaar is 2345 6789 0123 defective application';
const piiResult = normalise(piiInput);
assert.strictEqual(piiResult.hasPii, true);
assert.ok(piiResult.sanitised.includes('[ID]'));

// 5. N4: Lowercase Conversion
const upperInput = 'APPLICATION MARKED DEFECTIVE BY INSTITUTE';
const upperResult = normalise(upperInput);
for (const token of upperResult.tokens) {
  assert.strictEqual(token, token.toLowerCase());
}

// 6. N5: Optional Digit Stripping
const digitInput = 'Remark code 404 pending';
const withDigits = normalise(digitInput, { stripDigits: false });
const withoutDigits = normalise(digitInput, { stripDigits: true });
assert.ok(withDigits.tokens.includes('404'));
assert.ok(!withoutDigits.tokens.includes('404'));

// 7. N6: Punctuation Removal
const punctInput = 'Application: defective! (returned for correction).';
const punctResult = normalise(punctInput);
assert.ok(!punctResult.tokens.some(t => /[\.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/.test(t)));

// 8. N7: Variant & Synonym Mapping
const variantInput = 'colg se form vapasi ho gaya jila level par ruka';
const variantResult = normalise(variantInput);
// "colg" -> "institute", "vapasi" -> "defective", "jila" -> "district", "ruka" -> "pending"
assert.ok(variantResult.tokens.includes('institute'), 'colg should map to institute');
assert.ok(variantResult.tokens.includes('district'), 'jila should map to district');
assert.ok(variantResult.tokens.includes('pend'), 'ruka should map to pending (stemmed to pend)');

// 9. N8: Stop-Word Stripping
const stopWordInput = 'the application is pending at institute for verification and approval';
const stopWordResult = normalise(stopWordInput);
assert.ok(!stopWordResult.tokens.includes('the'));
assert.ok(!stopWordResult.tokens.includes('is'));
assert.ok(!stopWordResult.tokens.includes('at'));
assert.ok(!stopWordResult.tokens.includes('for'));
assert.ok(!stopWordResult.tokens.includes('and'));

// 10. N9: Suffix Stemming
const stemmingInput = 'checking rejected documents';
const stemResult = normalise(stemmingInput);
// "checking" -> "check", "rejected" -> "reject"
assert.ok(stemResult.tokens.includes('check'), 'checking should stem to check');
assert.ok(stemResult.tokens.includes('reject'), 'rejected should stem to reject');

console.log('✅ All Normaliser unit tests passed successfully.');
