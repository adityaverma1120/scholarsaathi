import assert from 'node:assert';
import {
  generateApplicationPreparationForm,
  updateFieldValueInForm,
  formatToPortalDate,
  NSP_PORTAL_FIELD_DEFS,
  CURRENT_MAPPING_VERSION,
} from '../../src/lib/assistant/engine.ts';
import {
  FieldSourceTypeSchema,
  PreparationStatusSchema,
  ApplicationPreparationFormSchema,
  UpdateFieldRequestSchema,
  GeneratePreparationRequestSchema,
} from '../../src/lib/assistant/schema.ts';
import { getScholarshipById, getAllScholarships } from '../../src/lib/catalogue/engine.ts';

console.log('🧪 Testing Scholarship Form-Filling Assistant & Safe Review (Phase 8)...');

// 1. Schema & Enum Validation
console.log('  Testing Schema Definitions & Enums...');
{
  assert.strictEqual(FieldSourceTypeSchema.safeParse('profile').success, true);
  assert.strictEqual(FieldSourceTypeSchema.safeParse('vault_document').success, true);
  assert.strictEqual(FieldSourceTypeSchema.safeParse('manual_override').success, true);
  assert.strictEqual(FieldSourceTypeSchema.safeParse('missing').success, true);
  assert.strictEqual(FieldSourceTypeSchema.safeParse('ai_generated').success, false); // AI never invents field values!

  assert.strictEqual(PreparationStatusSchema.safeParse('draft').success, true);
  assert.strictEqual(PreparationStatusSchema.safeParse('in_review').success, true);
  assert.strictEqual(PreparationStatusSchema.safeParse('confirmed_by_student').success, true);
  assert.strictEqual(PreparationStatusSchema.safeParse('submitted').success, false); // Never auto-submits!
}

// 2. Portal Field Definitions & Coverage
console.log('  Testing Official Portal Field Coverage...');
{
  assert.ok(NSP_PORTAL_FIELD_DEFS.length >= 14, `Expected at least 14 field definitions, got ${NSP_PORTAL_FIELD_DEFS.length}`);

  const sections = new Set(NSP_PORTAL_FIELD_DEFS.map(f => f.section));
  assert.ok(sections.has('General Information'));
  assert.ok(sections.has('Academic Details'));
  assert.ok(sections.has('Bank Account Details'));
  assert.ok(sections.has('Contact & Residential Details'));

  // Assert high-impact critical fields are marked
  const nameDef = NSP_PORTAL_FIELD_DEFS.find(f => f.fieldId === 'student_name');
  assert.ok(nameDef !== undefined);
  assert.strictEqual(nameDef?.highImpact, true);
  assert.strictEqual(nameDef?.isMandatory, true);

  const dobDef = NSP_PORTAL_FIELD_DEFS.find(f => f.fieldId === 'dob');
  assert.ok(dobDef !== undefined);
  assert.strictEqual(dobDef?.highImpact, true);

  const bankDef = NSP_PORTAL_FIELD_DEFS.find(f => f.fieldId === 'bank_account_number');
  assert.ok(bankDef !== undefined);
  assert.strictEqual(bankDef?.highImpact, true);
}

// 3. Indian Portal Date Formatting
console.log('  Testing Portal Date Formatting (DD/MM/YYYY)...');
{
  assert.strictEqual(formatToPortalDate('2004-05-15'), '15/05/2004');
  assert.strictEqual(formatToPortalDate('1999-12-01'), '01/12/1999');
  assert.strictEqual(formatToPortalDate(''), '');
  assert.strictEqual(formatToPortalDate('invalid'), 'invalid');
}

// 4. Candidate Value Extraction from Student Profile
console.log('  Testing Profile Value Extraction & Provenance Tracking...');
{
  const scheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scheme !== null);

  const studentProfile = {
    id: 'student_test_prep',
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
        id: 'rec_1',
        level: 'undergraduate',
        institution: 'KNIT Sultanpur',
        course: 'B.Tech Information Technology',
        board: 'AKTU Lucknow',
        passingYear: 2026,
        percentage: 82.5,
      },
    ],
    schemeDependent: {
      familyIncome: 180000,
      incomePeriod: 'annual',
      category: 'sc',
      minorityStatus: false,
      hostellerStatus: 'hosteller',
    },
    completion: { basic: 'complete', academic: 'complete', schemeDependent: 'complete' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const form = generateApplicationPreparationForm(scheme, studentProfile, []);

  // Validate schema
  const parsed = ApplicationPreparationFormSchema.safeParse(form);
  assert.strictEqual(parsed.success, true);

  // Check student name
  const nameField = form.fields.find(f => f.fieldId === 'student_name');
  assert.strictEqual(nameField?.candidateValue, 'Rahul Kumar');
  assert.strictEqual(nameField?.sourceType, 'profile');
  assert.ok(nameField?.provenanceNoteEn.includes('Profile'));

  // Check DOB format DD/MM/YYYY
  const dobField = form.fields.find(f => f.fieldId === 'dob');
  assert.strictEqual(dobField?.candidateValue, '15/05/2004');
  assert.strictEqual(dobField?.sourceType, 'profile');

  // Check State & Category
  const stateField = form.fields.find(f => f.fieldId === 'domicile_state');
  assert.strictEqual(stateField?.candidateValue, 'Uttar Pradesh');

  const catField = form.fields.find(f => f.fieldId === 'category');
  assert.strictEqual(catField?.candidateValue, 'SC');

  // Check Academics
  const instField = form.fields.find(f => f.fieldId === 'institution_name');
  assert.strictEqual(instField?.candidateValue, 'KNIT Sultanpur');

  const courseField = form.fields.find(f => f.fieldId === 'present_course');
  assert.strictEqual(courseField?.candidateValue, 'B.Tech Information Technology');

  // Check Hosteller
  const hostellerField = form.fields.find(f => f.fieldId === 'hosteller_status');
  assert.strictEqual(hostellerField?.candidateValue, 'Hosteller');
}

// 5. Document Extraction Fallback when Profile is Missing
console.log('  Testing Vault Document Fallback Extraction...');
{
  const scheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scheme !== null);

  const vaultDocs = [
    {
      id: 'doc_bank_1',
      category: 'bank_passbook',
      originalFileName: 'passbook.pdf',
      fileSize: 400000,
      mimeType: 'application/pdf',
      processingState: 'processed',
      extractedFields: [
        { fieldKey: 'account_number', originalValue: '123456789012', userConfirmedValue: '123456789012', confidence: 0.95 },
        { fieldKey: 'ifsc', originalValue: 'SBIN0001234', userConfirmedValue: 'SBIN0001234', confidence: 0.98 },
      ],
    },
  ];

  const form = generateApplicationPreparationForm(scheme, null, vaultDocs);

  const accField = form.fields.find(f => f.fieldId === 'bank_account_number');
  assert.strictEqual(accField?.candidateValue, '123456789012');
  assert.strictEqual(accField?.sourceType, 'vault_document');
  assert.ok(accField?.provenanceNoteEn.includes('Vault Document'));

  const ifscField = form.fields.find(f => f.fieldId === 'bank_ifsc');
  assert.strictEqual(ifscField?.candidateValue, 'SBIN0001234');
  assert.strictEqual(ifscField?.sourceType, 'vault_document');
}

// 6. Conflict Detection (Profile vs Vault Document)
console.log('  Testing Conflict Detection (Profile vs Document Mismatch)...');
{
  const scheme = getScholarshipById('nsp_post_matric_sc');
  assert.ok(scheme !== null);

  const profile = {
    id: 's1',
    version: 1,
    basic: { displayName: 'Rahul Kumar', preferredLanguage: 'en' },
    academicRecords: [],
    completion: { basic: 'complete', academic: 'not_started', schemeDependent: 'not_started' },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const docs = [
    {
      id: 'd1',
      category: 'class_10_marksheet',
      originalFileName: 'marksheet.pdf',
      fileSize: 500000,
      mimeType: 'application/pdf',
      processingState: 'processed',
      extractedFields: [
        { fieldKey: 'student_name', originalValue: 'Rahul K', userConfirmedValue: 'Rahul K', confidence: 0.9 },
      ],
    },
  ];

  const form = generateApplicationPreparationForm(scheme, profile, docs);
  const nameField = form.fields.find(f => f.fieldId === 'student_name');

  assert.strictEqual(nameField?.hasConflict, true);
  assert.ok(nameField?.conflictDetailEn?.includes('Rahul Kumar'));
  assert.ok(nameField?.conflictDetailEn?.includes('Rahul K'));
  assert.strictEqual(form.summary.conflictCount, 1);
}

// 7. Missing Value Flagging (No Guessing / Safe Invariant)
console.log('  Testing Missing Value Flagging Invariant...');
{
  const scheme = getScholarshipById('nsp_post_matric_sc');
  const emptyForm = generateApplicationPreparationForm(scheme, null, []);

  assert.ok(emptyForm.summary.missingCount >= 10);
  for (const f of emptyForm.fields) {
    if (!f.candidateValue) {
      assert.strictEqual(f.sourceType, 'missing');
      assert.strictEqual(f.isConfirmed, false);
    }
  }
}

// 8. Manual Override & Student Editing Preservation
console.log('  Testing Manual Override and Inline Editing...');
{
  const scheme = getScholarshipById('nsp_post_matric_sc');
  const initialForm = generateApplicationPreparationForm(scheme, null, []);

  const updatedForm = updateFieldValueInForm(initialForm, 'student_name', 'SURESH VERMA', true);

  const editedField = updatedForm.fields.find(f => f.fieldId === 'student_name');
  assert.strictEqual(editedField?.candidateValue, 'SURESH VERMA');
  assert.strictEqual(editedField?.sourceType, 'manual_override');
  assert.strictEqual(editedField?.isConfirmed, true);
  assert.strictEqual(editedField?.hasConflict, false);
  assert.strictEqual(updatedForm.summary.confirmedCount, 1);
}

// 9. API Request Validation Schemas
console.log('  Testing API Request Validation Schemas...');
{
  const validUpdate = { fieldId: 'student_name', value: 'AMIT' };
  assert.strictEqual(UpdateFieldRequestSchema.safeParse(validUpdate).success, true);

  const validGen = { scholarshipId: 'nsp_post_matric_sc', academicYear: '2026-27' };
  assert.strictEqual(GeneratePreparationRequestSchema.safeParse(validGen).success, true);
}

console.log('✅ Scholarship Form-Filling Assistant & Safe Review: All tests passed cleanly!\n');

