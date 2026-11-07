import assert from 'node:assert';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentCategorySchema,
  DocumentMetadataSchema,
  DocumentUploadPayloadSchema,
  verifyFileSignature,
} from '../../src/lib/vault/schema.ts';
import { runDocumentChecks } from '../../src/lib/vault/checker.ts';

console.log('🧪 Testing Document Vault & OCR Readiness Checker (Phase 3)...');

// 1. Magic Bytes & MIME Signature Verification
console.log('  Testing File Magic Bytes & Signature Verification...');
{
  // Valid PDF header (%PDF-1.4)
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
  const pdfResult = verifyFileSignature(pdfBytes);
  assert.strictEqual(pdfResult.isValid, true);
  assert.strictEqual(pdfResult.detectedMime, 'application/pdf');

  // Valid JPEG header (\xFF\xD8\xFF\xE0)
  const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
  const jpegResult = verifyFileSignature(jpegBytes);
  assert.strictEqual(jpegResult.isValid, true);
  assert.strictEqual(jpegResult.detectedMime, 'image/jpeg');

  // Valid PNG header (\x89PNG\r\n\x1a\n)
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const pngResult = verifyFileSignature(pngBytes);
  assert.strictEqual(pngResult.isValid, true);
  assert.strictEqual(pngResult.detectedMime, 'image/png');

  // Valid WebP header (RIFF....WEBP)
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  const webpResult = verifyFileSignature(webpBytes);
  assert.strictEqual(webpResult.isValid, true);
  assert.strictEqual(webpResult.detectedMime, 'image/webp');

  // Invalid / disguised file (plain text disguised as PDF)
  const fakeBytes = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F]);
  const fakeResult = verifyFileSignature(fakeBytes);
  assert.strictEqual(fakeResult.isValid, false);
  assert.strictEqual(fakeResult.detectedMime, null);

  // Too short (< 4 bytes)
  const shortBytes = new Uint8Array([0x25, 0x50]);
  const shortResult = verifyFileSignature(shortBytes);
  assert.strictEqual(shortResult.isValid, false);
}

// 2. Document Categories & Configuration
console.log('  Testing Document Categories & Portal Limits...');
{
  assert.ok(DOCUMENT_CATEGORIES.length >= 10, 'Expected at least 10 document categories');
  assert.ok(DOCUMENT_CATEGORIES.includes('class_10_marksheet'));
  assert.ok(DOCUMENT_CATEGORIES.includes('income_certificate'));
  assert.ok(DOCUMENT_CATEGORIES.includes('caste_certificate'));
  assert.ok(DOCUMENT_CATEGORIES.includes('domicile_certificate'));
  assert.ok(DOCUMENT_CATEGORIES.includes('bank_passbook'));

  // Validate Class 10 configuration
  const c10Config = DOCUMENT_CATEGORY_LABELS.class_10_marksheet;
  assert.strictEqual(c10Config.maxSizeBytes, 2 * 1024 * 1024); // 2 MB
  assert.ok(c10Config.allowedFormats.includes('application/pdf'));
  assert.ok(c10Config.allowedFormats.includes('image/jpeg'));

  // Validate Income Certificate configuration (typically 1 MB max)
  const incConfig = DOCUMENT_CATEGORY_LABELS.income_certificate;
  assert.strictEqual(incConfig.maxSizeBytes, 1 * 1024 * 1024); // 1 MB
  assert.ok(incConfig.allowedFormats.includes('application/pdf'));
}

// 3. Automated Document Checks Engine (checker.ts)
console.log('  Testing Automated Readiness Checks (Class 10 Marksheet)...');
{
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);

  // Case 3a: Standard valid Class 10 marksheet (150 KB PDF)
  const resValid = runDocumentChecks(
    'class_10_marksheet',
    'class10_marksheet.pdf',
    150 * 1024,
    'application/pdf',
    validPdfHeader
  );
  assert.strictEqual(resValid.processingState, 'needs_user_review'); // Needs review because candidate fields exist
  assert.ok(resValid.readabilityScore >= 70);

  // Check file format check passed
  const formatCheck = resValid.checks.find(c => c.checkType === 'file_signature');
  assert.ok(formatCheck);
  assert.strictEqual(formatCheck.result, 'pass');

  // Check file size check passed
  const sizeCheck = resValid.checks.find(c => c.checkType === 'file_size');
  assert.ok(sizeCheck);
  assert.strictEqual(sizeCheck.result, 'pass');

  // Verify candidate fields
  const fieldKeys = resValid.extractedFields.map(f => f.fieldKey);
  assert.ok(fieldKeys.includes('student_name'));
  assert.ok(fieldKeys.includes('roll_number'));
  assert.ok(fieldKeys.includes('board_name'));
  assert.ok(fieldKeys.includes('passing_year'));
  assert.ok(fieldKeys.includes('percentage'));

  // Verify authenticity boundary notice is always present (Rule P2)
  const boundaryCheck = resValid.checks.find(c => c.checkType === 'authenticity_boundary');
  assert.ok(boundaryCheck);
  assert.strictEqual(boundaryCheck.result, 'pass');
  assert.ok(boundaryCheck.explanation.includes('Official authenticity can only be determined'));

  // Case 3b: Oversized document (> 2 MB) -> Must FAIL
  const resOversized = runDocumentChecks(
    'class_10_marksheet',
    'huge_scan.pdf',
    3.5 * 1024 * 1024,
    'application/pdf',
    validPdfHeader
  );
  assert.strictEqual(resOversized.processingState, 'failed');
  const sizeFail = resOversized.checks.find(c => c.checkType === 'file_size');
  assert.ok(sizeFail);
  assert.strictEqual(sizeFail.result, 'fail');
  assert.ok(sizeFail.explanation.includes('exceeds maximum portal limit'));

  // Case 3c: Disguised / corrupt file -> Must FAIL signature check
  const fakeHeader = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
  const resDisguised = runDocumentChecks(
    'class_10_marksheet',
    'corrupt.pdf',
    50 * 1024,
    'application/pdf',
    fakeHeader
  );
  assert.strictEqual(resDisguised.processingState, 'failed');
  const sigFail = resDisguised.checks.find(c => c.checkType === 'file_signature');
  assert.ok(sigFail);
  assert.strictEqual(sigFail.result, 'fail');
}

// 4. Automated Checks for Other Categories (Income, Domicile, Bank)
console.log('  Testing Category-Specific Rules (Income, Domicile, Bank)...');
{
  // Income certificate checks
  const resIncome = runDocumentChecks(
    'income_certificate',
    'income_cert_2026.pdf',
    80 * 1024,
    'application/pdf'
  );
  const incKeys = resIncome.extractedFields.map(f => f.fieldKey);
  assert.ok(incKeys.includes('certificate_number'));
  assert.ok(incKeys.includes('annual_income'));
  assert.ok(incKeys.includes('issuing_authority'));
  assert.ok(incKeys.includes('issue_date'));

  const incomeValidityCheck = resIncome.checks.find(c => c.checkType === 'income_validity');
  assert.ok(incomeValidityCheck);
  assert.strictEqual(incomeValidityCheck.result, 'warning');

  // Bank passbook checks
  const resBank = runDocumentChecks(
    'bank_passbook',
    'passbook.jpg',
    120 * 1024,
    'image/jpeg'
  );
  const bankKeys = resBank.extractedFields.map(f => f.fieldKey);
  assert.ok(bankKeys.includes('account_number'));
  assert.ok(bankKeys.includes('ifsc_code'));

  const npciCheck = resBank.checks.find(c => c.checkType === 'bank_aadhaar_seed');
  assert.ok(npciCheck);
  assert.ok(npciCheck.explanation.includes('NPCI'));
}

// 5. Document Metadata Zod Schema Validation
console.log('  Testing Document Metadata Schema...');
{
  const now = new Date().toISOString();
  const validDoc = {
    id: 'doc-uuid-12345',
    category: 'class_12_marksheet',
    fileName: 'twelfth_cbse.pdf',
    fileSize: 245000,
    mimeType: 'application/pdf',
    checksum: 'chk_12345678',
    pageCount: 1,
    processingState: 'processed',
    uploadedAt: now,
    updatedAt: now,
    readabilityScore: 90,
    extractedFields: [
      {
        id: 'f1',
        fieldKey: 'student_name',
        label: 'Candidate Name',
        originalValue: 'Pooja Sharma',
        confidence: 0.92,
        pageNumber: 1,
        userConfirmedValue: 'Pooja Sharma',
        userConfirmedAt: now,
      },
    ],
    checks: [
      {
        checkType: 'file_size',
        name: 'Portal File Size Limit',
        result: 'pass',
        explanation: 'File size is optimal.',
        requiresUserConfirmation: false,
      },
    ],
  };

  const parsed = DocumentMetadataSchema.parse(validDoc);
  assert.strictEqual(parsed.id, 'doc-uuid-12345');
  assert.strictEqual(parsed.category, 'class_12_marksheet');
  assert.strictEqual(parsed.extractedFields[0].userConfirmedValue, 'Pooja Sharma');
  assert.strictEqual(parsed.checks[0].result, 'pass');
}

// 6. Upload Payload Validation Schema
console.log('  Testing Upload Payload Schema...');
{
  const validPayload = {
    category: 'bonafide_certificate',
    fileName: 'bonafide_college.pdf',
    fileSizeBytes: 120000,
    mimeType: 'application/pdf',
  };
  const parsed = DocumentUploadPayloadSchema.parse(validPayload);
  assert.strictEqual(parsed.category, 'bonafide_certificate');

  // Invalid category rejected
  assert.throws(
    () => DocumentUploadPayloadSchema.parse({ ...validPayload, category: 'non_existent_category' }),
    /invalid_enum_value/i
  );

  // File exceeding 10 MB absolute limit rejected
  assert.throws(
    () => DocumentUploadPayloadSchema.parse({ ...validPayload, fileSizeBytes: 15 * 1024 * 1024 }),
    /too_big/i
  );
}

console.log('✅ Document Vault & OCR Checker: All tests passed cleanly!\n');

