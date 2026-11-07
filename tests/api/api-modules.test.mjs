import assert from 'node:assert';
import { db, getMondayOfWeek, addDays, getTodayDate } from '../../src/lib/server/db/index.ts';

console.log('🧪 Testing WAJAH Backend Database & API Modules...\n');

// Reset local DB state for deterministic testing
db._clear();

// 1. Database Status
const status = db.getStatus();
assert.strictEqual(status.storage, 'local_dev', 'Should indicate local_dev storage');
assert.strictEqual(status.connected, false, 'Should not claim external database is connected');
console.log('  ✓ Database status check passed (Local dev repository identified).');

// 2. Monday Week Bucket Calculation
const testDate = new Date('2026-11-04T12:00:00Z'); // Wednesday
const monday = getMondayOfWeek(testDate);
assert.strictEqual(monday, '2026-11-02', 'Wednesday 2026-11-04 should map to Monday 2026-11-02');
console.log('  ✓ Monday week-bucket computation passed.');

// 3. Match Events: Consent Gate & Validation
// Case 3a: Consent = false -> Must NOT insert into DB
const droppedEvent = db.insertMatchEvent({
  entry_id: 'nsp_defective_returned',
  fault_label: 'student',
  match_path: 'local',
  outcome: 'matched',
  consent: false,
});
assert.strictEqual(droppedEvent, null, 'Event without consent must be dropped');
assert.strictEqual(db._getState().match_events.length, 0, 'No event should be stored without consent');

// Case 3b: Consent = true -> Inserts successfully with UUID & week_start
const insertedEvent = db.insertMatchEvent({
  entry_id: 'nsp_defective_returned',
  fault_label: 'student',
  state_code: 'UP',
  match_path: 'local',
  outcome: 'matched',
  consent: true,
});
assert.ok(insertedEvent !== null);
assert.ok(insertedEvent.event_id, 'Must generate UUID event_id');
assert.strictEqual(insertedEvent.entry_id, 'nsp_defective_returned');
assert.strictEqual(insertedEvent.state_code, 'UP');
assert.strictEqual(insertedEvent.week_start, getMondayOfWeek());
assert.strictEqual(db._getState().match_events.length, 1);
console.log('  ✓ Match event opt-in consent gate and schema passed.');

// 4. Feedback: Category Validation & PII Sanitisation in Notes
// Case 4a: Invalid entry ID -> Throws error
assert.throws(() => {
  db.insertFeedback({
    entry_id: 'nsp_non_existent_fake_id',
    category: 'wrong_meaning',
    note: 'This is invalid',
  });
}, /Unknown library entry_id/);

// Case 4b: Valid entry with sensitive data in note -> PII must be masked
const feedbackResult = db.insertFeedback({
  entry_id: 'nsp_defective_returned',
  category: 'wrong_step',
  note: 'Contact student at 9876543210 or Aadhaar 2345 6789 0123 for step 2 correction',
});
assert.ok(feedbackResult.id);
assert.strictEqual(feedbackResult.created_on, getTodayDate());
assert.ok(!feedbackResult.note?.includes('9876543210'), 'Phone number must be masked in feedback note');
assert.ok(!feedbackResult.note?.includes('2345 6789 0123'), 'Aadhaar must be masked in feedback note');
assert.ok(feedbackResult.note?.includes('[NUM]') || feedbackResult.note?.includes('[ID]'), 'Masking tokens must be present');
assert.strictEqual(db._getState().feedback.length, 1);
console.log('  ✓ Feedback entry validation and note PII masking passed.');

// 5. Miss Log: 30-day Retention & Explicit Consent
// Case 5a: Miss log requires consent
assert.throws(() => {
  db.insertMissLog({
    text_masked: 'sample unrecognised remark',
    consent: false,
  });
});

// Case 5b: Valid miss log insertion with 30-day expiry
const missResult = db.insertMissLog({
  text_masked: 'Application pending for scholarship review with phone 9988776655',
  consent: true,
});
assert.ok(missResult.id);
assert.strictEqual(missResult.created_on, getTodayDate());
assert.strictEqual(missResult.expires_at, addDays(getTodayDate(), 30), 'Expiry must be exactly 30 days');
assert.ok(!missResult.text_masked.includes('9988776655'), 'Server must re-sanitise miss log text');
assert.strictEqual(db._getState().miss_log.length, 1);
console.log('  ✓ Miss log creation, re-sanitisation and 30-day expiry passed.');

// 6. Retention Cleanup (Purge Expired Rows)
// Simulate expired miss log (created 35 days ago, expired 5 days ago)
const state = db._getState();
state.miss_log.push({
  id: 'expired-miss-uuid',
  created_on: addDays(getTodayDate(), -35),
  expires_at: addDays(getTodayDate(), -5),
  text_masked: 'old expired remark',
});
state.match_events.push({
  event_id: 'old-event-uuid',
  week_start: addDays(getTodayDate(), -400), // > 12 months ago
  entry_id: 'nsp_defective_returned',
  fault_label: 'student',
  state_code: null,
  match_path: 'local',
  outcome: 'matched',
});
db._saveState(state);

const purgeSummary = db.purgeExpired(getTodayDate());
assert.strictEqual(purgeSummary.purgedMisses, 1, 'Expired miss log should be purged');
assert.strictEqual(purgeSummary.purgedEvents, 1, 'Event older than 12 months should be purged');
console.log('  ✓ Data retention purge jobs passed (30-day miss & 12-month event cleanup).');

// 7. Dashboard Aggregation & k-Anonymity Suppression (k >= 10)
// With only 1 live event, counts are < 10, so live aggregation must suppress cells
const liveSuppressedData = db.getDashboardData(false);
assert.strictEqual(liveSuppressedData.mock, false);
assert.strictEqual(liveSuppressedData.min_group_size, 10);
const topItem = liveSuppressedData.top_confusing_messages[0];
assert.strictEqual(topItem.suppressed, true, 'Group count < 10 must have suppressed=true');
assert.strictEqual(topItem.count, null, 'Suppressed count must be null');
assert.strictEqual(topItem.count_display, '< 10', 'Suppressed display must be "< 10"');

// Mock data test: ensure mock banner is present
const mockData = db.getDashboardData(true);
assert.strictEqual(mockData.mock, true);
assert.ok(mockData.notice.includes('MOCK DATA'), 'Mock data must include prominent MOCK DATA notice');
console.log('  ✓ Dashboard k-anonymity suppression and MOCK DATA labeling passed.');

console.log('\n🎉 ALL DATABASE AND BACKEND MODULE TESTS PASSED CLEANLY!\n');
