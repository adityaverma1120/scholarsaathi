import { z } from 'zod';

// Field provenance - tracks where each field value came from
export const FieldProvenanceSchema = z.object({
  sourceType: z.enum(['user_input', 'document_extraction', 'official_verification']),
  sourceDocumentId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  updatedAt: z.string().datetime(),
  userConfirmedAt: z.string().datetime().optional(),
});
export type FieldProvenance = z.infer<typeof FieldProvenanceSchema>;

// A value with provenance tracking
export const ProvenancedFieldSchema = <T extends z.ZodType>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    provenance: FieldProvenanceSchema,
  });

// Indian states list (for validation)
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export const IndianStateSchema = z.enum(INDIAN_STATES);

export const EducationLevelSchema = z.enum([
  'class_10', 'class_12', 'diploma', 'undergraduate', 'postgraduate', 'phd', 'other',
]);

export const CategorySchema = z.enum([
  'general', 'sc', 'st', 'obc', 'ews', 'other', 'prefer_not_to_say',
]);

// Academic record schema
export const AcademicRecordSchema = z.object({
  id: z.string().min(1),
  level: EducationLevelSchema,
  board: z.string().max(100).optional(),
  institution: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  stream: z.string().max(100).optional(),
  passingYear: z.number().int().min(1990).max(2030).optional(),
  admissionYear: z.number().int().min(1990).max(2030).optional(),
  marks: z.number().min(0).optional(),
  maxMarks: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  grade: z.string().max(10).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  gradingScale: z.string().max(50).optional(),
  freshOrRenewal: z.enum(['fresh', 'renewal']).optional(),
  sourceType: z.enum(['user_input', 'document_extraction', 'official_verification']).default('user_input'),
  sourceDocumentId: z.string().optional(),
});
export type AcademicRecord = z.infer<typeof AcademicRecordSchema>;

// Basic profile section
export const BasicProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  domicileState: IndianStateSchema.optional(),
  domicileDistrict: z.string().max(100).optional(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
});
export type BasicProfile = z.infer<typeof BasicProfileSchema>;

// Scheme-dependent fields (only collected when needed)
export const SchemeDependentFieldsSchema = z.object({
  familyIncome: z.number().min(0).optional(),
  incomePeriod: z.enum(['annual', 'monthly']).optional(),
  category: CategorySchema.optional(),
  subcategory: z.string().max(100).optional(),
  minorityStatus: z.boolean().optional(),
  disabilityInfo: z.string().max(200).optional(),
  hostellerStatus: z.enum(['hosteller', 'day_scholar', 'not_applicable']).optional(),
  triggeredBySchemes: z.array(z.string()).default([]),
});
export type SchemeDependentFields = z.infer<typeof SchemeDependentFieldsSchema>;

// Profile completion status (not eligibility!)
export const ProfileSectionStatus = z.enum(['not_started', 'partial', 'complete']);

export const ProfileCompletionSchema = z.object({
  basic: ProfileSectionStatus,
  academic: ProfileSectionStatus,
  schemeDependent: ProfileSectionStatus,
});
export type ProfileCompletion = z.infer<typeof ProfileCompletionSchema>;

// Complete student profile
export const StudentProfileSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().default(1),
  basic: BasicProfileSchema,
  academicRecords: z.array(AcademicRecordSchema).default([]),
  schemeDependent: SchemeDependentFieldsSchema.optional(),
  completion: ProfileCompletionSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;

// API request schemas
export const UpdateProfileRequestSchema = z.object({
  basic: BasicProfileSchema.partial().optional(),
  academicRecords: z.array(AcademicRecordSchema).optional(),
  schemeDependent: SchemeDependentFieldsSchema.partial().optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Helper to calculate completion status from profile data
export function calculateCompletion(profile: Partial<StudentProfile>): ProfileCompletion {
  const basic = (() => {
    if (!profile.basic?.displayName) return 'not_started' as const;
    if (profile.basic.domicileState) return 'complete' as const;
    return 'partial' as const;
  })();

  const academic = (() => {
    if (!profile.academicRecords || profile.academicRecords.length === 0) return 'not_started' as const;
    const hasMarks = profile.academicRecords.some(r => r.marks !== undefined || r.percentage !== undefined || r.cgpa !== undefined);
    if (hasMarks) return 'complete' as const;
    return 'partial' as const;
  })();

  const schemeDependent = (() => {
    if (!profile.schemeDependent) return 'not_started' as const;
    if (profile.schemeDependent.category || profile.schemeDependent.familyIncome !== undefined) return 'complete' as const;
    return 'partial' as const;
  })();

  return { basic, academic, schemeDependent };
}
