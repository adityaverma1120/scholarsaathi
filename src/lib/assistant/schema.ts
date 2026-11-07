import { z } from 'zod';

/**
 * Value provenance types for prepared form fields
 * Strictly per Spec 11 Section 2
 */
export const FIELD_SOURCE_TYPES = [
  'profile',
  'vault_document',
  'manual_override',
  'missing',
] as const;
export type FieldSourceType = (typeof FIELD_SOURCE_TYPES)[number];
export const FieldSourceTypeSchema = z.enum(FIELD_SOURCE_TYPES);

/**
 * Form Preparation Workspace Status
 */
export const PREPARATION_STATUSES = [
  'draft',
  'in_review',
  'confirmed_by_student',
] as const;
export type PreparationStatus = (typeof PREPARATION_STATUSES)[number];
export const PreparationStatusSchema = z.enum(PREPARATION_STATUSES);

/**
 * Form field specification definition from official portal rules
 */
export const PortalFieldDefSchema = z.object({
  fieldId: z.string().min(1),
  section: z.string().min(1), // e.g. "General Information", "Academic Details", "Bank Account Details"
  labelEn: z.string().min(1),
  labelHi: z.string().min(1),
  profilePath: z.string().optional(), // path in StudentProfile e.g. "basic.displayName"
  vaultCategory: z.string().optional(), // document category in Vault
  vaultFieldKey: z.string().optional(), // extracted field key in Vault
  isMandatory: z.boolean().default(true),
  highImpact: z.boolean().default(false), // e.g. Name, DOB, Bank, Category
  formatHelpEn: z.string().min(1),
  formatHelpHi: z.string().min(1),
  placeholderEn: z.string().optional(),
  placeholderHi: z.string().optional(),
  validationRegex: z.string().optional(),
  sourceInstructionRef: z.string().min(1),
});
export type PortalFieldDef = z.infer<typeof PortalFieldDefSchema>;

/**
 * A prepared form value ready for student inspection and copy
 */
export const PreparedFieldValueSchema = z.object({
  fieldId: z.string().min(1),
  section: z.string().min(1),
  labelEn: z.string().min(1),
  labelHi: z.string().min(1),
  candidateValue: z.string().default(''),
  sourceType: FieldSourceTypeSchema,
  provenanceNoteEn: z.string().min(1),
  provenanceNoteHi: z.string().min(1),
  isMandatory: z.boolean().default(true),
  highImpact: z.boolean().default(false),
  isConfirmed: z.boolean().default(false),
  hasConflict: z.boolean().default(false),
  conflictDetailEn: z.string().optional(),
  conflictDetailHi: z.string().optional(),
  formatHelpEn: z.string().min(1),
  formatHelpHi: z.string().min(1),
  sourceInstructionRef: z.string().min(1),
});
export type PreparedFieldValue = z.infer<typeof PreparedFieldValueSchema>;

/**
 * Complete Form Preparation Workspace for a Scholarship
 */
export const ApplicationPreparationFormSchema = z.object({
  preparationId: z.string().min(1),
  scholarshipId: z.string().min(1),
  scholarshipCode: z.string().min(1),
  scholarshipNameEn: z.string().min(1),
  scholarshipNameHi: z.string().min(1),
  portalName: z.string().min(1), // e.g. "National Scholarship Portal (NSP)"
  portalUrl: z.string().url(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  mappingVersion: z.string().min(1),
  status: PreparationStatusSchema,
  fields: z.array(PreparedFieldValueSchema),
  summary: z.object({
    totalFields: z.number().int().min(0),
    preparedCount: z.number().int().min(0),
    missingCount: z.number().int().min(0),
    confirmedCount: z.number().int().min(0),
    conflictCount: z.number().int().min(0),
    highImpactPendingCount: z.number().int().min(0),
  }),
  finalReviewChecklist: z.object({
    schemeConfirmed: z.boolean().default(false),
    identityConfirmed: z.boolean().default(false),
    academicsConfirmed: z.boolean().default(false),
    bankAccountConfirmed: z.boolean().default(false),
    categoryIncomeConfirmed: z.boolean().default(false),
    documentsConfirmed: z.boolean().default(false),
    officialGuidelinesRead: z.boolean().default(false),
  }),
  studentNotes: z.string().max(500).optional(),
  updatedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
});
export type ApplicationPreparationForm = z.infer<typeof ApplicationPreparationFormSchema>;

/**
 * API Request Schema for saving/updating field preparation
 */
export const UpdateFieldRequestSchema = z.object({
  fieldId: z.string().min(1),
  value: z.string(),
  isConfirmed: z.boolean().optional(),
});
export type UpdateFieldRequest = z.infer<typeof UpdateFieldRequestSchema>;

/**
 * API Request Schema for generating preparation workspace
 */
export const GeneratePreparationRequestSchema = z.object({
  scholarshipId: z.string().min(1),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/).default('2026-27'),
});
export type GeneratePreparationRequest = z.infer<typeof GeneratePreparationRequestSchema>;

