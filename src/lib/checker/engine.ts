import {
  type ComparisonFieldKey,
  type ComparedValue,
  type FieldComparisonReport,
  type CrossDocumentAnalysisReport,
  COMPARISON_FIELD_LABELS,
} from './schema';
import { type DocumentMetadata } from '../vault/schema';
import { type StudentProfile } from '../profile/schema';

/**
 * Safe text normalisation per spec 06 section 4:
 * - Trims leading/trailing whitespace
 * - Collapses repeated spaces
 * - Lowercases Latin characters
 * - Normalises common punctuation (periods in initials, commas)
 * - Preserves original scripts (Devanagari, etc.)
 */
export function safeNormaliseText(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ')                      // Collapse multiple spaces
    .trim();
}

/**
 * Safe date normalisation:
 * Unambiguously parses dates in standard Indian / ISO formats:
 * - YYYY-MM-DD
 * - DD/MM/YYYY
 * - DD-MM-YYYY
 * - DD.MM.YYYY
 * Returns standardised YYYY-MM-DD string, or null if unparseable.
 */
export function safeNormaliseDate(str: string): string | null {
  if (!str) return null;
  const cleaned = str.trim();

  // Pattern 1: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (isValidDateComponents(year, month, day)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (Common in Indian certificates)
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (isValidDateComponents(year, month, day)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
  }

  return null;
}

function isValidDateComponents(year: number, month: number, day: number): boolean {
  if (year < 1950 || year > 2035) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Computes Levenshtein / Bigram similarity between two normalised strings.
 * Returns score between 0.0 (no similarity) and 1.0 (exact match).
 */
export function calculateStringSimilarity(strA: string, strB: string): number {
  if (strA === strB) return 1.0;
  if (!strA || !strB) return 0.0;

  const a = strA.length > strB.length ? strB : strA;
  const b = strA.length > strB.length ? strA : strB;

  if (b.includes(a)) {
    return a.length / b.length;
  }

  // Character-level Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Compares Name fields between two sources with Indian naming conventions (initials, honorifics).
 */
export function compareNameField(valA: ComparedValue, valB: ComparedValue): FieldComparisonReport {
  const normA = valA.normalisedValue;
  const normB = valB.normalisedValue;

  // Check missing
  if (!normA || !normB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'student_name',
      fieldLabel: COMPARISON_FIELD_LABELS.student_name.en,
      result: 'not_comparable',
      values: [valA, valB],
      explanation: 'One of the documents does not contain a readable name for comparison.',
      isCritical: true,
    };
  }

  // Exact Match
  if (normA === normB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'student_name',
      fieldLabel: COMPARISON_FIELD_LABELS.student_name.en,
      result: 'exact_match',
      similarityScore: 1.0,
      values: [valA, valB],
      explanation: 'Names match identically across both documents.',
      isCritical: true,
    };
  }

  const similarity = calculateStringSimilarity(normA, normB);

  // Check for common initial patterns (e.g., "Amit Kumar" vs "Amit K")
  const tokensA = normA.split(' ');
  const tokensB = normB.split(' ');
  const isInitialVariant =
    (tokensA.length === tokensB.length &&
      tokensA.some((t, i) => t.length === 1 && tokensB[i].startsWith(t))) ||
    (tokensB.some((t, i) => t.length === 1 && tokensA[i]?.startsWith(t)));

  // If low OCR confidence on either side, treat as possible_mismatch rather than significant
  const hasLowConfidence = valA.confidence < 0.65 || valB.confidence < 0.65;

  if (isInitialVariant || similarity >= 0.85) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'student_name',
      fieldLabel: COMPARISON_FIELD_LABELS.student_name.en,
      result: 'likely_match',
      similarityScore: similarity,
      values: [valA, valB],
      explanation: isInitialVariant
        ? 'Minor variation detected: one document uses an abbreviated middle or last initial.'
        : 'Very close match with minor spelling or transliteration variation.',
      suggestedAction: 'Verify that this name variation is accepted by your college nodal officer, or submit a name affidavit if required by the state portal.',
      isCritical: true,
    };
  }

  if (similarity >= 0.60 || hasLowConfidence) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'student_name',
      fieldLabel: COMPARISON_FIELD_LABELS.student_name.en,
      result: 'possible_mismatch',
      similarityScore: similarity,
      values: [valA, valB],
      explanation: hasLowConfidence
        ? 'Possible difference detected, but OCR confidence is moderate. Please review the original document scan.'
        : `Names differ noticeably (${Math.round(similarity * 100)}% match). This may trigger an Institute Nodal Officer defect on NSP.`,
      suggestedAction: 'Check your Aadhaar and Class 10 marksheet. NSP mandates that your name on the portal must match Aadhaar exactly.',
      isCritical: true,
    };
  }

  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fieldKey: 'student_name',
    fieldLabel: COMPARISON_FIELD_LABELS.student_name.en,
    result: 'significant_mismatch',
    similarityScore: similarity,
    values: [valA, valB],
    explanation: `Names are completely different ("${valA.rawValue}" vs "${valB.rawValue}"). This is a critical defect on all scholarship portals.`,
    suggestedAction: 'Ensure both documents belong to the same student before submitting your scholarship application.',
    isCritical: true,
  };
}

/**
 * Compares Date of Birth fields with strict date equality and ambiguity handling.
 */
export function compareDateField(valA: ComparedValue, valB: ComparedValue): FieldComparisonReport {
  const dateA = safeNormaliseDate(valA.rawValue);
  const dateB = safeNormaliseDate(valB.rawValue);

  if (!dateA || !dateB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'date_of_birth',
      fieldLabel: COMPARISON_FIELD_LABELS.date_of_birth.en,
      result: 'not_comparable',
      values: [valA, valB],
      explanation: 'One or both date values could not be unambiguously parsed (e.g. blurred or non-standard format).',
      suggestedAction: 'Check original certificates to confirm your date of birth is legible.',
      isCritical: true,
    };
  }

  if (dateA === dateB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey: 'date_of_birth',
      fieldLabel: COMPARISON_FIELD_LABELS.date_of_birth.en,
      result: 'exact_match',
      similarityScore: 1.0,
      values: [
        { ...valA, normalisedValue: dateA },
        { ...valB, normalisedValue: dateB },
      ],
      explanation: `Dates of birth match identically (${dateA}).`,
      isCritical: true,
    };
  }

  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fieldKey: 'date_of_birth',
    fieldLabel: COMPARISON_FIELD_LABELS.date_of_birth.en,
    result: 'significant_mismatch',
    similarityScore: 0.0,
    values: [
      { ...valA, normalisedValue: dateA },
      { ...valB, normalisedValue: dateB },
    ],
    explanation: `Date of birth differs: "${dateA}" in ${valA.sourceTitle} vs "${dateB}" in ${valB.sourceTitle}. This will trigger an automatic defect or rejection on NSP.`,
    suggestedAction: 'Apply for correction at your school board or nearest Aadhaar Seva Kendra so both official records match.',
    isCritical: true,
  };
}

/**
 * Compares generic fields like roll number, passing year, domicile state, or caste category.
 */
export function compareGenericField(
  fieldKey: ComparisonFieldKey,
  valA: ComparedValue,
  valB: ComparedValue
): FieldComparisonReport {
  const normA = valA.normalisedValue;
  const normB = valB.normalisedValue;
  const meta = COMPARISON_FIELD_LABELS[fieldKey];

  if (!normA || !normB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey,
      fieldLabel: meta.en,
      result: 'not_comparable',
      values: [valA, valB],
      explanation: `Missing or unreadable ${meta.en.toLowerCase()} in one of the sources.`,
      isCritical: meta.isCritical,
    };
  }

  if (normA === normB) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey,
      fieldLabel: meta.en,
      result: 'exact_match',
      similarityScore: 1.0,
      values: [valA, valB],
      explanation: `${meta.en} matches identically across documents.`,
      isCritical: meta.isCritical,
    };
  }

  // Passing year, roll number, or category mismatch is significant
  if (fieldKey === 'passing_year' || fieldKey === 'roll_number' || fieldKey === 'category' || fieldKey === 'domicile_state') {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey,
      fieldLabel: meta.en,
      result: 'significant_mismatch',
      similarityScore: 0.0,
      values: [valA, valB],
      explanation: `Discrepancy in ${meta.en}: "${valA.rawValue}" vs "${valB.rawValue}". Portals verify this against state/board databases.`,
      suggestedAction: `Check which document is correct and ensure the value entered on the portal matches the official certificate.`,
      isCritical: meta.isCritical,
    };
  }

  // Default similarity check
  const similarity = calculateStringSimilarity(normA, normB);
  if (similarity >= 0.8) {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fieldKey,
      fieldLabel: meta.en,
      result: 'likely_match',
      similarityScore: similarity,
      values: [valA, valB],
      explanation: `Slight difference in ${meta.en} (${Math.round(similarity * 100)}% match).`,
      isCritical: meta.isCritical,
    };
  }

  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fieldKey,
    fieldLabel: meta.en,
    result: 'possible_mismatch',
    similarityScore: similarity,
    values: [valA, valB],
    explanation: `Values differ for ${meta.en}: "${valA.rawValue}" vs "${valB.rawValue}".`,
    suggestedAction: 'Review the source documents before using in your application.',
    isCritical: meta.isCritical,
  };
}

/**
 * Runs a complete cross-document consistency audit across multiple vault documents and student profile.
 */
export function runCrossDocumentComparison(
  documents: DocumentMetadata[],
  profile?: StudentProfile | null
): CrossDocumentAnalysisReport {
  const fieldReports: FieldComparisonReport[] = [];
  const docIds = documents.map(d => d.id);

  // Group candidate values by fieldKey across documents
  const valuesByField = new Map<ComparisonFieldKey, ComparedValue[]>();

  const addValue = (key: ComparisonFieldKey, val: ComparedValue) => {
    if (!valuesByField.has(key)) {
      valuesByField.set(key, []);
    }
    valuesByField.get(key)!.push(val);
  };

  // 1. Ingest profile data if available
  if (profile) {
    if (profile.basic?.displayName) {
      addValue('student_name', {
        sourceType: 'profile',
        sourceId: 'profile',
        sourceTitle: 'Student Profile',
        rawValue: profile.basic.displayName,
        normalisedValue: safeNormaliseText(profile.basic.displayName),
        confidence: 1.0,
      });
    }

    if (profile.basic?.dateOfBirth) {
      addValue('date_of_birth', {
        sourceType: 'profile',
        sourceId: 'profile',
        sourceTitle: 'Student Profile',
        rawValue: profile.basic.dateOfBirth,
        normalisedValue: profile.basic.dateOfBirth,
        confidence: 1.0,
      });
    }

    if (profile.basic?.domicileState) {
      addValue('domicile_state', {
        sourceType: 'profile',
        sourceId: 'profile',
        sourceTitle: 'Student Profile',
        rawValue: profile.basic.domicileState,
        normalisedValue: safeNormaliseText(profile.basic.domicileState),
        confidence: 1.0,
      });
    }

    if (profile.schemeDependent?.category) {
      addValue('category', {
        sourceType: 'profile',
        sourceId: 'profile',
        sourceTitle: 'Student Profile',
        rawValue: profile.schemeDependent.category,
        normalisedValue: safeNormaliseText(profile.schemeDependent.category),
        confidence: 1.0,
      });
    }
  }

  // 2. Ingest extracted fields from vault documents
  for (const doc of documents) {
    for (const field of (doc.extractedFields || [])) {
      const val = field.userConfirmedValue || field.originalValue;
      if (!val) continue;

      let targetKey: ComparisonFieldKey | null = null;
      if (field.fieldKey === 'student_name') targetKey = 'student_name';
      else if (field.fieldKey === 'date_of_birth' || field.fieldKey === 'dob') targetKey = 'date_of_birth';
      else if (field.fieldKey === 'roll_number') targetKey = 'roll_number';
      else if (field.fieldKey === 'passing_year') targetKey = 'passing_year';
      else if (field.fieldKey === 'domicile_state') targetKey = 'domicile_state';
      else if (field.fieldKey === 'certificate_number') targetKey = 'certificate_number';
      else if (field.fieldKey === 'board_name') targetKey = 'academic_board';

      if (targetKey) {
        addValue(targetKey, {
          sourceType: 'document',
          sourceId: doc.id,
          sourceTitle: doc.fileName,
          rawValue: val,
          normalisedValue: targetKey === 'date_of_birth' ? (safeNormaliseDate(val) || val) : safeNormaliseText(val),
          confidence: field.confidence,
          pageNumber: field.pageNumber,
        });
      }
    }
  }

  // 3. Compare values pairwise for each field that has >= 2 sources
  for (const [key, values] of valuesByField.entries()) {
    if (values.length < 2) continue;

    // Compare first two sources
    const valA = values[0];
    const valB = values[1];

    let report: FieldComparisonReport;
    if (key === 'student_name') {
      report = compareNameField(valA, valB);
    } else if (key === 'date_of_birth') {
      report = compareDateField(valA, valB);
    } else {
      report = compareGenericField(key, valA, valB);
    }

    fieldReports.push(report);
  }

  // Calculate summary counts
  const exactMatches = fieldReports.filter(r => r.result === 'exact_match').length;
  const likelyMatches = fieldReports.filter(r => r.result === 'likely_match').length;
  const mismatches = fieldReports.filter(
    r => r.result === 'significant_mismatch' || r.result === 'possible_mismatch'
  ).length;
  const userExplained = fieldReports.filter(r => r.result === 'user_explained').length;

  let overallReadiness: 'ready' | 'needs_attention' | 'high_risk' = 'ready';
  if (mismatches > 0) {
    const hasCriticalMismatch = fieldReports.some(
      r => r.isCritical && (r.result === 'significant_mismatch' || r.result === 'possible_mismatch')
    );
    overallReadiness = hasCriticalMismatch ? 'high_risk' : 'needs_attention';
  } else if (likelyMatches > 0) {
    overallReadiness = 'needs_attention';
  }

  return {
    id: `cmp_${Date.now()}`,
    comparedAt: new Date().toISOString(),
    documentIds: docIds,
    totalFieldsCompared: fieldReports.length,
    exactMatches,
    likelyMatches,
    mismatches,
    userExplained,
    fieldReports,
    overallReadiness,
  };
}

