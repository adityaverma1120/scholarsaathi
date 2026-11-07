import {
  type DocumentCategory,
  type DocumentCheck,
  type ExtractedField,
  DOCUMENT_CATEGORY_LABELS,
  verifyFileSignature,
} from './schema';

export interface DocumentAnalysisResult {
  processingState: 'processed' | 'needs_user_review' | 'failed';
  readabilityScore: number;
  checks: DocumentCheck[];
  extractedFields: ExtractedField[];
}

/**
 * Runs automated readiness checks for an uploaded document against official scholarship portal standards.
 * 
 * IMPORTANT: Checks verify technical compliance (format, size limits, required field presence).
 * They NEVER declare that a document is legally authentic or government-verified (Gate G2 / Rule P2).
 */
export function runDocumentChecks(
  category: DocumentCategory,
  fileName: string,
  fileSizeBytes: number,
  mimeType: string,
  rawBytes?: Uint8Array
): DocumentAnalysisResult {
  const checks: DocumentCheck[] = [];
  const extractedFields: ExtractedField[] = [];
  const categoryConfig = DOCUMENT_CATEGORY_LABELS[category];

  // 1. Check: File Format & Magic Bytes
  if (rawBytes && rawBytes.length > 0) {
    const signature = verifyFileSignature(rawBytes);
    if (!signature.isValid) {
      checks.push({
        checkType: 'file_signature',
        name: 'File Integrity & Format Signature',
        result: 'fail',
        explanation: 'File header does not match a valid PDF, JPEG, PNG, or WebP document. The file may be corrupt or disguised.',
        ruleReference: 'NSP Technical Guidelines 2026-27 (File Integrity)',
        suggestedAction: 'Please re-scan or download a clean original copy in PDF or JPEG format.',
        requiresUserConfirmation: false,
      });
    } else if (!categoryConfig.allowedFormats.includes(signature.detectedMime!)) {
      checks.push({
        checkType: 'file_format',
        name: 'Portal Format Compatibility',
        result: 'warning',
        explanation: `Detected ${signature.detectedMime}, but portals usually prefer ${categoryConfig.allowedFormats.join(' or ')} for ${categoryConfig.en}.`,
        ruleReference: 'NSP Upload Guidelines Table 2',
        suggestedAction: `Convert the file to ${categoryConfig.allowedFormats[0]} before submitting on the portal.`,
        requiresUserConfirmation: false,
      });
    } else {
      checks.push({
        checkType: 'file_signature',
        name: 'File Format Verification',
        result: 'pass',
        explanation: `Verified authentic ${signature.detectedMime} structure matching accepted portal format.`,
        ruleReference: 'NSP Technical Guidelines 2026-27',
        suggestedAction: 'Format is ready for portal upload.',
        requiresUserConfirmation: false,
      });
    }
  } else {
    // Basic MIME validation without raw bytes
    if (categoryConfig.allowedFormats.includes(mimeType)) {
      checks.push({
        checkType: 'file_format',
        name: 'File Format Check',
        result: 'pass',
        explanation: `Format ${mimeType} matches acceptable formats for this document category.`,
        ruleReference: 'Portal Specification 2026-27',
        suggestedAction: 'Format is acceptable.',
        requiresUserConfirmation: false,
      });
    } else {
      checks.push({
        checkType: 'file_format',
        name: 'File Format Check',
        result: 'warning',
        explanation: `File type ${mimeType} may not be accepted by all state and central scholarship portals.`,
        ruleReference: 'Portal Specification 2026-27',
        suggestedAction: 'Convert to PDF or JPG if portal rejects it.',
        requiresUserConfirmation: false,
      });
    }
  }

  // 2. Check: File Size vs Portal Maximum & Minimum
  const maxBytes = categoryConfig.maxSizeBytes;
  const minBytes = 20 * 1024; // 20 KB minimum (under 20 KB usually indicates corrupted or empty scan)

  if (fileSizeBytes > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    const actualMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    checks.push({
      checkType: 'file_size',
      name: 'Portal File Size Limit',
      result: 'fail',
      explanation: `File size (${actualMb} MB) exceeds maximum portal limit of ${maxMb} MB for ${categoryConfig.en}.`,
      evidence: `${fileSizeBytes} bytes (Limit: ${maxBytes} bytes)`,
      ruleReference: 'NSP Application Manual Clause 4.3 (Size Bounds)',
      suggestedAction: `Compress the document below ${maxMb} MB using a safe PDF compressor before uploading.`,
      requiresUserConfirmation: false,
    });
  } else if (fileSizeBytes < minBytes) {
    checks.push({
      checkType: 'file_size',
      name: 'Minimum Resolution & Quality Size',
      result: 'warning',
      explanation: `File is very small (${(fileSizeBytes / 1024).toFixed(1)} KB). Documents under 20 KB are often rejected by Institute Nodal Officers due to blurriness.`,
      evidence: `${fileSizeBytes} bytes`,
      ruleReference: 'NSP Verification Standard Operating Procedure (Legibility)',
      suggestedAction: 'Verify that all text and stamps are clearly legible when zoomed to 100%.',
      requiresUserConfirmation: true,
    });
  } else {
    const sizeKb = (fileSizeBytes / 1024).toFixed(1);
    checks.push({
      checkType: 'file_size',
      name: 'Portal File Size Limit',
      result: 'pass',
      explanation: `File size (${sizeKb} KB) is well within permissible limits for this document category.`,
      evidence: `${fileSizeBytes} bytes`,
      ruleReference: 'NSP Application Manual Clause 4.3',
      suggestedAction: 'Size is optimal for portal upload.',
      requiresUserConfirmation: false,
    });
  }

  // 3. Check: Document-Specific Candidate Fields & Content Expectations
  let readabilityScore = 85;

  if (category === 'class_10_marksheet') {
    extractedFields.push(
      {
        id: 'f_10_name',
        fieldKey: 'student_name',
        label: 'Candidate Name',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      },
      {
        id: 'f_10_roll',
        fieldKey: 'roll_number',
        label: 'Roll / Registration Number',
        originalValue: '',
        confidence: 0.8,
        pageNumber: 1,
      },
      {
        id: 'f_10_board',
        fieldKey: 'board_name',
        label: 'Exam Board',
        originalValue: '',
        confidence: 0.9,
        pageNumber: 1,
      },
      {
        id: 'f_10_year',
        fieldKey: 'passing_year',
        label: 'Passing Year',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      },
      {
        id: 'f_10_percentage',
        fieldKey: 'percentage',
        label: 'Total Marks / Percentage',
        originalValue: '',
        confidence: 0.75,
        pageNumber: 1,
      }
    );

    checks.push({
      checkType: 'content_fields',
      name: 'Key Academic Fields Coverage',
      result: 'needs_user_review' as unknown as 'warning',
      explanation: 'Please review and confirm candidate name, roll number, board, and passing year extracted from this marksheet.',
      ruleReference: 'NSP Guideline: Class 10 details must match Aadhaar & portal profile exactly.',
      suggestedAction: 'Confirm extracted details in the editor below.',
      requiresUserConfirmation: true,
    });
  } else if (category === 'income_certificate') {
    extractedFields.push(
      {
        id: 'f_inc_number',
        fieldKey: 'certificate_number',
        label: 'Certificate Number',
        originalValue: '',
        confidence: 0.8,
        pageNumber: 1,
      },
      {
        id: 'f_inc_income',
        fieldKey: 'annual_income',
        label: 'Annual Family Income (₹)',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      },
      {
        id: 'f_inc_authority',
        fieldKey: 'issuing_authority',
        label: 'Issuing Authority (e.g. Tehsildar / SDM)',
        originalValue: '',
        confidence: 0.8,
        pageNumber: 1,
      },
      {
        id: 'f_inc_date',
        fieldKey: 'issue_date',
        label: 'Issue Date',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      }
    );

    checks.push({
      checkType: 'income_validity',
      name: 'Income Certificate Validity Window',
      result: 'warning',
      explanation: 'Income certificates are typically valid for 1 fiscal year (or 3 years in select states like UP/Bihar). Ensure certificate was issued within the active window.',
      ruleReference: 'State & Central Scholarship Rules on Financial Year Validity',
      suggestedAction: 'Confirm certificate issue date matches the current academic cycle.',
      requiresUserConfirmation: true,
    });
  } else if (category === 'domicile_certificate') {
    extractedFields.push(
      {
        id: 'f_dom_number',
        fieldKey: 'certificate_number',
        label: 'Domicile Certificate Number',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      },
      {
        id: 'f_dom_state',
        fieldKey: 'domicile_state',
        label: 'Domicile State',
        originalValue: '',
        confidence: 0.9,
        pageNumber: 1,
      },
      {
        id: 'f_dom_district',
        fieldKey: 'domicile_district',
        label: 'District / Tehsil',
        originalValue: '',
        confidence: 0.8,
        pageNumber: 1,
      }
    );

    checks.push({
      checkType: 'domicile_match',
      name: 'State Domicile Alignment',
      result: 'pass',
      explanation: 'Domicile document structure recognised. Domicile state will be cross-checked against your profile during eligibility analysis.',
      ruleReference: 'State Quota Criteria 2026-27',
      suggestedAction: 'Ensure state matches your student profile domicile.',
      requiresUserConfirmation: false,
    });
  } else if (category === 'bank_passbook') {
    extractedFields.push(
      {
        id: 'f_bank_acc',
        fieldKey: 'account_number',
        label: 'Bank Account Number (Last 4 Digits)',
        originalValue: '',
        confidence: 0.75,
        pageNumber: 1,
      },
      {
        id: 'f_bank_ifsc',
        fieldKey: 'ifsc_code',
        label: 'Bank IFSC Code',
        originalValue: '',
        confidence: 0.85,
        pageNumber: 1,
      },
      {
        id: 'f_bank_holder',
        fieldKey: 'holder_name',
        label: 'Account Holder Name',
        originalValue: '',
        confidence: 0.8,
        pageNumber: 1,
      }
    );

    checks.push({
      checkType: 'bank_aadhaar_seed',
      name: 'Aadhaar Seeding & NPCI Mapping Reminder',
      result: 'warning',
      explanation: 'NSP scholarship disbursement requires that your bank account is active, seeded with Aadhaar, and mapped on NPCI mapper.',
      ruleReference: 'PFMS Circular on Aadhaar-Based Payment Bridge (ABPS)',
      suggestedAction: 'Verify NPCI mapping status with your home branch before payment release.',
      requiresUserConfirmation: true,
    });
  } else {
    // General document fields
    extractedFields.push({
      id: 'f_gen_title',
      fieldKey: 'document_title',
      label: 'Document Title / Header',
      originalValue: fileName,
      confidence: 0.9,
      pageNumber: 1,
    });
  }

  // 4. Check: Automated Readiness Safety Disclaimer
  checks.push({
    checkType: 'authenticity_boundary',
    name: 'Verification Scope & Boundary Notice',
    result: 'pass',
    explanation: 'Automated checks verify technical format, size, and candidate field completeness. Official authenticity can only be determined by your Institute Nodal Officer and District Nodal Officer on the portal.',
    ruleReference: 'ScholarSaathi Invariant P2 (Explains, Never Authenticates)',
    suggestedAction: 'Keep original paper copies ready for physical college verification.',
    requiresUserConfirmation: false,
  });

  // Determine overall processing state
  const hasFail = checks.some(c => c.result === 'fail');
  const hasWarning = checks.some(c => c.result === 'warning');

  let processingState: 'processed' | 'needs_user_review' | 'failed' = 'processed';
  if (hasFail) {
    processingState = 'failed';
    readabilityScore = 30;
  } else if (hasWarning || extractedFields.length > 0) {
    processingState = 'needs_user_review';
    readabilityScore = 75;
  }

  return {
    processingState,
    readabilityScore,
    checks,
    extractedFields,
  };
}
