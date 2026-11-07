import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APPLICATION_STATUS_CATEGORIES,
  ACTION_ACTORS,
  STATUS_INPUT_METHODS,
  maskApplicationId,
  TrackedApplicationSchema,
  CreateTrackedApplicationRequestSchema,
  UpdateApplicationStatusRequestSchema,
} from '../../src/lib/tracker/schema.ts';
import { generateGrievanceDraft } from '../../src/lib/tracker/grievance.ts';

test('Tracker Schema - maskApplicationId privacy guard', () => {
  assert.equal(maskApplicationId(''), 'APP-NOT-SET');
  assert.equal(maskApplicationId('   '), 'APP-NOT-SET');
  assert.equal(maskApplicationId('1234'), '1234');
  assert.equal(maskApplicationId('123456'), '12***56');
  assert.equal(maskApplicationId('UP202612345678'), 'UP2026****5678');
  assert.equal(maskApplicationId('NSP202699887766'), 'NSP202****7766');
});

test('Tracker Schema - APPLICATION_STATUS_CATEGORIES enum coverage', () => {
  const expectedStatuses = [
    'drafting',
    'ready_to_apply',
    'submitted_pending_institute',
    'pending_district_state',
    'defective_correction_needed',
    'rejected',
    'sanctioned_payment_pending',
    'payment_disbursed',
    'unknown',
  ];

  for (const status of expectedStatuses) {
    assert.ok(
      APPLICATION_STATUS_CATEGORIES.includes(status),
      `Expected status category "${status}" to be supported`
    );
  }
  assert.equal(APPLICATION_STATUS_CATEGORIES.length, 9);
});

test('Tracker Schema - ACTION_ACTORS and STATUS_INPUT_METHODS', () => {
  assert.deepEqual(ACTION_ACTORS, ['STUDENT', 'INSTITUTE', 'DISTRICT_STATE', 'BANK', 'PORTAL']);
  assert.deepEqual(STATUS_INPUT_METHODS, [
    'manual_selection',
    'pasted_remark',
    'screenshot_ocr',
    'official_portal_export',
  ]);
});

test('Tracker Schema - TrackedApplicationSchema validation and invariants', () => {
  const validApp = {
    id: 'app_nsp_post_matric_sc_12345',
    scholarshipId: 'nsp_post_matric_sc',
    scholarshipCode: 'NSP-PMS-SC',
    scholarshipNameEn: 'Post Matric Scholarships Scheme for SC',
    scholarshipNameHi: 'अनुसूचित जाति के छात्रों के लिए मैट्रिक-उपरांत छात्रवृत्ति',
    portalName: 'National Scholarship Portal (NSP)',
    portalUrl: 'https://scholarships.gov.in',
    academicYear: '2026-27',
    maskedApplicationId: 'NSP2026****1234',
    currentStatus: 'submitted_pending_institute',
    statusLabelEn: 'Submitted — Pending Institute Verification',
    statusLabelHi: 'जमा किया गया — संस्थान सत्यापन हेतु लंबित',
    whoActs: 'INSTITUTE',
    currentFixCardId: 'nsp_defective_returned',
    inputMethod: 'manual_selection',
    isLiveLookup: false, // Invariant: always false for student-recorded entries (Spec 12 Section 4)
    timelineEvents: [
      {
        id: 'evt_1',
        status: 'submitted_pending_institute',
        statusLabelEn: 'Submitted — Pending Institute Verification',
        statusLabelHi: 'जमा किया गया — संस्थान सत्यापन हेतु लंबित',
        recordedAt: '2026-11-06T12:00:00.000Z',
        rawRemark: 'Application submitted on portal',
        whoActs: 'INSTITUTE',
        notes: 'Submitted hard copy to college desk',
        inputMethod: 'manual_selection',
      },
    ],
    nextActionEn: 'Submit printed form and document copies to your College Nodal Officer.',
    nextActionHi: 'कॉलेज नोडल अधिकारी के पास आवेदन की प्रति एवं दस्तावेज़ जमा करें।',
    officialHelpdeskUrl: 'https://scholarships.gov.in',
    officialGrievanceUrl: 'https://pgportal.gov.in',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
  };

  const parsed = TrackedApplicationSchema.safeParse(validApp);
  assert.ok(parsed.success, 'Valid tracked application should pass validation');

  // Must reject invalid academic year regex
  const invalidYear = { ...validApp, academicYear: '2026-2027' };
  assert.ok(!TrackedApplicationSchema.safeParse(invalidYear).success);

  // Must reject live tracking claim (Spec 12 Section 4)
  const invalidLive = { ...validApp, isLiveLookup: true };
  assert.ok(!TrackedApplicationSchema.safeParse(invalidLive).success);
});

test('Tracker Grievance - Central NSP draft routing and verified escalation details', () => {
  const centralApp = {
    id: 'app_nsp_1',
    scholarshipId: 'nsp_post_matric_sc',
    scholarshipCode: 'NSP-PMS-SC',
    scholarshipNameEn: 'Post Matric Scholarships Scheme for SC Students',
    scholarshipNameHi: 'अनुसूचित जाति के छात्रों हेतु मैट्रिक-उपरांत छात्रवृत्ति',
    portalName: 'National Scholarship Portal (NSP)',
    portalUrl: 'https://scholarships.gov.in',
    academicYear: '2026-27',
    maskedApplicationId: 'NSP2026****7890',
    currentStatus: 'defective_correction_needed',
    statusLabelEn: 'Defective — Returned by Institute',
    statusLabelHi: 'दोषपूर्ण — संस्थान द्वारा वापस',
    whoActs: 'STUDENT',
    currentFixCardId: 'nsp_defective_returned',
    inputMethod: 'pasted_remark',
    isLiveLookup: false,
    timelineEvents: [],
    nextActionEn: 'Review defect and re-submit on NSP portal.',
    nextActionHi: 'त्रुटि की समीक्षा करें और पुनः जमा करें।',
    officialHelpdeskUrl: 'https://scholarships.gov.in',
    officialGrievanceUrl: 'https://pgportal.gov.in',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
  };

  const profile = {
    id: 'test_prof',
    basic: {
      displayName: 'Aditya Verma',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec_1',
        educationLevel: 'post_matric',
        institution: 'University of Lucknow',
        course: 'B.Tech Computer Science',
        passingYear: 2026,
        isFresh: true,
      },
    ],
    updatedAt: '2026-11-06T12:00:00.000Z',
  };

  const draft = generateGrievanceDraft(centralApp, profile, 'Bonafide certificate stamp was faint');

  // Verify official routing
  assert.equal(draft.portalName, 'National Scholarship Portal (NSP)');
  assert.equal(draft.officialGrievanceUrl, 'https://pgportal.gov.in');
  assert.equal(draft.officialHelpdeskEmail, 'helpdesk@nsp.gov.in');
  assert.equal(draft.officialHelplineNumber, '0120-6619540 (NSP Central Helpdesk)');

  // Verify bilingual output
  assert.ok(draft.subjectEn.includes('NSP2026****7890'));
  assert.ok(draft.subjectHi.includes('NSP2026****7890'));
  assert.ok(draft.bodyEn.includes('Aditya Verma'));
  assert.ok(draft.bodyEn.includes('University of Lucknow'));
  assert.ok(draft.bodyEn.includes('B.Tech Computer Science'));
  assert.ok(draft.bodyHi.includes('Aditya Verma'));
  assert.ok(draft.bodyHi.includes('University of Lucknow'));

  // Verify required attachments
  assert.ok(draft.requiredAttachmentsEn.length >= 3);
  assert.ok(draft.requiredAttachmentsHi.length >= 3);
  assert.ok(draft.submissionInstructionsEn.length >= 3);
});

test('Tracker Grievance - UP State draft routing with Jan Sunwai & 1076 Helpline', () => {
  const upApp = {
    id: 'app_up_1',
    scholarshipId: 'up_post_matric_dashmottar',
    scholarshipCode: 'UP-DASHMOTTAR',
    scholarshipNameEn: 'UP Post-Matric Dashmottar Scholarship',
    scholarshipNameHi: 'उत्तर प्रदेश दशमोत्तर छात्रवृत्ति योजना',
    portalName: 'UP Scholarship & Fee Reimbursement Portal',
    portalUrl: 'https://scholarship.up.gov.in',
    academicYear: '2026-27',
    maskedApplicationId: 'UP2026****5678',
    currentStatus: 'pending_district_state',
    statusLabelEn: 'Pending at District Social Welfare Officer (DSWO)',
    statusLabelHi: 'ज़िला समाज कल्याण अधिकारी स्तर पर लंबित',
    whoActs: 'DISTRICT_STATE',
    inputMethod: 'manual_selection',
    isLiveLookup: false,
    timelineEvents: [],
    nextActionEn: 'Await verification by DSWO.',
    nextActionHi: 'डीएसडब्ल्यूओ सत्यापन की प्रतीक्षा करें।',
    officialHelpdeskUrl: 'https://scholarship.up.gov.in',
    officialGrievanceUrl: 'https://jansunwai.up.nic.in',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
  };

  const draft = generateGrievanceDraft(upApp, null, 'Pending beyond standard 15-day window');

  // Verify official UP routing
  assert.equal(draft.portalName, 'UP Scholarship & Fee Reimbursement Portal');
  assert.equal(draft.officialGrievanceUrl, 'https://jansunwai.up.nic.in');
  assert.equal(draft.officialHelpdeskEmail, 'helpdesk.scholarship-up@gov.in');
  assert.ok(draft.officialHelplineNumber.includes('1076'));
  assert.ok(draft.escalationAuthorityEn.includes('District Social Welfare Officer (DSWO)'));

  // Placeholders when profile is null
  assert.ok(draft.bodyEn.includes('[Student Full Name / विद्यार्थी का नाम]'));
  assert.ok(draft.bodyEn.includes('UP2026****5678'));
  assert.ok(draft.bodyHi.includes('UP2026****5678'));
});

test('Tracker Schema - API Request schemas validation', () => {
  const validCreate = {
    scholarshipId: 'nsp_post_matric_sc',
    rawApplicationId: 'UP202612345678',
    initialStatus: 'submitted_pending_institute',
    initialRemark: 'Form submitted online',
    inputMethod: 'manual_selection',
    studentNotes: 'College nodal officer signed acknowledgment',
  };
  assert.ok(CreateTrackedApplicationRequestSchema.safeParse(validCreate).success);

  // Notes exceeding 500 chars should be rejected
  const invalidNotes = { ...validCreate, studentNotes: 'A'.repeat(501) };
  assert.ok(!CreateTrackedApplicationRequestSchema.safeParse(invalidNotes).success);

  // Status update request schema
  const validUpdate = {
    status: 'defective_correction_needed',
    rawRemark: 'Returned for correction',
    inputMethod: 'pasted_remark',
    notes: 'Need to submit updated caste certificate',
  };
  assert.ok(UpdateApplicationStatusRequestSchema.safeParse(validUpdate).success);

  const invalidStatus = { ...validUpdate, status: 'invalid_status_string' };
  assert.ok(!UpdateApplicationStatusRequestSchema.safeParse(invalidStatus).success);
});

