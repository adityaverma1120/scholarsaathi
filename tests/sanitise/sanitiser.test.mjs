import assert from 'node:assert';
import { sanitiseText } from '../../src/lib/sanitise/sanitiser.ts';

console.log('🧪 Testing PII Sanitizer...');

// Positive Test Cases (Must be masked)
const positiveSamples = [
  {
    input: 'My Aadhaar is 2345 6789 0123 please verify',
    expectedMask: '[ID]',
    expectedType: 'aadhaar',
  },
  {
    input: 'Contact me at 9876543210 for correction',
    expectedMask: '[NUM]',
    expectedType: 'phone',
  },
  {
    input: 'Send details to student.help@example.com immediately',
    expectedMask: '[EMAIL]',
    expectedType: 'email',
  },
  {
    input: 'Application ID is 20268899 rejected by institute',
    expectedMask: '[NUM]',
    expectedType: 'number_run',
  },
];

for (const sample of positiveSamples) {
  const result = sanitiseText(sample.input);
  assert.strictEqual(result.hasPii, true, `Expected hasPii to be true for: "${sample.input}"`);
  assert.ok(result.maskedText.includes(sample.expectedMask), `Expected "${sample.expectedMask}" in "${result.maskedText}"`);
  assert.ok(result.piiTypes.includes(sample.expectedType), `Expected "${sample.expectedType}" in ${JSON.stringify(result.piiTypes)}`);
}

// Negative Test Cases (Must NOT be masked)
const negativeSamples = [
  'Application marked defective by institute nodal officer',
  'Income certificate document not clear',
  'Photograph blurred please re-upload',
  'Duplicate application detected at state level',
];

for (const sample of negativeSamples) {
  const result = sanitiseText(sample);
  assert.strictEqual(result.hasPii, false, `Expected hasPii=false for normal remark: "${sample}"`);
  assert.strictEqual(result.maskedText, sample, `Expected remark to remain identical: "${sample}"`);
  assert.strictEqual(result.piiTypes.length, 0);
}

console.log('✅ PII Sanitizer: All positive and negative test cases passed cleanly!');
