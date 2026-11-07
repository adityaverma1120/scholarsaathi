import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { scoreEntries } from '../../src/lib/matcher/scorer.ts';

console.log('🧪 Testing WAJAH Matcher Scorer (Weights, Bonuses & Penalties)...');

const libraryFile = path.resolve('data/library.json');
const library = JSON.parse(fs.readFileSync(libraryFile, 'utf8'));

// 1. Exact Positive Trigger Match gives top score (1.0)
const exactResult = scoreEntries('Application marked defective by Institute Nodal Officer', library);
assert.strictEqual(exactResult.candidates[0].entry.id, 'nsp_defective_returned');
assert.strictEqual(exactResult.topScore, 1.0, 'Exact trigger match should score 1.0');

// 2. Keyword matching adds bonus to relevant entry
const keywordResult = scoreEntries('My scholarship form has a defect and needs resubmit', library);
assert.strictEqual(keywordResult.candidates[0].entry.id, 'nsp_defective_returned');
assert.ok(keywordResult.topScore >= 0.85);

// 3. Language variants matching: Hindi & Hinglish
const hindiResult = scoreEntries('संस्थान स्तर पर लंबित', library);
assert.strictEqual(hindiResult.candidates[0].entry.id, 'nsp_pending_institute');
assert.ok(hindiResult.topScore >= 0.85);

const hinglishResult = scoreEntries('college level par pending hai mera form', library);
assert.strictEqual(hinglishResult.candidates[0].entry.id, 'nsp_pending_institute');
assert.ok(hinglishResult.topScore >= 0.85);

// 4. Negative trigger penalty properly suppresses conflicting candidates
// "defective" is in negative_triggers of nsp_pending_institute
const conflictResult = scoreEntries('defective application', library);
assert.strictEqual(conflictResult.candidates[0].entry.id, 'nsp_defective_returned');
// nsp_pending_institute should NOT be candidate 1 or have a high score
const pendingCandidate = conflictResult.candidates.find(c => c.entry.id === 'nsp_pending_institute');
if (pendingCandidate) {
  assert.ok(pendingCandidate.score < 0.50, 'Negative trigger should suppress nsp_pending_institute');
}

// 5. Score clamping: score must never exceed 1.0 or fall below 0
for (const entry of library) {
  const result = scoreEntries(entry.what_the_screen_says, library);
  assert.ok(result.topScore >= 0 && result.topScore <= 1.0, `Score ${result.topScore} out of bounds [0, 1]`);
}

// 6. Top-3 Candidate Selection
const multiCandidateResult = scoreEntries('application pending for verification', library);
assert.ok(multiCandidateResult.candidates.length <= 3, 'Matcher should return at most 3 candidates');
assert.ok(multiCandidateResult.candidates.length > 0);

console.log('✅ All Matcher Scorer unit tests passed successfully.');

