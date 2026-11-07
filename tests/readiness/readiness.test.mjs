import assert from 'node:assert';
import {
  evaluateScholarshipReadiness,
  evaluateAllScholarshipsReadiness,
} from '../../src/lib/readiness/engine.ts';
import {
  DocumentMatchingOutcomeSchema,
  ReadinessStateSchema,
  ScholarshipReadinessReportSchema,
  EvaluateReadinessRequestSchema,
} from '../../src/lib/readiness/schema.ts';
import { getScholarshipById, getAllScholarships } from '../../src/lib/catalogue/engine.ts';

console.log('🧪 Testing Scholarship Document Matching & Application Readiness (Phase 7)...');

// 1. Schema & Enum Validation
console.log('  Testing Schema Definitions & Outcome Enums...');
{
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('AVAILABLE').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('MISSING').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('NEEDS_REVIEW').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('POTENTIAL_MISMATCH').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('EXPIRED_OR_OUTDATED').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('UNKNOWN').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('NOT_APPLICABLE').success, true);
  assert.strictEqual(DocumentMatchingOutcomeSchema.safeParse('INVALID').success, false);

  assert.strictEqual(ReadinessStateSchema.safeParse('NOT_STARTED').success, true);
  assert.strictEqual(ReadinessStateSchema.safeParse('IN_PROGRESS').success, true);
  assert.strictEqual(ReadinessStateSchema.safeParse('BLOCKED').success, true);
  assert.strictEqual(ReadinessStateSchema.safeParse('READY_FOR_STUDENT_REVIEW').success, true);
  assert.strictEqual(ReadinessStateSchema.safeParse('STUDENT_CONFIRMED_READY').success, true);
  assert.strictEqual(ReadinessStateSchema.safeParse('APPROVED').success, false);
}

// 2. Full Ready Scenario: All documents available, eligible, consistent
console.log('  Testing Full Ready Scenario (READY_FOR_STUDENT_REVIEW & STUDENT_CONFIRMED_READY)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  const eligibleStudent = {
    id: 'student_ready_01',
    version: 1,
    basic: {
      displayName: 'Rahul Kumar',
      dateOfBirth: '2004-05-15',
      domicileState: 'Uttar Pradesh',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_1',
        level: 'undergraduate',
        course: 'B.Tech',
        percentage: 84.0,
      },
    ],
    schemeDependent: {
      familyIncome: 180000,
      incomePeriod: 'annual',
      category: 'sc',
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const completeDocs = [
    { id: 'd1', category: 'class_10_marksheet', originalFileName: '10th_marksheet.pdf', fileSize: 500000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 92, extractedFields: [] },
    { id: 'd2', category: 'caste_certificate', originalFileName: 'caste_cert.pdf', fileSize: 450000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 88, extractedFields: [] },
    { id: 'd3', category: 'income_certificate', originalFileName: 'income_cert.pdf', fileSize: 420000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 89, extractedFields: [] },
    { id: 'd4', category: 'bank_passbook', originalFileName: 'bank_passbook.pdf', fileSize: 600000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 85, extractedFields: [] },
    { id: 'd5', category: 'bonafide_certificate', originalFileName: 'bonafide.pdf', fileSize: 350000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 90, extractedFields: [] },
    { id: 'd6', category: 'fee_receipt', originalFileName: 'fee_receipt.pdf', fileSize: 300000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 91, extractedFields: [] },
  ];

  // Evaluate unconfirmed
  const report = evaluateScholarshipReadiness(scScheme, eligibleStudent, completeDocs, false);

  assert.strictEqual(report.overallState, 'READY_FOR_STUDENT_REVIEW');
  assert.strictEqual(report.blockers.length, 0);
  assert.strictEqual(report.sections.requiredDocuments.missingCount, 0);
  assert.strictEqual(report.sections.eligibility.status, 'PASS');
  assert.strictEqual(report.sections.profileCompleteness.status, 'COMPLETE');

  // Verify schema compliance
  const parsed = ScholarshipReadinessReportSchema.safeParse(report);
  assert.strictEqual(parsed.success, true);

  // Evaluate with student confirmation
  const confirmedReport = evaluateScholarshipReadiness(scScheme, eligibleStudent, completeDocs, true);
  assert.strictEqual(confirmedReport.overallState, 'STUDENT_CONFIRMED_READY');
  assert.strictEqual(confirmedReport.sections.studentReview.isConfirmed, true);
}

// 3. Missing Mandatory Document Scenario (BLOCKED)
console.log('  Testing Missing Mandatory Document Scenario (BLOCKED)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  const eligibleStudent = {
    id: 'student_missing_doc',
    version: 1,
    basic: { displayName: 'Sunil SC', domicileState: 'Delhi', preferredLanguage: 'en' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 75.0 }],
    schemeDependent: { familyIncome: 120000, category: 'sc' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  // Missing income_certificate
  const partialDocs = [
    { id: 'd1', category: 'class_10_marksheet', originalFileName: '10th.pdf', fileSize: 500000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 90, extractedFields: [] },
    { id: 'd2', category: 'caste_certificate', originalFileName: 'caste.pdf', fileSize: 400000, mimeType: 'application/pdf', processingState: 'processed', readabilityScore: 85, extractedFields: [] },
  ];

  const report = evaluateScholarshipReadiness(scScheme, eligibleStudent, partialDocs);

  assert.strictEqual(report.overallState, 'BLOCKED');
  assert.ok(report.blockers.length >= 1);
  const incomeBlocker = report.blockers.find(b => b.id.includes('income_certificate'));
  assert.ok(incomeBlocker !== undefined, 'Must flag missing income certificate as blocker');
  assert.strictEqual(incomeBlocker?.actionUrl, '/vault');

  const incomeDocItem = report.sections.requiredDocuments.items.find(i => i.category === 'income_certificate');
  assert.strictEqual(incomeDocItem?.outcome, 'MISSING');
}

// 4. Ineligible Criteria Scenario (BLOCKED)
console.log('  Testing Ineligible Criteria Blocker Scenario (BLOCKED)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  // Student income exceeds 250,000 ceiling
  const highIncomeStudent = {
    id: 'student_ineligible',
    version: 1,
    basic: { displayName: 'Rahul', domicileState: 'Uttar Pradesh', preferredLanguage: 'en' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 80.0 }],
    schemeDependent: { familyIncome: 500000, category: 'sc' }, // Exceeds ceiling
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const report = evaluateScholarshipReadiness(scScheme, highIncomeStudent, []);

  assert.strictEqual(report.overallState, 'BLOCKED');
  const eligBlocker = report.blockers.find(b => b.id === 'blocker_eligibility_ineligible');
  assert.ok(eligBlocker !== undefined);
  assert.strictEqual(report.sections.eligibility.status, 'FAIL');
}

// 5. Conditional Document Exemption: Caste Certificate for General Category
console.log('  Testing Conditional Document Exemption (NOT_APPLICABLE)...');
{
  const upScheme = getScholarshipById('up_post_matric_dashmottar');
  assert.ok(upScheme !== null);

  const generalStudent = {
    id: 'student_gen_up',
    version: 1,
    basic: { displayName: 'Aakash Sharma', domicileState: 'Uttar Pradesh', preferredLanguage: 'hi' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 70.0 }],
    schemeDependent: { familyIncome: 150000, category: 'general' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const report = evaluateScholarshipReadiness(upScheme, generalStudent, []);
  const casteDocItem = report.sections.requiredDocuments.items.find(i => i.category === 'caste_certificate');

  assert.ok(casteDocItem !== undefined);
  assert.strictEqual(casteDocItem?.outcome, 'NOT_APPLICABLE');
  assert.strictEqual(casteDocItem?.requirement.isMandatory, false);
}

// 6. Unconfirmed OCR Document Extraction (NEEDS_REVIEW)
console.log('  Testing Unconfirmed OCR Extraction (NEEDS_REVIEW)...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme !== null);

  const student = {
    id: 'student_review',
    version: 1,
    basic: { displayName: 'Anita', domicileState: 'Delhi', preferredLanguage: 'en' },
    academicRecords: [{ id: '1', level: 'undergraduate', percentage: 72.0 }],
    schemeDependent: { familyIncome: 120000, category: 'sc' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const docsNeedingReview = [
    {
      id: 'd1',
      category: 'class_10_marksheet',
      originalFileName: 'marksheet.pdf',
      fileSize: 400000,
      mimeType: 'application/pdf',
      processingState: 'needs_user_review', // Unconfirmed candidate fields!
      readabilityScore: 55, // Low readability score
      extractedFields: [],
    },
  ];

  const report = evaluateScholarshipReadiness(scScheme, student, docsNeedingReview);
  const marksheetItem = report.sections.requiredDocuments.items.find(i => i.category === 'class_10_marksheet');

  assert.strictEqual(marksheetItem?.outcome, 'NEEDS_REVIEW');
  assert.ok(report.warnings.some(w => w.id.includes('warn_doc_review') || w.id.includes('warn_doc_readability')));
}

// 7. Score Transparency Invariant (Spec 09 Section 4)
console.log('  Testing Score Transparency & Explanation Invariant...');
{
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  const report = evaluateScholarshipReadiness(scScheme, null, null);

  assert.ok(report.readinessScoreFormula.includes('mandatory checklist domains'));
  assert.ok(report.readinessScoreFormula.includes('never uses an arbitrary percentage score'));
}

// 8. Batch Evaluation Runner Across All Curated Scholarships
console.log('  Testing Batch Evaluation Across All Curated Schemes...');
{
  const reports = evaluateAllScholarshipsReadiness(null, null);
  assert.strictEqual(reports.length, getAllScholarships().length);
  assert.ok(reports.length >= 6);

  for (const rep of reports) {
    assert.strictEqual(rep.academicYear, '2026-27');
    assert.ok(rep.sections.requiredDocuments.totalRequired > 0);
    assert.ok(rep.readinessId.startsWith('rdn_'));
  }
}

// 9. API Request Schema Validation
console.log('  Testing API Request Schema Validation...');
{
  const validRequest = {
    scholarshipId: 'nsp_post_matric_sc',
    studentNotes: 'Ready for submission.',
  };
  const parsed = EvaluateReadinessRequestSchema.safeParse(validRequest);
  assert.strictEqual(parsed.success, true);
}

console.log('✅ Scholarship Document Matching & Application Readiness: All tests passed cleanly!\n');
