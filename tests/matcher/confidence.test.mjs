import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { scoreEntries } from '../../src/lib/matcher/scorer.ts';

console.log('🧪 Testing WAJAH Confidence Decisions & Documented Thresholds...');

const libraryFile = path.resolve('data/library.json');
const library = JSON.parse(fs.readFileSync(libraryFile, 'utf8'));

// 1. Confident Match: Score >= 0.85 AND lead >= 0.20
const confidentInput = 'Application marked defective by Institute Nodal Officer';
const confidentResult = scoreEntries(confidentInput, library);

assert.strictEqual(confidentResult.band, 'CONFIDENT', 'Expected CONFIDENT band');
assert.ok(confidentResult.topScore >= 0.85, `Expected topScore >= 0.85, got ${confidentResult.topScore}`);
assert.ok(confidentResult.lead >= 0.20, `Expected lead >= 0.20, got ${confidentResult.lead}`);
assert.ok(confidentResult.candidates.length >= 1);
assert.strictEqual(confidentResult.candidates[0].entry.id, 'nsp_defective_returned');

// 2. Ambiguous Match: Score >= 0.50 but lead < 0.20 (competing interpretations)
const ambiguousInput = 'Application pending for verification';
const ambiguousResult = scoreEntries(ambiguousInput, library);

assert.strictEqual(ambiguousResult.band, 'AMBIGUOUS', 'Expected AMBIGUOUS band due to close competition');
assert.ok(ambiguousResult.topScore >= 0.50, `Expected topScore >= 0.50, got ${ambiguousResult.topScore}`);
assert.ok(ambiguousResult.lead < 0.20, `Expected lead < 0.20, got ${ambiguousResult.lead}`);
assert.ok(ambiguousResult.candidates.length > 1, 'Expected multiple candidates for ambiguous remark');
assert.ok(ambiguousResult.candidates.length <= 3, 'Candidates count must not exceed 3');

// 3. Weak Match: Score < 0.50 (insufficient or weak evidence)
const weakInput = 'scholarship student name address checking';
const weakResult = scoreEntries(weakInput, library);

assert.strictEqual(weakResult.band, 'WEAK', 'Expected WEAK band for generic keywords without trigger');
assert.ok(weakResult.topScore < 0.50, `Expected topScore < 0.50, got ${weakResult.topScore}`);
assert.strictEqual(weakResult.candidates.length, 0, 'WEAK outcome must return 0 candidates');

// 4. Insufficient Evidence: Must not guess
const emptyResult = scoreEntries('', library);
assert.strictEqual(emptyResult.band, 'WEAK');
assert.strictEqual(emptyResult.topScore, 0);
assert.strictEqual(emptyResult.candidates.length, 0);

const spacesResult = scoreEntries('    ', library);
assert.strictEqual(spacesResult.band, 'WEAK');
assert.strictEqual(spacesResult.candidates.length, 0);

const stopWordsResult = scoreEntries('the is a an at by for in of on to and', library);
assert.strictEqual(stopWordsResult.band, 'WEAK');
assert.strictEqual(stopWordsResult.topScore, 0);
assert.strictEqual(stopWordsResult.candidates.length, 0);

const digitsResult = scoreEntries('9876543210 20261122 4545', library);
assert.strictEqual(digitsResult.band, 'WEAK');
assert.strictEqual(digitsResult.topScore, 0);
assert.strictEqual(digitsResult.candidates.length, 0);

console.log('✅ All Confidence Decision unit tests passed successfully.');

