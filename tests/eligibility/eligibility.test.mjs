import assert from 'node:assert';
import {
  evaluateSchemeEligibility,
  runEligibilityEvaluation,
  CURRENT_RULESET_VERSION,
} from '../../src/lib/eligibility/engine.ts';
import {
  ConditionStatusSchema,
  OverallEligibilityStatusSchema,
  EvaluateEligibilityRequestSchema,
} from '../../src/lib/eligibility/schema.ts';
import { getAllScholarships, getScholarshipById } from '../../src/lib/catalogue/engine.ts';

console.log('🧪 Testing Deterministic Scholarship Eligibility Engine (Phase 6)...');

// 1. Schema Validation & 3-Valued Logic Enums
console.log('  Testing Schema Definitions & 3-Valued Outcome Enums...');
{
  assert.strictEqual(ConditionStatusSchema.safeParse('PASS').success, true);
  assert.strictEqual(ConditionStatusSchema.safeParse('FAIL').success, true);
  assert.strictEqual(ConditionStatusSchema.safeParse('UNKNOWN').success, true);
  assert.strictEqual(ConditionStatusSchema.safeParse('MAYBE').success, false);

  assert.strictEqual(OverallEligibilityStatusSchema.safeParse('POTENTIALLY_ELIGIBLE').success, true);
  assert.strictEqual(OverallEligibilityStatusSchema.safeParse('NEEDS_INFORMATION').success, true);
  assert.strictEqual(OverallEligibilityStatusSchema.safeParse('NOT_ELIGIBLE').success, true);
  assert.strictEqual(OverallEligibilityStatusSchema.safeParse('UNVERIFIED').success, true);
  assert.strictEqual(OverallEligibilityStatusSchema.safeParse('GUARANTEED').success, false);
}

// 2. Full Match / POTENTIALLY_ELIGIBLE Scenario
console.log('  Testing Full Match Scenario (POTENTIALLY_ELIGIBLE)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null, 'nsp_post_matric_sc scheme must exist');

  const eligibleStudent = {
    id: 'student_sc_01',
    version: 1,
    basic: {
      displayName: 'Rahul Kumar',
      dateOfBirth: '2004-05-15',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Varanasi',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug_01',
        level: 'undergraduate',
        course: 'B.Tech Computer Science',
        institution: 'KNIT Sultanpur',
        passingYear: 2027,
        percentage: 82.5,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 180000,
      incomePeriod: 'annual',
      category: 'sc',
      minorityStatus: false,
      hostellerStatus: 'hosteller',
      triggeredBySchemes: ['nsp_post_matric_sc'],
    },
    completion: {
      basic: 'complete',
      academic: 'complete',
      schemeDependent: 'complete',
    },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(scScheme, eligibleStudent);

  assert.strictEqual(result.overallResult, 'POTENTIALLY_ELIGIBLE');
  assert.strictEqual(result.failedCount, 0);
  assert.strictEqual(result.unknownCount, 0);
  assert.ok(result.passedCount >= 4, `Expected at least 4 passed conditions, got ${result.passedCount}`);
  assert.strictEqual(result.missingFields.length, 0);
  assert.strictEqual(result.ruleSetVersion, CURRENT_RULESET_VERSION);
}

// 3. Income Ceiling Failure Scenario (NOT_ELIGIBLE)
console.log('  Testing Income Ceiling Failure (NOT_ELIGIBLE)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  const highIncomeStudent = {
    id: 'student_high_income',
    version: 1,
    basic: {
      displayName: 'Amit SC',
      domicileState: 'Delhi',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug',
        level: 'undergraduate',
        percentage: 85,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 350000, // Exceeds 250,000 ceiling
      incomePeriod: 'annual',
      category: 'sc',
      triggeredBySchemes: [],
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(scScheme, highIncomeStudent);

  assert.strictEqual(result.overallResult, 'NOT_ELIGIBLE');
  assert.ok(result.failedCount >= 1);
  assert.ok(result.failedReasonsEn.some(r => r.includes('exceeds the scheme maximum limit') || r.includes('exceeds the ceiling')));

  const incomeCond = result.conditionEvaluations.find(c => c.conditionType === 'income_ceiling');
  assert.ok(incomeCond !== null);
  assert.strictEqual(incomeCond?.result, 'FAIL');
}

// 4. Social Category Mismatch Scenario (NOT_ELIGIBLE)
console.log('  Testing Category Mismatch Scenario (NOT_ELIGIBLE)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  const generalStudent = {
    id: 'student_gen',
    version: 1,
    basic: {
      displayName: 'Priya Sharma',
      domicileState: 'Uttar Pradesh',
      preferredLanguage: 'hi',
    },
    academicRecords: [
      {
        id: 'rec_ug',
        level: 'undergraduate',
        percentage: 90,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 120000,
      incomePeriod: 'annual',
      category: 'general', // SC required
      triggeredBySchemes: [],
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(scScheme, generalStudent);

  assert.strictEqual(result.overallResult, 'NOT_ELIGIBLE');
  const catCond = result.conditionEvaluations.find(c => c.conditionType === 'category');
  assert.ok(catCond !== null);
  assert.strictEqual(catCond?.result, 'FAIL');
  assert.ok(catCond?.explanationEn.includes('GENERAL'));
}

// 5. State Domicile Mismatch for State Scheme (NOT_ELIGIBLE)
console.log('  Testing State Domicile Mismatch for State Scheme...');
{
  const upScheme = getScholarshipById('up_post_matric_dashmottar');
  assert.ok(upScheme !== null);

  const biharStudent = {
    id: 'student_bihar',
    version: 1,
    basic: {
      displayName: 'Vikram Singh',
      domicileState: 'Bihar', // Scheme is UP only
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug',
        level: 'undergraduate',
        percentage: 75,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 150000,
      incomePeriod: 'annual',
      category: 'obc',
      triggeredBySchemes: [],
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(upScheme, biharStudent);

  assert.strictEqual(result.overallResult, 'NOT_ELIGIBLE');
  const stateCond = result.conditionEvaluations.find(c => c.conditionType === 'domicile_state');
  assert.ok(stateCond !== null);
  assert.strictEqual(stateCond?.result, 'FAIL');
  assert.ok(stateCond?.explanationEn.includes('Uttar Pradesh'));
}

// 6. Minimum Marks Condition: Below Threshold vs Above Threshold
console.log('  Testing Minimum Marks Evaluation...');
{
  const mcmScheme = getScholarshipById('nsp_merit_cum_means_minority');
  assert.ok(mcmScheme !== null);

  // Subcase A: Score below 50%
  const lowMarksStudent = {
    id: 'student_mcm_low',
    version: 1,
    basic: {
      displayName: 'Farhan',
      domicileState: 'Kerala',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug',
        level: 'undergraduate',
        percentage: 46.5, // Below 50%
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 150000,
      minorityStatus: true,
      category: 'minority',
      triggeredBySchemes: [],
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const lowResult = evaluateSchemeEligibility(mcmScheme, lowMarksStudent);
  assert.strictEqual(lowResult.overallResult, 'NOT_ELIGIBLE');
  const marksCond = lowResult.conditionEvaluations.find(c => c.conditionType === 'minimum_marks');
  assert.ok(marksCond !== null);
  assert.strictEqual(marksCond?.result, 'FAIL');

  // Subcase B: Score above 50%
  const highMarksStudent = {
    ...lowMarksStudent,
    academicRecords: [
      {
        id: 'rec_ug',
        level: 'undergraduate',
        percentage: 68.0,
        sourceType: 'user_input',
      },
    ],
  };

  const highResult = evaluateSchemeEligibility(mcmScheme, highMarksStudent);
  assert.strictEqual(highResult.overallResult, 'POTENTIALLY_ELIGIBLE');
}

// 7. Missing Information / Invariant: Missing Value Is NEVER a Pass
console.log('  Testing Missing Information Invariant (NEEDS_INFORMATION)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  // Student with empty profile: no category, no income, no state
  const emptyStudent = {
    id: 'student_empty',
    version: 1,
    basic: {
      displayName: 'New Student',
      preferredLanguage: 'en',
    },
    academicRecords: [],
    schemeDependent: undefined,
    completion: { basic: 'partial', academic: 'not_started', schemeDependent: 'not_started' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(scScheme, emptyStudent);

  // Must NEVER be POTENTIALLY_ELIGIBLE when mandatory data is missing!
  assert.strictEqual(result.overallResult, 'NEEDS_INFORMATION');
  assert.ok(result.unknownCount > 0);
  assert.strictEqual(result.failedCount, 0);
  assert.ok(result.missingFields.length >= 3, `Expected at least 3 missing fields, got: ${result.missingFields.join(', ')}`);
}

// 8. Stale or Unverified Scheme Invariant (Spec 08 Section 5)
console.log('  Testing Unverified Scheme Invariant (UNVERIFIED)...');
{
  const baseScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(baseScheme !== null);

  const unverifiedScheme = {
    ...baseScheme,
    id: 'scheme_unverified_mock',
    officialSource: {
      ...baseScheme.officialSource,
      reviewStatus: 'under_review', // Not verified!
    },
  };

  const eligibleStudent = {
    id: 'student_perfect',
    version: 1,
    basic: { displayName: 'Student', domicileState: 'Delhi', preferredLanguage: 'en' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 95 }],
    schemeDependent: { familyIncome: 100000, category: 'sc' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const result = evaluateSchemeEligibility(unverifiedScheme, eligibleStudent);
  assert.strictEqual(result.overallResult, 'UNVERIFIED', 'Unverified scheme must never return a positive match');
}

// 9. Batch Evaluation Across All Curated Schemes
console.log('  Testing Batch Evaluation Runner Across All Bundled Schemes...');
{
  const student = {
    id: 'student_batch_test',
    version: 1,
    basic: { displayName: 'Pooja Verma', domicileState: 'Uttar Pradesh', preferredLanguage: 'hi' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 76.5 }],
    schemeDependent: { familyIncome: 200000, category: 'obc' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const batch = runEligibilityEvaluation(student);

  assert.ok(batch.evaluations.length >= 6);
  assert.strictEqual(batch.ruleSetVersion, CURRENT_RULESET_VERSION);
  assert.strictEqual(batch.summary.totalEvaluated, batch.evaluations.length);

  const sumCategories =
    batch.summary.potentiallyEligible +
    batch.summary.needsInformation +
    batch.summary.notEligible +
    batch.summary.unverified;

  assert.strictEqual(sumCategories, batch.summary.totalEvaluated);

  // Each evaluation must have valid official source URL and citations
  for (const evaluation of batch.evaluations) {
    assert.ok(evaluation.officialSourceUrl.startsWith('http'));
    assert.ok(evaluation.applicationUrl.startsWith('http'));
    for (const cond of evaluation.conditionEvaluations) {
      assert.ok(cond.sourceReference.length > 5, `Condition ${cond.conditionId} missing source reference`);
      assert.ok(cond.explanationEn.length > 5, `Condition ${cond.conditionId} missing English explanation`);
      assert.ok(cond.explanationHi.length > 5, `Condition ${cond.conditionId} missing Hindi explanation`);
    }
  }
}

// 10. API Request Schema Validation
console.log('  Testing API Request Schema Validation...');
{
  const validPayload = {
    scholarshipIds: ['nsp_post_matric_sc'],
    academicYear: '2026-27',
  };
  const parseSuccess = EvaluateEligibilityRequestSchema.safeParse(validPayload);
  assert.strictEqual(parseSuccess.success, true);

  const invalidYearPayload = {
    academicYear: 'invalid-year',
  };
  const parseFail = EvaluateEligibilityRequestSchema.safeParse(invalidYearPayload);
  assert.strictEqual(parseFail.success, false);
}

console.log('✅ Deterministic Scholarship Eligibility Engine: All tests passed cleanly!\n');

