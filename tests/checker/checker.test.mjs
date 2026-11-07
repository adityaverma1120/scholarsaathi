import assert from 'node:assert';
import {
  safeNormaliseText,
  safeNormaliseDate,
  calculateStringSimilarity,
  compareNameField,
  compareDateField,
  compareGenericField,
  runCrossDocumentComparison,
} from '../../src/lib/checker/engine.ts';
import {
  UpdateExplanationRequestSchema,
  COMPARISON_FIELDS,
  COMPARISON_RESULT_TYPES,
} from '../../src/lib/checker/schema.ts';

console.log('🧪 Testing Cross-Document Consistency Checker (Phase 4)...');

// 1. Safe Text Normalisation (Spec 06 Section 4)
console.log('  Testing Safe Text Normalisation...');
{
  assert.strictEqual(safeNormaliseText('  Rahul   Kumar  '), 'rahul kumar');
  assert.strictEqual(safeNormaliseText('Amit K.'), 'amit k');
  assert.strictEqual(safeNormaliseText('Dr. Priya, Sharma!'), 'dr priya sharma');
  assert.strictEqual(safeNormaliseText(''), '');
}

// 2. Safe Date Parsing & Normalisation
console.log('  Testing Safe Date Normalisation (Indian & ISO Formats)...');
{
  assert.strictEqual(safeNormaliseDate('2004-05-15'), '2004-05-15');
  assert.strictEqual(safeNormaliseDate('15/05/2004'), '2004-05-15');
  assert.strictEqual(safeNormaliseDate('15-05-2004'), '2004-05-15');
  assert.strictEqual(safeNormaliseDate('15.05.2004'), '2004-05-15');
  assert.strictEqual(safeNormaliseDate('2004/05/15'), '2004-05-15');

  // Single digit month/day padding
  assert.strictEqual(safeNormaliseDate('5/3/2005'), '2005-03-05');

  // Invalid / unparseable dates
  assert.strictEqual(safeNormaliseDate('not-a-date'), null);
  assert.strictEqual(safeNormaliseDate('32/13/2005'), null); // invalid day/month
  assert.strictEqual(safeNormaliseDate(''), null);
}

// 3. String Similarity Computation
console.log('  Testing String Similarity Algorithm...');
{
  assert.strictEqual(calculateStringSimilarity('rahul kumar', 'rahul kumar'), 1.0);
  assert.strictEqual(calculateStringSimilarity('', 'test'), 0.0);

  // Minor typo / transliteration should have high similarity (>= 0.8)
  const translitSim = calculateStringSimilarity('aaditya verma', 'aditya verma');
  assert.ok(translitSim >= 0.85, `Expected >= 0.85, got ${translitSim}`);

  // Completely different strings should have low similarity (< 0.4)
  const diffSim = calculateStringSimilarity('rahul sharma', 'vikram singh');
  assert.ok(diffSim < 0.4, `Expected < 0.4, got ${diffSim}`);
}

// 4. Name Field Comparison Logic (Spec 06 Sections 5 & 6)
console.log('  Testing Name Field Comparison (Exact, Initial, Transliteration, Mismatch)...');
{
  // 4a. Exact Match
  const valExactA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: 'Rahul Kumar',
    normalisedValue: 'rahul kumar',
    confidence: 0.95,
  };
  const valExactB = {
    sourceType: 'profile',
    sourceId: 'profile',
    sourceTitle: 'Student Profile',
    rawValue: 'Rahul Kumar',
    normalisedValue: 'rahul kumar',
    confidence: 1.0,
  };
  const repExact = compareNameField(valExactA, valExactB);
  assert.strictEqual(repExact.result, 'exact_match');
  assert.strictEqual(repExact.similarityScore, 1.0);

  // 4b. Likely Match via Initial (Amit Kumar vs Amit K.)
  const valInitialA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Class 12 Marksheet',
    rawValue: 'Amit Kumar',
    normalisedValue: 'amit kumar',
    confidence: 0.9,
  };
  const valInitialB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Aadhaar Card',
    rawValue: 'Amit K.',
    normalisedValue: 'amit k',
    confidence: 0.9,
  };
  const repInitial = compareNameField(valInitialA, valInitialB);
  assert.strictEqual(repInitial.result, 'likely_match');
  assert.ok(repInitial.explanation.includes('abbreviated'));

  // 4c. Likely Match via minor transliteration (Aditya vs Aaditya)
  const valTransA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: 'Aditya Verma',
    normalisedValue: 'aditya verma',
    confidence: 0.9,
  };
  const valTransB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Income Certificate',
    rawValue: 'Aaditya Verma',
    normalisedValue: 'aaditya verma',
    confidence: 0.9,
  };
  const repTrans = compareNameField(valTransA, valTransB);
  assert.strictEqual(repTrans.result, 'likely_match');

  // 4d. Significant Mismatch (completely different names)
  const valDiffA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: 'Pooja Sharma',
    normalisedValue: 'pooja sharma',
    confidence: 0.9,
  };
  const valDiffB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Bank Passbook',
    rawValue: 'Ramesh Gupta',
    normalisedValue: 'ramesh gupta',
    confidence: 0.9,
  };
  const repDiff = compareNameField(valDiffA, valDiffB);
  assert.strictEqual(repDiff.result, 'significant_mismatch');
  assert.ok(repDiff.explanation.includes('completely different'));

  // 4e. Low confidence OCR does not produce definitive significant mismatch
  const valLowConfA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Blurred Scan',
    rawValue: 'Suresh Kumar',
    normalisedValue: 'suresh kumar',
    confidence: 0.55, // Low confidence
  };
  const valLowConfB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Clear Scan',
    rawValue: 'Naresh Kumar',
    normalisedValue: 'naresh kumar',
    confidence: 0.9,
  };
  const repLowConf = compareNameField(valLowConfA, valLowConfB);
  assert.strictEqual(repLowConf.result, 'possible_mismatch');
  assert.ok(repLowConf.explanation.includes('confidence is moderate'));
}

// 5. Date Field Comparison Logic
console.log('  Testing Date of Birth Comparison...');
{
  // 5a. Same date in different string formats -> Exact Match
  const dateA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Class 10 Marksheet',
    rawValue: '15/05/2004',
    normalisedValue: '15/05/2004',
    confidence: 0.9,
  };
  const dateB = {
    sourceType: 'profile',
    sourceId: 'profile',
    sourceTitle: 'Student Profile',
    rawValue: '2004-05-15',
    normalisedValue: '2004-05-15',
    confidence: 1.0,
  };
  const repDateExact = compareDateField(dateA, dateB);
  assert.strictEqual(repDateExact.result, 'exact_match');

  // 5b. Different date of birth -> Significant Mismatch
  const dateDiffB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Aadhaar Card',
    rawValue: '15/05/2005', // Different year
    normalisedValue: '15/05/2005',
    confidence: 0.9,
  };
  const repDateMismatch = compareDateField(dateA, dateDiffB);
  assert.strictEqual(repDateMismatch.result, 'significant_mismatch');
  assert.ok(repDateMismatch.explanation.includes('differs'));

  // 5c. Unparseable date -> Not Comparable
  const dateUnparseable = {
    sourceType: 'document',
    sourceId: 'doc3',
    sourceTitle: 'Blurred Doc',
    rawValue: 'unreadable',
    normalisedValue: 'unreadable',
    confidence: 0.4,
  };
  const repDateUnp = compareDateField(dateA, dateUnparseable);
  assert.strictEqual(repDateUnp.result, 'not_comparable');
}

// 6. Generic Field Comparison (Passing Year, Domicile, Roll Number)
console.log('  Testing Generic Field Comparisons...');
{
  // 6a. Passing Year: Same -> Exact Match
  const yrA = {
    sourceType: 'document',
    sourceId: 'doc1',
    sourceTitle: 'Marksheet 1',
    rawValue: '2022',
    normalisedValue: '2022',
    confidence: 0.9,
  };
  const yrB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Marksheet 2',
    rawValue: '2022',
    normalisedValue: '2022',
    confidence: 0.9,
  };
  const repYrExact = compareGenericField('passing_year', yrA, yrB);
  assert.strictEqual(repYrExact.result, 'exact_match');

  // 6b. Passing Year: Different -> Significant Mismatch
  const yrDiffB = {
    sourceType: 'document',
    sourceId: 'doc2',
    sourceTitle: 'Marksheet 2',
    rawValue: '2023',
    normalisedValue: '2023',
    confidence: 0.9,
  };
  const repYrDiff = compareGenericField('passing_year', yrA, yrDiffB);
  assert.strictEqual(repYrDiff.result, 'significant_mismatch');

  // 6c. Domicile State: Different -> Significant Mismatch
  const stateA = {
    sourceType: 'profile',
    sourceId: 'profile',
    sourceTitle: 'Student Profile',
    rawValue: 'Uttar Pradesh',
    normalisedValue: 'uttar pradesh',
    confidence: 1.0,
  };
  const stateB = {
    sourceType: 'document',
    sourceId: 'doc_domicile',
    sourceTitle: 'Domicile Certificate',
    rawValue: 'Bihar',
    normalisedValue: 'bihar',
    confidence: 0.9,
  };
  const repStateDiff = compareGenericField('domicile_state', stateA, stateB);
  assert.strictEqual(repStateDiff.result, 'significant_mismatch');
}

// 7. Full Cross-Document Comparison Runner (runCrossDocumentComparison)
console.log('  Testing Full Cross-Document Comparison Engine...');
{
  const testDocs = [
    {
      id: 'doc_10',
      category: 'class_10_marksheet',
      fileName: 'class10.pdf',
      fileSize: 100000,
      mimeType: 'application/pdf',
      checksum: 'chk_10',
      pageCount: 1,
      processingState: 'processed',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extractedFields: [
        {
          id: 'f_10_name',
          fieldKey: 'student_name',
          label: 'Candidate Name',
          originalValue: 'Priya Sharma',
          confidence: 0.9,
          pageNumber: 1,
        },
        {
          id: 'f_10_year',
          fieldKey: 'passing_year',
          label: 'Passing Year',
          originalValue: '2020',
          confidence: 0.9,
          pageNumber: 1,
        },
      ],
      checks: [],
    },
    {
      id: 'doc_income',
      category: 'income_certificate',
      fileName: 'income.pdf',
      fileSize: 80000,
      mimeType: 'application/pdf',
      checksum: 'chk_inc',
      pageCount: 1,
      processingState: 'processed',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extractedFields: [
        {
          id: 'f_inc_number',
          fieldKey: 'certificate_number',
          label: 'Certificate Number',
          originalValue: 'INC/2026/8899',
          confidence: 0.85,
          pageNumber: 1,
        },
      ],
      checks: [],
    },
  ];

  const testProfile = {
    id: 'prof_1',
    version: 1,
    basic: {
      displayName: 'Priya Sharma',
      dateOfBirth: '2004-06-12',
      preferredLanguage: 'en',
    },
    academicRecords: [],
    completion: { basic: 'partial', academic: 'not_started', schemeDependent: 'not_started' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const report = runCrossDocumentComparison(testDocs, testProfile);
  assert.ok(report.id.startsWith('cmp_'));
  assert.strictEqual(report.totalFieldsCompared >= 1, true);

  // Priya Sharma (Class 10) vs Priya Sharma (Profile) -> Exact Match
  const nameReport = report.fieldReports.find(r => r.fieldKey === 'student_name');
  assert.ok(nameReport);
  assert.strictEqual(nameReport.result, 'exact_match');
  assert.strictEqual(report.exactMatches, 1);
  assert.strictEqual(report.overallReadiness, 'ready');
}

// 8. Explanation Schema Validation
console.log('  Testing Student Explanation Schema...');
{
  const validExp = {
    comparisonId: 'cmp_12345678',
    fieldReportId: 'rep_12345678',
    studentExplanation: 'Initials were expanded on Aadhaar per official UIDAI procedure.',
  };
  const parsed = UpdateExplanationRequestSchema.parse(validExp);
  assert.strictEqual(parsed.fieldReportId, 'rep_12345678');

  // Empty explanation rejected
  assert.throws(
    () => UpdateExplanationRequestSchema.parse({ ...validExp, studentExplanation: '' }),
    /too_small/i
  );
}

console.log('✅ Cross-Document Consistency Checker: All tests passed cleanly!\n');

