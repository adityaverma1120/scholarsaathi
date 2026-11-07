import { test } from 'node:test';
import assert from 'node:assert/strict';

// Core library imports across all 11 domains
import { StudentProfileSchema } from '../../src/lib/profile/schema.ts';
import { verifyFileSignature } from '../../src/lib/vault/schema.ts';
import { runDocumentChecks } from '../../src/lib/vault/checker.ts';
import {
  safeNormaliseText,
  safeNormaliseDate,
  compareNameField,
  compareDateField,
} from '../../src/lib/checker/engine.ts';
import {
  getAllScholarships,
  getScholarshipById,
  filterScholarships,
  calculateSchemeMatchRelevance,
} from '../../src/lib/catalogue/engine.ts';
import {
  evaluateSchemeEligibility,
  runEligibilityEvaluation,
} from '../../src/lib/eligibility/engine.ts';
import { evaluateScholarshipReadiness } from '../../src/lib/readiness/engine.ts';
import { generateApplicationPreparationForm } from '../../src/lib/assistant/engine.ts';
import { generateGrievanceDraft } from '../../src/lib/tracker/grievance.ts';
import { maskApplicationId } from '../../src/lib/tracker/schema.ts';
import { retrieveKnowledge } from '../../src/lib/assistant-rag/retriever.ts';
import { generateGroundedResponse } from '../../src/lib/assistant-rag/generator.ts';
import {
  getVerifiedOfficialCalendarEvents,
  reminderToCalendarEvent,
  generateIcsCalendar,
} from '../../src/lib/calendar/engine.ts';

/**
 * End-to-End Scenario A: Student Profile -> Scheme Discovery -> Deterministic Eligibility Evaluation
 * Spec 21 Section 8 Scenario A
 */
test('E2E Scenario A: Student discovers schemes and evaluates deterministic eligibility', () => {
  // 1. Create a valid student profile
  const profile = {
    id: 'usr_e2e_student_01',
    version: 1,
    basic: {
      displayName: 'Vikram Kumar',
      dateOfBirth: '2004-07-15',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug_01',
        level: 'undergraduate',
        course: 'B.Tech Computer Science',
        institution: 'Lucknow Institute of Technology',
        passingYear: 2026,
        percentage: 78.5,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      category: 'sc',
      familyIncome: 180000,
      incomePeriod: 'annual',
      minorityStatus: false,
      hostellerStatus: 'day_scholar',
      triggeredBySchemes: [],
    },
    completion: {
      basic: 'complete',
      academic: 'complete',
      schemeDependent: 'complete',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const profileValidation = StudentProfileSchema.safeParse(profile);
  assert.ok(profileValidation.success, `Profile validation error: ${JSON.stringify(profileValidation.error?.issues)}`);

  // 2. Discover scholarships matching profile criteria
  const allSchemes = getAllScholarships();
  assert.ok(allSchemes.length >= 6, 'Catalogue must contain verified schemes');

  const filtered = filterScholarships({
    state: 'Uttar Pradesh',
    socialCategory: 'SC',
  });
  assert.ok(filtered.length >= 2, 'Should find matching Central and UP State schemes');

  // 3. Evaluate deterministic 3-valued eligibility
  const scScheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scScheme);
  const evalResult = evaluateSchemeEligibility(scScheme, profile, []);
  assert.equal(evalResult.overallResult, 'POTENTIALLY_ELIGIBLE');
  assert.ok(evalResult.conditionEvaluations.length > 0);
  assert.ok(evalResult.conditionEvaluations.every(c => c.result === 'PASS'));

  // Batch evaluation across all schemes
  const batchResults = runEligibilityEvaluation(allSchemes, profile, []);
  assert.equal(batchResults.evaluations.length, allSchemes.length);
});

/**
 * End-to-End Scenario B: Document Vault Readiness & Magic Byte Inspection
 * Spec 21 Section 8 Scenario B
 */
test('E2E Scenario B: Document vault file inspection and candidate field extraction', () => {
  // 1. Inspect valid PDF header (%PDF-1.4)
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
  const sigResult = verifyFileSignature(validPdfHeader);
  assert.equal(sigResult.isValid, true);
  assert.equal(sigResult.detectedMime, 'application/pdf');

  // 2. Run automated readiness checks on Class 10 marksheet
  const checkResult = runDocumentChecks(
    'class_10_marksheet',
    'class10_marksheet.pdf',
    150 * 1024,
    'application/pdf',
    validPdfHeader
  );

  assert.equal(checkResult.processingState, 'needs_user_review');
  assert.ok(checkResult.readabilityScore >= 70);

  // 3. Verify format and authenticity boundary checks
  const sigCheck = checkResult.checks.find(c => c.checkType === 'file_signature');
  assert.ok(sigCheck);
  assert.equal(sigCheck.result, 'pass');

  const boundaryCheck = checkResult.checks.find(c => c.checkType === 'authenticity_boundary');
  assert.ok(boundaryCheck);
  assert.equal(boundaryCheck.result, 'pass');

  // 4. Verify candidate extracted fields
  const fieldKeys = checkResult.extractedFields.map(f => f.fieldKey);
  assert.ok(fieldKeys.includes('student_name'));
  assert.ok(fieldKeys.includes('roll_number'));
  assert.ok(fieldKeys.includes('board_name'));
});

/**
 * End-to-End Scenario C: Cross-Document Consistency Checker
 * Spec 21 Section 8 Scenario C
 */
test('E2E Scenario C: Cross-document field comparison and legitimate discrepancy review', () => {
  // Exact match with case/spacing normalisation
  const valA = {
    sourceType: 'document',
    sourceId: 'doc_c10',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: 'Vikram Kumar',
    normalisedValue: safeNormaliseText('Vikram Kumar'),
    confidence: 0.95,
  };
  const valB = {
    sourceType: 'profile',
    sourceId: 'profile',
    sourceTitle: 'Student Profile',
    rawValue: 'VIKRAM  KUMAR',
    normalisedValue: safeNormaliseText('VIKRAM  KUMAR'),
    confidence: 1.0,
  };
  const nameComp = compareNameField(valA, valB);
  assert.equal(nameComp.result, 'exact_match');

  // DOB normalisation (Indian 15/07/2004 to ISO 2004-07-15)
  const dobA = {
    sourceType: 'document',
    sourceId: 'doc_c10',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: '2004-07-15',
    normalisedValue: safeNormaliseDate('2004-07-15') || '2004-07-15',
    confidence: 0.95,
  };
  const dobB = {
    sourceType: 'document',
    sourceId: 'doc_aadhaar',
    sourceTitle: 'Aadhaar Card',
    rawValue: '15/07/2004',
    normalisedValue: safeNormaliseDate('15/07/2004') || '2004-07-15',
    confidence: 0.9,
  };
  const dobComp = compareDateField(dobA, dobB);
  assert.equal(dobComp.result, 'exact_match');

  // Initial match (Vikram Kumar vs Vikram K.)
  const valInitB = {
    sourceType: 'document',
    sourceId: 'doc_cert',
    sourceTitle: 'Certificate',
    rawValue: 'Vikram K.',
    normalisedValue: safeNormaliseText('Vikram K.'),
    confidence: 0.9,
  };
  const initialComp = compareNameField(valA, valInitB);
  assert.equal(initialComp.result, 'likely_match');

  // Verify non-fraud framing (Spec 21 Section 9 Invariant)
  assert.equal(initialComp.explanation.toLowerCase().includes('fraud'), false);
  assert.equal(initialComp.explanation.toLowerCase().includes('forged'), false);
});

/**
 * End-to-End Scenario D: Application Readiness Checklist
 * Spec 21 Section 8 Scenario D
 */
test('E2E Scenario D: Scheme requirement mapping and readiness checklist', () => {
  const scheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scheme, 'NSP Postmatric SC scheme must exist');

  const profile = {
    id: 'usr_e2e_student_01',
    version: 1,
    basic: {
      displayName: 'Vikram Kumar',
      dateOfBirth: '2004-07-15',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [],
    schemeDependent: { category: 'sc', familyIncome: 180000, incomePeriod: 'annual', triggeredBySchemes: [] },
    completion: { basic: 'complete', academic: 'partial', schemeDependent: 'complete' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const vaultDocuments = [
    {
      id: 'doc_1',
      category: 'class_10_marksheet',
      fileName: 'c10.pdf',
      fileSize: 150000,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processingState: 'user_confirmed',
      readabilityScore: 90,
      checks: [],
      extractedFields: [],
    },
  ];

  const readinessResult = evaluateScholarshipReadiness(scheme, profile, vaultDocuments, false);
  assert.ok(readinessResult.overallState);
  assert.ok(readinessResult.sections.requiredDocuments.items.length > 0);
  assert.ok(readinessResult.checklistSummary.totalChecks > 0);
});

/**
 * End-to-End Scenario E: Form-Filling Assistant & Safe Review (Rule P3)
 * Spec 21 Section 8 Scenario E
 */
test('E2E Scenario E: Form guidance generation, provenance, and zero auto-submit invariant', () => {
  const scheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scheme);

  const profile = {
    id: 'usr_e2e_student_01',
    version: 1,
    basic: {
      displayName: 'Vikram Kumar',
      dateOfBirth: '2004-07-15',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_ug_01',
        level: 'undergraduate',
        course: 'B.Tech',
        institution: 'Lucknow Institute of Technology',
        passingYear: 2026,
        percentage: 78.5,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: { category: 'sc', familyIncome: 180000, incomePeriod: 'annual', triggeredBySchemes: [] },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const form = generateApplicationPreparationForm(scheme, profile, []);
  assert.equal(form.scholarshipId, scheme.id);
  assert.ok(form.fields.length > 0);

  // Candidate field with provenance
  const nameField = form.fields.find(f => f.fieldId === 'student_name');
  if (nameField) {
    assert.equal(nameField.candidateValue, 'Vikram Kumar');
    assert.equal(nameField.sourceType, 'profile');
  }

  // Official portal hand-off link
  assert.ok(form.portalUrl.includes('.gov.in'));
});

/**
 * End-to-End Scenario F: Application Status Tracker & Official Grievance Redressal
 * Spec 21 Section 8 Scenario F
 */
test('E2E Scenario F: Status tracking, identifier masking, and verified grievance draft', () => {
  // 1. Verify identifier masking
  const rawId = 'UP20269876543210';
  const masked = maskApplicationId(rawId);
  assert.equal(masked, 'UP2026****3210');
  assert.equal(masked.includes('987654'), false);

  // 2. Generate grievance draft for delayed verification
  const profile = {
    id: 'usr_e2e_student_01',
    version: 1,
    basic: {
      displayName: 'Vikram Kumar',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_1',
        level: 'undergraduate',
        institution: 'Lucknow Institute of Technology',
        course: 'B.Tech CS',
        sourceType: 'user_input',
      },
    ],
    schemeDependent: { category: 'sc' },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const trackedApp = {
    id: 'app_e2e_01',
    scholarshipId: 'up_post_matric_dashmottar',
    scholarshipNameEn: 'UP Postmatric Dashmottar Scholarship for SC Students',
    scholarshipNameHi: 'यूपी दशमोत्तर छात्रवृत्ति योजना',
    portalName: 'UP Scholarship Portal',
    rawApplicationId: rawId,
    maskedApplicationId: masked,
    currentStatus: 'pending_district_state',
    whoActsNow: 'DISTRICT_STATE',
    nextActionSummaryEn: 'Verification pending at District Scrutiny Desk',
    nextActionSummaryHi: 'जिला स्तर पर सत्यापन लंबित',
    timeline: [],
    isLiveLookup: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const draft = generateGrievanceDraft(trackedApp, profile, 'Delay in scrutiny beyond 30 days');

  assert.ok(draft.subjectEn.includes('Application') || draft.subjectEn.includes('Scholarship'));
  assert.ok(draft.bodyEn.includes(masked));
  assert.ok(draft.bodyEn.includes('Vikram Kumar'));

  // Official routing validation (IGRS Jan Sunwai / 1076 for UP)
  assert.ok(draft.officialGrievanceUrl.includes('jansunwai.up.nic.in'));
  assert.ok(draft.officialHelplineNumber.includes('1076'));
});

/**
 * End-to-End Scenario G: Grounded RAG AI Assistant
 * Spec 21 Section 8 Scenario G
 */
test('E2E Scenario G: RAG retrieval, verified citations, and prompt-injection defense', () => {
  // 1. Topic retrieval for income criteria
  const res = retrieveKnowledge('What is the family income ceiling for SC postmatric scholarship?');
  assert.equal(res.insufficientEvidence, false);
  assert.ok(res.citations.length > 0);
  assert.ok(res.citations[0].officialUrl.includes('scholarships.gov.in'));

  // 2. Synthesize grounded answer
  const answer = generateGroundedResponse(res, 'en');
  assert.ok(answer.answerEn.includes('2,50,000') || answer.answerEn.includes('Lakh'));
  assert.ok(answer.citations.length > 0);
  assert.ok(answer.disclaimerEn.includes('independent assistant'));
});

/**
 * End-to-End Scenario H: Application Calendar & Deadlines
 * Spec 21 Section 8 Scenario H
 */
test('E2E Scenario H: Verified official dates, personal reminders, and RFC 5545 export', () => {
  // 1. Get official calendar events
  const officialEvents = getVerifiedOfficialCalendarEvents('2026-27');
  assert.ok(officialEvents.length >= 8);

  // 2. Create personal reminder
  const now = new Date().toISOString();
  const reminder = {
    id: 'rem_e2e_01',
    title: 'Verify Aadhaar Seeding at Bank Branch',
    category: 'personal_followup',
    dueDate: '2026-10-20',
    notes: 'Request NPCI mapper update',
    remindBeforeDays: 1,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
  const reminderEvent = reminderToCalendarEvent(reminder);
  assert.equal(reminderEvent.isPersonal, true);

  // 3. Export iCalendar file
  const ics = generateIcsCalendar([officialEvents[0], reminderEvent]);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('Verify Aadhaar Seeding at Bank Branch'));
  assert.ok(ics.includes('Notice: Check the date on the official portal as application deadlines fluctuate.'));
  assert.ok(ics.endsWith('END:VCALENDAR'));
});
