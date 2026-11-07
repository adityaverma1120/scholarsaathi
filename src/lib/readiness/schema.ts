import { z } from 'zod';
import { IndianStateSchema } from '../profile/schema';

/**
 * Matching outcomes for each required document against the student's vault.
 * Strictly per Spec 09 Section 3.
 */
export const DOCUMENT_MATCHING_OUTCOMES = [
  'AVAILABLE',
  'MISSING',
  'NEEDS_REVIEW',
  'POTENTIAL_MISMATCH',
  'EXPIRED_OR_OUTDATED',
  'UNKNOWN',
  'NOT_APPLICABLE',
] as const;
export type DocumentMatchingOutcome = (typeof DOCUMENT_MATCHING_OUTCOMES)[number];
export const DocumentMatchingOutcomeSchema = z.enum(DOCUMENT_MATCHING_OUTCOMES);

/**
 * Overall Application Readiness States.
 * Strictly per Spec 09 Section 5.
 */
export const READINESS_STATES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
  'READY_FOR_STUDENT_REVIEW',
  'STUDENT_CONFIRMED_READY',
] as const;
export type ReadinessState = (typeof READINESS_STATES)[number];
export const ReadinessStateSchema = z.enum(READINESS_STATES);

/**
 * Detailed requirement specification for a document under a scheme.
 */
export const DocumentRequirementSpecSchema = z.object({
  category: z.string().min(1),
  isMandatory: z.boolean().default(true),
  conditionNoteEn: z.string().optional(),
  conditionNoteHi: z.string().optional(),
  validityRuleEn: z.string().optional(),
  validityRuleHi: z.string().optional(),
  issuerAuthorityEn: z.string().optional(),
  issuerAuthorityHi: z.string().optional(),
  maxSizeBytes: z.number().int().min(1000).default(2097152), // 2 MB default
  allowedMimeTypes: z.array(z.string()).default(['application/pdf', 'image/jpeg', 'image/png']),
  sourceReference: z.string().min(1),
});
export type DocumentRequirementSpec = z.infer<typeof DocumentRequirementSpecSchema>;

/**
 * Evaluated matching item for a single document requirement
 */
export const DocumentMatchingItemSchema = z.object({
  category: z.string().min(1),
  labelEn: z.string().min(1),
  labelHi: z.string().min(1),
  requirement: DocumentRequirementSpecSchema,
  outcome: DocumentMatchingOutcomeSchema,
  matchedDocumentId: z.string().optional(),
  matchedDocumentName: z.string().optional(),
  matchedFileSize: z.number().optional(),
  reasonsEn: z.array(z.string()).default([]),
  reasonsHi: z.array(z.string()).default([]),
  actionRequiredEn: z.string().optional(),
  actionRequiredHi: z.string().optional(),
  actionUrl: z.string().optional(),
});
export type DocumentMatchingItem = z.infer<typeof DocumentMatchingItemSchema>;

/**
 * Blocker or warning issue item
 */
export const ReadinessIssueSchema = z.object({
  id: z.string().min(1),
  severity: z.enum(['BLOCKER', 'WARNING', 'INFO']),
  section: z.enum([
    'eligibility',
    'required_documents',
    'document_quality',
    'cross_consistency',
    'profile_fields',
    'portal_window',
  ]),
  titleEn: z.string().min(1),
  titleHi: z.string().min(1),
  messageEn: z.string().min(1),
  messageHi: z.string().min(1),
  actionLabelEn: z.string().min(1),
  actionLabelHi: z.string().min(1),
  actionUrl: z.string().min(1),
});
export type ReadinessIssue = z.infer<typeof ReadinessIssueSchema>;

/**
 * 7 Checklist Section Statuses per Spec 09 Section 4
 */
export const ReadinessChecklistSectionsSchema = z.object({
  // 1. Eligibility Conditions
  eligibility: z.object({
    status: z.enum(['PASS', 'FAIL', 'UNKNOWN', 'UNVERIFIED']),
    passedCount: z.number().int().min(0),
    failedCount: z.number().int().min(0),
    unknownCount: z.number().int().min(0),
    summaryEn: z.string().min(1),
    summaryHi: z.string().min(1),
  }),

  // 2. Required Documents
  requiredDocuments: z.object({
    status: z.enum(['ALL_AVAILABLE', 'PARTIAL', 'MISSING_MANDATORY']),
    totalRequired: z.number().int().min(0),
    availableCount: z.number().int().min(0),
    missingCount: z.number().int().min(0),
    needsReviewCount: z.number().int().min(0),
    items: z.array(DocumentMatchingItemSchema),
  }),

  // 3. Document Quality and Validity
  documentQuality: z.object({
    status: z.enum(['VALID', 'ISSUES_FOUND', 'NO_DOCUMENTS']),
    checksPassed: z.number().int().min(0),
    checksWarning: z.number().int().min(0),
    checksFailed: z.number().int().min(0),
    notesEn: z.array(z.string()).default([]),
    notesHi: z.array(z.string()).default([]),
  }),

  // 4. Cross-Document Consistency
  crossDocConsistency: z.object({
    status: z.enum(['CONSISTENT', 'ATTENTION_RECOMMENDED', 'MISMATCH_DETECTED']),
    exactCount: z.number().int().min(0),
    discrepancyCount: z.number().int().min(0),
    explainedCount: z.number().int().min(0),
    notesEn: z.array(z.string()).default([]),
    notesHi: z.array(z.string()).default([]),
  }),

  // 5. Profile Fields Required by Application
  profileCompleteness: z.object({
    status: z.enum(['COMPLETE', 'INCOMPLETE']),
    missingFields: z.array(z.string()).default([]),
    completionRate: z.number().min(0).max(100),
  }),

  // 6. Official Portal and Application Window
  applicationWindow: z.object({
    status: z.enum(['open', 'upcoming', 'closed', 'extended']),
    openingDate: z.string().optional(),
    closingDate: z.string().optional(),
    portalNoticeEn: z.string().min(1),
    portalNoticeHi: z.string().min(1),
    applicationUrl: z.string().url(),
  }),

  // 7. Final Student Review
  studentReview: z.object({
    isConfirmed: z.boolean().default(false),
    confirmedAt: z.string().datetime().optional(),
    studentNotes: z.string().max(500).optional(),
  }),
});
export type ReadinessChecklistSections = z.infer<typeof ReadinessChecklistSectionsSchema>;

/**
 * Complete Scholarship Readiness Report
 */
export const ScholarshipReadinessReportSchema = z.object({
  readinessId: z.string().min(1),
  scholarshipId: z.string().min(1),
  scholarshipCode: z.string().min(1),
  scholarshipNameEn: z.string().min(1),
  scholarshipNameHi: z.string().min(1),
  providerEn: z.string().min(1),
  providerHi: z.string().min(1),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  overallState: ReadinessStateSchema,
  readinessScoreFormula: z.string().min(1),
  checklistSummary: z.object({
    totalChecks: z.number().int().min(0),
    passedChecks: z.number().int().min(0),
    blockingIssuesCount: z.number().int().min(0),
    warningIssuesCount: z.number().int().min(0),
  }),
  blockers: z.array(ReadinessIssueSchema).default([]),
  warnings: z.array(ReadinessIssueSchema).default([]),
  sections: ReadinessChecklistSectionsSchema,
  evaluatedAt: z.string().datetime(),
});
export type ScholarshipReadinessReport = z.infer<typeof ScholarshipReadinessReportSchema>;

/**
 * Request schema for evaluating readiness
 */
export const EvaluateReadinessRequestSchema = z.object({
  scholarshipId: z.string().min(1),
  studentNotes: z.string().max(500).optional(),
});
export type EvaluateReadinessRequest = z.infer<typeof EvaluateReadinessRequestSchema>;

/**
 * Schema for updating student confirmation on a readiness report
 */
export const UpdateReadinessConfirmationSchema = z.object({
  isConfirmed: z.boolean(),
  studentNotes: z.string().max(500).optional(),
});
export type UpdateReadinessConfirmation = z.infer<typeof UpdateReadinessConfirmationSchema>;

