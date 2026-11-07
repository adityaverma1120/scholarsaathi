import assert from 'node:assert';
import {
  StudentProfileSchema,
  BasicProfileSchema,
  AcademicRecordSchema,
  SchemeDependentFieldsSchema,
  calculateCompletion,
  INDIAN_STATES,
  UpdateProfileRequestSchema,
} from '../../src/lib/profile/schema.ts';

console.log('🧪 Testing Student Profile & Academic Vault (Phase 2)...');

// 1. Basic Profile Validation
console.log('  Testing Basic Profile Validation...');
{
  // Valid basic profile
  const validBasic = {
    displayName: 'Aarav Sharma',
    dateOfBirth: '2004-05-15',
    domicileState: 'Uttar Pradesh',
    domicileDistrict: 'Varanasi',
    preferredLanguage: 'hi',
  };
  const parsed = BasicProfileSchema.parse(validBasic);
  assert.strictEqual(parsed.displayName, 'Aarav Sharma');
  assert.strictEqual(parsed.domicileState, 'Uttar Pradesh');
  assert.strictEqual(parsed.preferredLanguage, 'hi');

  // Minimal valid basic profile (only required is displayName)
  const minimalBasic = {
    displayName: 'Priya Patel',
  };
  const parsedMinimal = BasicProfileSchema.parse(minimalBasic);
  assert.strictEqual(parsedMinimal.displayName, 'Priya Patel');
  assert.strictEqual(parsedMinimal.preferredLanguage, 'en'); // default 'en'

  // Invalid display name (empty)
  const invalidName = { displayName: '' };
  assert.throws(() => BasicProfileSchema.parse(invalidName), /too_small/i);

  // Invalid date format
  const invalidDob = { displayName: 'Raj', dateOfBirth: '15/05/2004' };
  assert.throws(() => BasicProfileSchema.parse(invalidDob), /invalid/i);

  // Invalid state (not in approved Indian states list)
  const invalidState = { displayName: 'Raj', domicileState: 'California' };
  assert.throws(() => BasicProfileSchema.parse(invalidState), /invalid_enum_value|invalid/i);
}

// 2. Academic Record Validation & Marks Formats
console.log('  Testing Academic Record & Marks Representation...');
{
  // Valid Class 10 record with marks & percentage
  const class10Record = {
    id: 'rec-10-001',
    level: 'class_10',
    board: 'CBSE',
    institution: 'Kendriya Vidyalaya BHU',
    passingYear: 2020,
    marks: 465,
    maxMarks: 500,
    percentage: 93.0,
    sourceType: 'user_input',
  };
  const parsed10 = AcademicRecordSchema.parse(class10Record);
  assert.strictEqual(parsed10.level, 'class_10');
  assert.strictEqual(parsed10.percentage, 93.0);
  assert.strictEqual(parsed10.sourceType, 'user_input');

  // Valid record with CGPA & grading scale (preserving original grading format)
  const collegeRecord = {
    id: 'rec-ug-002',
    level: 'undergraduate',
    institution: 'IIT Kanpur',
    course: 'B.Tech Computer Science',
    cgpa: 8.75,
    gradingScale: '10-point scale',
    freshOrRenewal: 'fresh',
    sourceType: 'document_extraction',
    sourceDocumentId: 'doc-gradesheet-01',
  };
  const parsedUg = AcademicRecordSchema.parse(collegeRecord);
  assert.strictEqual(parsedUg.cgpa, 8.75);
  assert.strictEqual(parsedUg.gradingScale, '10-point scale');
  assert.strictEqual(parsedUg.sourceType, 'document_extraction');
  assert.strictEqual(parsedUg.sourceDocumentId, 'doc-gradesheet-01');

  // Invalid percentage (> 100)
  assert.throws(
    () => AcademicRecordSchema.parse({ id: 'rec-err', level: 'class_12', percentage: 105 }),
    /too_big/i
  );

  // Invalid CGPA (> 10)
  assert.throws(
    () => AcademicRecordSchema.parse({ id: 'rec-err', level: 'undergraduate', cgpa: 11.5 }),
    /too_big/i
  );

  // Invalid passing year (future / out of range)
  assert.throws(
    () => AcademicRecordSchema.parse({ id: 'rec-err', level: 'class_12', passingYear: 2045 }),
    /too_big/i
  );
}

// 3. Scheme-Dependent Fields Validation & Trigger Tracking
console.log('  Testing Scheme-Dependent Fields & Privacy Isolation...');
{
  const schemeFields = {
    familyIncome: 150000,
    incomePeriod: 'annual',
    category: 'obc',
    subcategory: 'Non-Creamy Layer',
    minorityStatus: false,
    hostellerStatus: 'day_scholar',
    triggeredBySchemes: ['nsp_post_matric_obc', 'up_scholarship_dashmottar'],
  };
  const parsedScheme = SchemeDependentFieldsSchema.parse(schemeFields);
  assert.strictEqual(parsedScheme.familyIncome, 150000);
  assert.strictEqual(parsedScheme.category, 'obc');
  assert.strictEqual(parsedScheme.triggeredBySchemes.length, 2);
  assert.ok(parsedScheme.triggeredBySchemes.includes('nsp_post_matric_obc'));

  // Negative income rejected
  assert.throws(
    () => SchemeDependentFieldsSchema.parse({ familyIncome: -500 }),
    /too_small/i
  );
}

// 4. Full Student Profile Validation
console.log('  Testing Full Student Profile Schema...');
{
  const now = new Date().toISOString();
  const fullProfile = {
    id: 'profile-student-001',
    version: 1,
    basic: {
      displayName: 'Aditi Singh',
      dateOfBirth: '2003-11-20',
      domicileState: 'Uttar Pradesh',
      domicileDistrict: 'Lucknow',
      preferredLanguage: 'en',
    },
    academicRecords: [
      {
        id: 'rec-1',
        level: 'class_10',
        board: 'ICSE',
        passingYear: 2019,
        percentage: 88.5,
        sourceType: 'user_input',
      },
      {
        id: 'rec-2',
        level: 'class_12',
        board: 'ISC',
        passingYear: 2021,
        percentage: 91.2,
        sourceType: 'user_input',
      },
    ],
    schemeDependent: {
      familyIncome: 200000,
      incomePeriod: 'annual',
      category: 'general',
      triggeredBySchemes: [],
    },
    completion: {
      basic: 'complete',
      academic: 'complete',
      schemeDependent: 'complete',
    },
    createdAt: now,
    updatedAt: now,
  };

  const parsed = StudentProfileSchema.parse(fullProfile);
  assert.strictEqual(parsed.id, 'profile-student-001');
  assert.strictEqual(parsed.academicRecords.length, 2);
  assert.strictEqual(parsed.completion.basic, 'complete');
}

// 5. Completion Calculation Logic (Section-level completion, not eligibility!)
console.log('  Testing Section Completion Calculation...');
{
  // Empty profile
  const emptyComp = calculateCompletion({});
  assert.strictEqual(emptyComp.basic, 'not_started');
  assert.strictEqual(emptyComp.academic, 'not_started');
  assert.strictEqual(emptyComp.schemeDependent, 'not_started');

  // Partial basic
  const partialBasicComp = calculateCompletion({
    basic: { displayName: 'Ravi', preferredLanguage: 'en' },
  });
  assert.strictEqual(partialBasicComp.basic, 'partial');

  // Complete basic (with state)
  const completeBasicComp = calculateCompletion({
    basic: { displayName: 'Ravi', domicileState: 'Madhya Pradesh', preferredLanguage: 'en' },
  });
  assert.strictEqual(completeBasicComp.basic, 'complete');

  // Academic records: started but without marks
  const academicStarted = calculateCompletion({
    academicRecords: [{ id: '1', level: 'class_10', sourceType: 'user_input' }],
  });
  assert.strictEqual(academicStarted.academic, 'partial');

  // Academic records: complete with percentage
  const academicComplete = calculateCompletion({
    academicRecords: [{ id: '1', level: 'class_10', percentage: 85, sourceType: 'user_input' }],
  });
  assert.strictEqual(academicComplete.academic, 'complete');

  // Scheme-dependent complete
  const schemeComplete = calculateCompletion({
    schemeDependent: { category: 'sc', triggeredBySchemes: [] },
  });
  assert.strictEqual(schemeComplete.schemeDependent, 'complete');
}

// 6. Update Request Validation (Partial updates)
console.log('  Testing Partial Profile Update Schema...');
{
  const updateReq = {
    basic: {
      domicileState: 'Bihar',
    },
    schemeDependent: {
      familyIncome: 120000,
    },
  };
  const parsedUpdate = UpdateProfileRequestSchema.parse(updateReq);
  assert.strictEqual(parsedUpdate.basic?.domicileState, 'Bihar');
  assert.strictEqual(parsedUpdate.schemeDependent?.familyIncome, 120000);
}

// 7. Reference Data Verification
console.log('  Testing Indian States Reference Data...');
{
  assert.ok(INDIAN_STATES.length >= 35, 'Expected all Indian states and UTs in reference list');
  assert.ok(INDIAN_STATES.includes('Uttar Pradesh'));
  assert.ok(INDIAN_STATES.includes('Maharashtra'));
  assert.ok(INDIAN_STATES.includes('Delhi'));
  assert.ok(INDIAN_STATES.includes('Tamil Nadu'));
  assert.ok(INDIAN_STATES.includes('Karnataka'));
  assert.ok(INDIAN_STATES.includes('West Bengal'));
}

// 8. API Request Schema Validation (POST /api/profile contract)
console.log('  Testing Profile API Request Validation Schema...');
{
  // Case 8a: Valid profile update payload
  const validPayload = {
    basic: { displayName: 'Rohit Kumar', domicileState: 'Bihar' },
    schemeDependent: { category: 'obc' },
  };
  const parsedValid = UpdateProfileRequestSchema.safeParse(validPayload);
  assert.strictEqual(parsedValid.success, true);
  if (parsedValid.success) {
    assert.strictEqual(parsedValid.data.basic?.displayName, 'Rohit Kumar');
    assert.strictEqual(parsedValid.data.basic?.domicileState, 'Bihar');
    assert.strictEqual(parsedValid.data.schemeDependent?.category, 'obc');
  }

  // Case 8b: Invalid state in profile update payload
  const invalidStatePayload = {
    basic: { domicileState: 'NotAnIndianState' },
  };
  const parsedInvalid = UpdateProfileRequestSchema.safeParse(invalidStatePayload);
  assert.strictEqual(parsedInvalid.success, false);
  if (!parsedInvalid.success) {
    const issue = parsedInvalid.error.issues[0];
    assert.strictEqual(issue.path.join('.'), 'basic.domicileState');
  }

  // Case 8c: Academic records in update payload
  const academicPayload = {
    academicRecords: [
      {
        id: 'rec-001',
        level: 'undergraduate',
        institution: 'Banaras Hindu University',
        marks: 850,
        maxMarks: 1000,
        percentage: 85.0,
        sourceType: 'user_input',
      },
    ],
  };
  const parsedAcademic = UpdateProfileRequestSchema.safeParse(academicPayload);
  assert.strictEqual(parsedAcademic.success, true);
  if (parsedAcademic.success) {
    assert.strictEqual(parsedAcademic.data.academicRecords?.[0].institution, 'Banaras Hindu University');
  }

  // Case 8d: Scheme-dependent fields with triggers
  const schemePayload = {
    schemeDependent: {
      familyIncome: 250000,
      incomePeriod: 'annual',
      minorityStatus: true,
      hostellerStatus: 'hosteller',
      triggeredBySchemes: ['nsp_merit_cum_means'],
    },
  };
  const parsedScheme = UpdateProfileRequestSchema.safeParse(schemePayload);
  assert.strictEqual(parsedScheme.success, true);
  if (parsedScheme.success) {
    assert.strictEqual(parsedScheme.data.schemeDependent?.hostellerStatus, 'hosteller');
    assert.strictEqual(parsedScheme.data.schemeDependent?.minorityStatus, true);
  }
}

console.log('✅ Student Profile & Academic Vault: All tests passed cleanly!\n');
