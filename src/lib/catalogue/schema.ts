import { z } from 'zod';
import { IndianStateSchema } from '../profile/schema';

export const PROVIDER_TYPES = [
  'central_government',
  'state_government',
  'ugc_aicte',
  'private_foundation',
] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];
export const ProviderTypeSchema = z.enum(PROVIDER_TYPES);

export const APPLICATION_STATUSES = ['open', 'upcoming', 'closed', 'extended'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const ApplicationStatusSchema = z.enum(APPLICATION_STATUSES);

export const TARGET_EDUCATION_LEVELS = [
  'class_9_10',
  'class_11_12',
  'diploma',
  'undergraduate',
  'postgraduate',
  'phd',
  'all',
] as const;
export type TargetEducationLevel = (typeof TARGET_EDUCATION_LEVELS)[number];
export const TargetEducationLevelSchema = z.enum(TARGET_EDUCATION_LEVELS);

export const TARGET_CATEGORIES = [
  'all',
  'general',
  'sc',
  'st',
  'obc',
  'minority',
  'pwd',
  'ews',
] as const;
export type TargetCategory = (typeof TARGET_CATEGORIES)[number];
export const TargetCategorySchema = z.enum(TARGET_CATEGORIES);

// Official verified source reference
export const OfficialSourceSchema = z.object({
  applicationUrl: z.string().url(),
  guidelineUrl: z.string().url(),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lastCheckedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verifiedBy: z.array(z.string()).min(1),
  reviewStatus: z.enum(['verified', 'under_review', 'archived']).default('verified'),
  sourceHierarchyLevel: z.number().int().min(1).max(5).default(1),
});
export type OfficialSource = z.infer<typeof OfficialSourceSchema>;

// Scheme Benefit specification
export const SchemeBenefitSchema = z.object({
  summaryEn: z.string().min(1),
  summaryHi: z.string().min(1),
  maintenanceAllowancePerYear: z.number().min(0).optional(),
  tuitionFeeReimbursement: z.boolean().default(false),
  booksOrContingencyAllowance: z.number().min(0).optional(),
});
export type SchemeBenefit = z.infer<typeof SchemeBenefitSchema>;

// Application window dates
export const ApplicationWindowSchema = z.object({
  status: ApplicationStatusSchema,
  openingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  closingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  portalNoticeEn: z.string().default('Check the date on the official portal as application deadlines fluctuate.'),
  portalNoticeHi: z.string().default('आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।'),
});
export type ApplicationWindow = z.infer<typeof ApplicationWindowSchema>;

// Complete Scholarship Record Schema
export const ScholarshipSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  nameEn: z.string().min(1),
  nameHi: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  providerEn: z.string().min(1),
  providerHi: z.string().min(1),
  providerType: ProviderTypeSchema,
  governmentLevel: z.enum(['central', 'state']),
  state: z.string().min(1), // 'All India' or Indian State name
  academicYear: z.string().regex(/^\d{4}-\d{2}$/), // e.g. 2026-27
  descriptionEn: z.string().min(1),
  descriptionHi: z.string().min(1),
  targetEducationLevels: z.array(TargetEducationLevelSchema).min(1),
  targetCourses: z.array(z.string()).default([]),
  targetCategories: z.array(TargetCategorySchema).min(1),
  maxAnnualIncome: z.number().min(0).optional(), // in INR
  minPercentageMarks: z.number().min(0).max(100).optional(),
  genderRestriction: z.enum(['all', 'female_only', 'transgender_inclusive']).default('all'),
  freshRenewal: z.enum(['both', 'fresh_only', 'renewal_only']).default('both'),
  applicationWindow: ApplicationWindowSchema,
  benefits: SchemeBenefitSchema,
  requiredDocuments: z.array(z.string()).default([]),
  officialSource: OfficialSourceSchema,
});
export type Scholarship = z.infer<typeof ScholarshipSchema>;

// Search & Filter criteria schema
export const CatalogueFilterSchema = z.object({
  state: z.string().optional(),
  educationLevel: TargetEducationLevelSchema.optional(),
  category: TargetCategorySchema.optional(),
  maxIncome: z.number().min(0).optional(),
  status: ApplicationStatusSchema.optional(),
  providerType: ProviderTypeSchema.optional(),
  q: z.string().optional(),
});
export type CatalogueFilter = z.infer<typeof CatalogueFilterSchema>;

