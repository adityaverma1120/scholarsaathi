import { z } from 'zod';
import { IndianStateSchema, EducationLevelSchema, CategorySchema, StudentProfileSchema } from '../profile/schema';
import { TargetEducationLevelSchema, TargetCategorySchema } from '../catalogue/schema';

/**
 * 3-Valued Logic Outcome for Conditions
 * Strictly per Spec 08 Section 4: PASS, FAIL, UNKNOWN
 */
export const CONDITION_STATUSES = ['PASS', 'FAIL', 'UNKNOWN'] as const;
export type ConditionStatus = (typeof CONDITION_STATUSES)[number];
export const ConditionStatusSchema = z.enum(CONDITION_STATUSES);

/**
 * Overall Scheme Evaluation Outcome
 * Strictly per Spec 08 Section 5
 */
export const OVERALL_ELIGIBILITY_STATUSES = [
  'POTENTIALLY_ELIGIBLE',
  'NOT_ELIGIBLE',
  'NEEDS_INFORMATION',
  'UNVERIFIED',
] as const;
export type OverallEligibilityStatus = (typeof OVERALL_ELIGIBILITY_STATUSES)[number];
export const OverallEligibilityStatusSchema = z.enum(OVERALL_ELIGIBILITY_STATUSES);

/**
 * Supported condition types evaluated by the deterministic engine
 */
export const CONDITION_TYPES = [
  'domicile_state',
  'category',
  'income_ceiling',
  'education_level',
  'minimum_marks',
  'gender_restriction',
  'fresh_renewal',
  'required_documents',
] as const;
export type ConditionType = (typeof CONDITION_TYPES)[number];
export const ConditionTypeSchema = z.enum(CONDITION_TYPES);

/**
 * Supported comparison operators
 */
export const CONDITION_OPERATORS = [
  'equals',
  'in_list',
  'less_than_or_equal',
  'greater_than_or_equal',
  'all_match',
] as const;
export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];
export const ConditionOperatorSchema = z.enum(CONDITION_OPERATORS);

/**
 * Result of evaluating a single condition against a student profile
 */
export const ConditionEvaluationSchema = z.object({
  conditionId: z.string().min(1),
  conditionType: ConditionTypeSchema,
  labelEn: z.string().min(1),
  labelHi: z.string().min(1),
  result: ConditionStatusSchema,
  isMandatory: z.boolean().default(true),
  studentValue: z.any().optional(),
  expectedValue: z.any(),
  explanationEn: z.string().min(1),
  explanationHi: z.string().min(1),
  sourceReference: z.string().min(1),
  missingFieldName: z.string().optional(),
});
export type ConditionEvaluation = z.infer<typeof ConditionEvaluationSchema>;

/**
 * Full evaluation outcome for a single scholarship scheme
 */
export const SchemeEligibilityEvaluationSchema = z.object({
  scholarshipId: z.string().min(1),
  scholarshipCode: z.string().min(1),
  scholarshipNameEn: z.string().min(1),
  scholarshipNameHi: z.string().min(1),
  providerEn: z.string().min(1),
  providerHi: z.string().min(1),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  overallResult: OverallEligibilityStatusSchema,
  ruleSetVersion: z.string().min(1),
  conditionEvaluations: z.array(ConditionEvaluationSchema),
  passedCount: z.number().int().min(0),
  failedCount: z.number().int().min(0),
  unknownCount: z.number().int().min(0),
  missingFields: z.array(z.string()).default([]),
  failedReasonsEn: z.array(z.string()).default([]),
  failedReasonsHi: z.array(z.string()).default([]),
  officialSourceUrl: z.string().url(),
  applicationUrl: z.string().url(),
  evaluatedAt: z.string().datetime(),
});
export type SchemeEligibilityEvaluation = z.infer<typeof SchemeEligibilityEvaluationSchema>;

/**
 * Summary metrics of an evaluation run
 */
export const EvaluationSummarySchema = z.object({
  totalEvaluated: z.number().int().min(0),
  potentiallyEligible: z.number().int().min(0),
  needsInformation: z.number().int().min(0),
  notEligible: z.number().int().min(0),
  unverified: z.number().int().min(0),
});
export type EvaluationSummary = z.infer<typeof EvaluationSummarySchema>;

/**
 * Complete batch of scheme evaluations for a student
 */
export const EligibilityEvaluationBatchSchema = z.object({
  evaluationId: z.string().min(1),
  evaluatedAt: z.string().datetime(),
  ruleSetVersion: z.string().min(1),
  evaluations: z.array(SchemeEligibilityEvaluationSchema),
  summary: EvaluationSummarySchema,
});
export type EligibilityEvaluationBatch = z.infer<typeof EligibilityEvaluationBatchSchema>;

/**
 * API Request Schema for POST /api/eligibility/evaluate
 */
export const EvaluateEligibilityRequestSchema = z.object({
  profile: StudentProfileSchema.optional(),
  profileId: z.string().optional(),
  scholarshipIds: z.array(z.string()).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/).default('2026-27'),
  uploadedDocumentCategories: z.array(z.string()).optional(),
});
export type EvaluateEligibilityRequest = z.infer<typeof EvaluateEligibilityRequestSchema>;

