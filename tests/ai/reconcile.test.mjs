import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { reconcileMatches } from '../../src/lib/ai/reconcile.ts';

console.log('🧪 Testing WAJAH Local vs AI Reconciliation Logic...');

const library = JSON.parse(fs.readFileSync(path.resolve('data/library.json'), 'utf8'));
const defectiveEntry = library.find(e => e.id === 'nsp_defective_returned');
const rejectedEntry = library.find(e => e.id === 'nsp_rejected_institute');
const pendingEntry = library.find(e => e.id === 'nsp_pending_institute');

assert.ok(defectiveEntry, 'defectiveEntry must exist in library');
assert.ok(rejectedEntry, 'rejectedEntry must exist in library');
assert.ok(pendingEntry, 'pendingEntry must exist in library');

// 1. Both Confident & Agree -> Auto-open card
{
  const localOutcome = {
    sanitisedInput: 'defective returned',
    band: 'CONFIDENT',
    topScore: 0.95,
    lead: 0.40,
    candidates: [{ entry: defectiveEntry, score: 0.95, matchedTriggers: ['defective', 'returned'] }],
  };
  const aiResult = {
    id: 'nsp_defective_returned',
    confidence: 0.92,
    alternatives: [],
    is_simulated: false,
  };

  const res = reconcileMatches(localOutcome, aiResult, library);
  assert.strictEqual(res.action, 'auto_open');
  assert.strictEqual(res.selectedEntryId, 'nsp_defective_returned');
  assert.strictEqual(res.match_path, 'both');
  assert.strictEqual(res.agreement, 'agree');
  assert.strictEqual(res.confidence_level, 'high');
  assert.ok(res.confidence_score >= 0.92);
}

// 2. Both Confident & Disagree -> Crucial Invariant: NEVER silently pick. Route to Disambiguation
{
  const localOutcome = {
    sanitisedInput: 'college rejected defective',
    band: 'CONFIDENT',
    topScore: 0.90,
    lead: 0.25,
    candidates: [{ entry: defectiveEntry, score: 0.90, matchedTriggers: ['defective'] }],
  };
  const aiResult = {
    id: 'nsp_rejected_institute',
    confidence: 0.88,
    alternatives: ['nsp_defective_returned'],
    is_simulated: false,
  };

  const res = reconcileMatches(localOutcome, aiResult, library);
  assert.strictEqual(res.action, 'choose', 'Disagreement must route to choose screen');
  assert.strictEqual(res.selectedEntryId, null, 'No entry should be auto-opened on conflict');
  assert.strictEqual(res.match_path, 'chosen');
  assert.strictEqual(res.agreement, 'disagree');
  assert.strictEqual(res.confidence_level, 'medium');
  assert.ok(res.candidates.some(c => c.id === 'nsp_defective_returned'));
  assert.ok(res.candidates.some(c => c.id === 'nsp_rejected_institute'));
}

// 3. Local Confident alone (AI failed or null) -> Auto-open local
{
  const localOutcome = {
    sanitisedInput: 'application marked defective',
    band: 'CONFIDENT',
    topScore: 0.92,
    lead: 0.30,
    candidates: [{ entry: defectiveEntry, score: 0.92, matchedTriggers: ['defective'] }],
  };

  const res = reconcileMatches(localOutcome, null, library);
  assert.strictEqual(res.action, 'auto_open');
  assert.strictEqual(res.selectedEntryId, 'nsp_defective_returned');
  assert.strictEqual(res.match_path, 'local');
  assert.strictEqual(res.agreement, 'local_only');
  assert.strictEqual(res.confidence_level, 'high');
}

// 4. Local Ambiguous + AI Confident -> Route to choose with AI suggestion placed first
{
  const localOutcome = {
    sanitisedInput: 'pending verification',
    band: 'AMBIGUOUS',
    topScore: 0.65,
    lead: 0.05,
    candidates: [
      { entry: defectiveEntry, score: 0.65, matchedTriggers: ['verification'] },
      { entry: pendingEntry, score: 0.60, matchedTriggers: ['pending'] },
    ],
  };
  const aiResult = {
    id: 'nsp_pending_institute',
    confidence: 0.86,
    alternatives: ['nsp_defective_returned'],
  };

  const res = reconcileMatches(localOutcome, aiResult, library);
  assert.strictEqual(res.action, 'choose');
  assert.strictEqual(res.match_path, 'ai');
  assert.strictEqual(res.agreement, 'ai_only');
  assert.strictEqual(res.candidates[0].id, 'nsp_pending_institute', 'AI candidate placed first');
}

// 5. Local Ambiguous alone -> Route to choose with local candidates
{
  const localOutcome = {
    sanitisedInput: 'verification pending',
    band: 'AMBIGUOUS',
    topScore: 0.70,
    lead: 0.05,
    candidates: [
      { entry: pendingEntry, score: 0.70, matchedTriggers: ['pending'] },
      { entry: defectiveEntry, score: 0.65, matchedTriggers: ['verification'] },
    ],
  };

  const res = reconcileMatches(localOutcome, null, library);
  assert.strictEqual(res.action, 'choose');
  assert.strictEqual(res.match_path, 'local');
  assert.strictEqual(res.agreement, 'local_only');
  assert.strictEqual(res.candidates.length, 2);
}

// 6. Both Weak / Unrelated -> Safe Uncertainty (no_match)
{
  const localOutcome = {
    sanitisedInput: 'cricket match score today',
    band: 'WEAK',
    topScore: 0.10,
    lead: 0,
    candidates: [],
  };
  const aiResult = {
    id: 'none',
    confidence: 0.10,
    alternatives: [],
  };

  const res = reconcileMatches(localOutcome, aiResult, library);
  assert.strictEqual(res.action, 'no_match');
  assert.strictEqual(res.selectedEntryId, null);
  assert.strictEqual(res.confidence_level, 'low');
}

console.log('✅ Local vs AI Reconciliation: All 6 branches and safety invariants verified!\n');

