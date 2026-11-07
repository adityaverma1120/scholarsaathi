import { z } from 'zod';

// Supported document categories
export const DOCUMENT_CATEGORIES = [
  'class_10_marksheet',
  'class_12_marksheet',
  'graduation_marksheet',
  'income_certificate',
  'caste_certificate',
  'domicile_certificate',
  'bonafide_certificate',
  'fee_receipt',
  'bank_passbook',
  'disability_certificate',
  'other_declaration',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export const DocumentCategorySchema = z.enum(DOCUMENT_CATEGORIES);

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, { en: string; hi: string; maxSizeBytes: number; allowedFormats: string[] }> = {
  class_10_marksheet: {
    en: 'Class 10 Marksheet / Certificate',
    hi: 'कक्षा 10 अंकतालिका / प्रमाण पत्र',
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  class_12_marksheet: {
    en: 'Class 12 Marksheet / Certificate',
    hi: 'कक्षा 12 अंकतालिका / प्रमाण पत्र',
    maxSizeBytes: 2 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  graduation_marksheet: {
    en: 'Graduation / Degree Marksheet',
    hi: 'स्नातक / डिग्री अंकतालिका',
    maxSizeBytes: 2 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  income_certificate: {
    en: 'Income Certificate',
    hi: 'आय प्रमाण पत्र',
    maxSizeBytes: 1 * 1024 * 1024, // 1 MB
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  caste_certificate: {
    en: 'Caste / Category Certificate',
    hi: 'जाति प्रमाण पत्र',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  domicile_certificate: {
    en: 'Domicile / Residence Certificate',
    hi: 'निवास / मूल निवास प्रमाण पत्र',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  bonafide_certificate: {
    en: 'Bonafide Student Certificate',
    hi: 'संस्थान बोनाफाइड प्रमाण पत्र',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  fee_receipt: {
    en: 'Current Year Fee Receipt',
    hi: 'वर्तमान वर्ष शुल्क रसीद',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  bank_passbook: {
    en: 'Bank Passbook / Cancelled Cheque',
    hi: 'बैंक पासबुक / रद्द चेक',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  disability_certificate: {
    en: 'Disability Certificate (UDID)',
    hi: 'दिव्यांगता प्रमाण पत्र (यूडीआईडी)',
    maxSizeBytes: 1 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg'],
  },
  other_declaration: {
    en: 'Other Declaration / Document',
    hi: 'अन्य घोषणा / दस्तावेज़',
    maxSizeBytes: 2 * 1024 * 1024,
    allowedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
  },
};

// 8 Document processing states per specification 05 section 4
export const PROCESSING_STATES = [
  'uploaded',
  'queued',
  'processing',
  'partially_processed',
  'processed',
  'needs_user_review',
  'failed',
  'deleted',
] as const;

export type ProcessingState = (typeof PROCESSING_STATES)[number];
export const ProcessingStateSchema = z.enum(PROCESSING_STATES);

export const PROCESSING_STATE_DESCRIPTIONS: Record<ProcessingState, { en: string; hi: string }> = {
  uploaded: { en: 'File uploaded safely to device', hi: 'फ़ाइल डिवाइस पर सुरक्षित अपलोड हो गई' },
  queued: { en: 'Queued for readiness check', hi: 'तैयारी जाँच कतार में है' },
  processing: { en: 'Reading and validating document', hi: 'दस्तावेज़ पढ़ा और जाँचा जा रहा है' },
  partially_processed: { en: 'Partially analyzed; some fields need attention', hi: 'आंशिक विश्लेषण; कुछ फ़ील्ड पर ध्यान दें' },
  processed: { en: 'Ready for application use', hi: 'आवेदन में उपयोग हेतु तैयार' },
  needs_user_review: { en: 'Review and confirm extracted details', hi: 'निकाले गए विवरण की समीक्षा एवं पुष्टि करें' },
  failed: { en: 'Readiness check failed; please replace file', hi: 'जाँच विफल; कृपया नई स्पष्ट फ़ाइल अपलोड करें' },
  deleted: { en: 'Document deleted from vault', hi: 'दस्तावेज़ कोष से हटा दिया गया' },
};

// Check result enum
export const CHECK_RESULTS = ['pass', 'warning', 'fail', 'unknown', 'not_applicable'] as const;
export type CheckResult = (typeof CHECK_RESULTS)[number];
export const CheckResultSchema = z.enum(CHECK_RESULTS);

// Automated document check schema
export const DocumentCheckSchema = z.object({
  checkType: z.string(),
  name: z.string(),
  result: CheckResultSchema,
  explanation: z.string(),
  evidence: z.string().optional(),
  ruleReference: z.string().optional(),
  suggestedAction: z.string().optional(),
  requiresUserConfirmation: z.boolean().default(false),
});
export type DocumentCheck = z.infer<typeof DocumentCheckSchema>;

// Extracted field schema with confidence and confirmation
export const ExtractedFieldSchema = z.object({
  id: z.string(),
  fieldKey: z.string(),
  label: z.string(),
  originalValue: z.string(),
  normalisedValue: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.8),
  pageNumber: z.number().int().min(1).default(1),
  userConfirmedValue: z.string().optional(),
  userConfirmedAt: z.string().datetime().optional(),
});
export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;

// Document metadata schema
export const DocumentMetadataSchema = z.object({
  id: z.string().min(1),
  category: DocumentCategorySchema,
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024), // Max 10 MB absolute limit
  mimeType: z.string().min(1),
  checksum: z.string().min(1),
  pageCount: z.number().int().min(1).default(1),
  processingState: ProcessingStateSchema.default('uploaded'),
  uploadedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  readabilityScore: z.number().min(0).max(100).optional(),
  extractedFields: z.array(ExtractedFieldSchema).default([]),
  checks: z.array(DocumentCheckSchema).default([]),
  userNotes: z.string().max(500).optional(),
});
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type VaultDocument = DocumentMetadata;

// Upload validation payload schema
export const DocumentUploadPayloadSchema = z.object({
  category: DocumentCategorySchema,
  fileName: z.string().min(1).max(255),
  fileSizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
  mimeType: z.string().min(1),
  rawBytesBase64: z.string().optional(),
});
export type DocumentUploadPayload = z.infer<typeof DocumentUploadPayloadSchema>;

// Helper: Magic byte file signature verification
export function verifyFileSignature(bytes: Uint8Array): { isValid: boolean; detectedMime: string | null } {
  if (bytes.length < 4) {
    return { isValid: false, detectedMime: null };
  }

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { isValid: true, detectedMime: 'application/pdf' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { isValid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 0x89 0x50 0x4E 0x47 (0x89 'P' 'N' 'G')
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return { isValid: true, detectedMime: 'image/png' };
  }

  // WebP: 'RIFF'....'WEBP'
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { isValid: true, detectedMime: 'image/webp' };
  }

  return { isValid: false, detectedMime: null };
}

