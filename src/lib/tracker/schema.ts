import { z } from 'zod';

/**
 * Standard Application Lifecycle Stages
 * Strictly per Spec 12 Section 2
 */
export const APPLICATION_STATUS_CATEGORIES = [
  'drafting',
  'ready_to_apply',
  'submitted_pending_institute',
  'pending_district_state',
  'defective_correction_needed',
  'rejected',
  'sanctioned_payment_pending',
  'payment_disbursed',
  'unknown',
] as const;
export type ApplicationStatusCategory = (typeof APPLICATION_STATUS_CATEGORIES)[number];
export const ApplicationStatusCategorySchema = z.enum(APPLICATION_STATUS_CATEGORIES);

/**
 * Authority responsible for acting on current status
 */
export const ACTION_ACTORS = [
  'STUDENT',
  'INSTITUTE',
  'DISTRICT_STATE',
  'BANK',
  'PORTAL',
] as const;
export type ActionActor = (typeof ACTION_ACTORS)[number];
export const ActionActorSchema = z.enum(ACTION_ACTORS);

/**
 * Input method used to record this application status
 */
export const STATUS_INPUT_METHODS = [
  'manual_selection',
  'pasted_remark',
  'screenshot_ocr',
  'official_portal_export',
] as const;
export type StatusInputMethod = (typeof STATUS_INPUT_METHODS)[number];
export const StatusInputMethodSchema = z.enum(STATUS_INPUT_METHODS);

/**
 * Timeline Event in an application's history
 */
export const TimelineEventSchema = z.object({
  id: z.string().min(1),
  status: ApplicationStatusCategorySchema,
  statusLabelEn: z.string().min(1),
  statusLabelHi: z.string().min(1),
  recordedAt: z.string().datetime(),
  rawRemark: z.string().optional(),
  whoActs: ActionActorSchema,
  fixCardId: z.string().optional(), // links to content/library/*.json
  notes: z.string().max(500).optional(),
  inputMethod: StatusInputMethodSchema,
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

/**
 * Tracked Scholarship Application Entity
 */
export const TrackedApplicationSchema = z.object({
  id: z.string().min(1),
  scholarshipId: z.string().min(1),
  scholarshipCode: z.string().min(1),
  scholarshipNameEn: z.string().min(1),
  scholarshipNameHi: z.string().min(1),
  portalName: z.string().min(1), // e.g. "National Scholarship Portal (NSP)"
  portalUrl: z.string().url(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  maskedApplicationId: z.string().min(1), // e.g. "NSP2026****78"
  currentStatus: ApplicationStatusCategorySchema,
  statusLabelEn: z.string().min(1),
  statusLabelHi: z.string().min(1),
  whoActs: ActionActorSchema,
  currentFixCardId: z.string().optional(), // links to content/library fix card if defective/rejected
  inputMethod: StatusInputMethodSchema,
  isLiveLookup: z.literal(false).default(false), // Always false for student-recorded entries (Spec 12 Section 4)
  timelineEvents: z.array(TimelineEventSchema),
  nextActionEn: z.string().min(1),
  nextActionHi: z.string().min(1),
  officialHelpdeskUrl: z.string().url(),
  officialGrievanceUrl: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TrackedApplication = z.infer<typeof TrackedApplicationSchema>;

/**
 * API Request Schema for adding/tracking an application
 */
export const CreateTrackedApplicationRequestSchema = z.object({
  scholarshipId: z.string().min(1),
  rawApplicationId: z.string().optional(),
  initialStatus: ApplicationStatusCategorySchema.default('submitted_pending_institute'),
  initialRemark: z.string().optional(),
  inputMethod: StatusInputMethodSchema.default('manual_selection'),
  studentNotes: z.string().max(500).optional(),
});
export type CreateTrackedApplicationRequest = z.infer<typeof CreateTrackedApplicationRequestSchema>;

/**
 * API Request Schema for updating an application's status
 */
export const UpdateApplicationStatusRequestSchema = z.object({
  status: ApplicationStatusCategorySchema,
  rawRemark: z.string().optional(),
  inputMethod: StatusInputMethodSchema.default('manual_selection'),
  notes: z.string().max(500).optional(),
});
export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusRequestSchema>;

/**
 * Mask an application identifier to preserve student privacy
 * (e.g. "UP202612345678" -> "UP2026****5678")
 */
export function maskApplicationId(rawId: string): string {
  if (!rawId || rawId.trim().length === 0) {
    return 'APP-NOT-SET';
  }
  const clean = rawId.trim();
  if (clean.length <= 4) {
    return clean;
  }
  if (clean.length <= 8) {
    return clean.slice(0, 2) + '***' + clean.slice(-2);
  }
  return clean.slice(0, 6) + '****' + clean.slice(-4);
}

