import { z } from 'zod';

export const WhoActsEnum = z.enum(['student', 'institute', 'district_state', 'bank', 'unsure']);
export type WhoActs = z.infer<typeof WhoActsEnum>;

export const CategoryEnum = z.enum(['waiting', 'returned', 'not_approved']);
export type Category = z.infer<typeof CategoryEnum>;

export const StatusEnum = z.enum(['verified', 'draft', 'unverified', 'retired']);
export type EntryStatus = z.infer<typeof StatusEnum>;

export const StepSchema = z.object({
  step_number: z.number().int().min(1).max(5),
  where: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }),
  carry: z.array(z.string()).optional(),
  say: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }).optional(),
});
export type Step = z.infer<typeof StepSchema>;

export const SourceSchema = z.object({
  title: z.string().optional().default('National Scholarship Portal Guidelines'),
  issuer: z.string().optional().default('Ministry of Electronics & IT / Department of Higher Education'),
  url: z.string().url(),
  checked_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type SourceInfo = z.infer<typeof SourceSchema>;

export const OfficialDestinationSchema = z.object({
  url: z.string().url(),
  label: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }),
});
export type OfficialDestination = z.infer<typeof OfficialDestinationSchema>;

export const LibraryEntrySchema = z.object({
  id: z.string().regex(/^nsp_[a-z0-9_]+$/),
  status: StatusEnum,
  scheme_scope: z.string().default('NSP Post Matric (pilot)'),
  category: CategoryEnum,
  triggers: z.array(z.string().min(1)).min(1),
  negative_triggers: z.array(z.string()).optional().default([]),
  keywords: z.array(z.string()).optional().default([]),
  language_variants: z.object({
    en: z.array(z.string()).optional(),
    hi: z.array(z.string()).optional(),
    hinglish: z.array(z.string()).optional(),
  }).optional(),
  description: z.string().min(1),
  what_the_screen_says: z.string().min(1), // Original rejection message
  inferred_meaning: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }).optional(), // What the system infers
  cause: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }), // What the message usually means
  who_acts: WhoActsEnum, // Possible responsibility
  responsibility_label: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }).optional(),
  steps: z.array(StepSchema).min(1).max(5), // Recommended next steps
  typical_wait: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }),
  deadline_text: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }).optional(),
  escalate_if: z.object({
    en: z.string().min(1),
    hi: z.string().min(1),
  }).optional(),
  official_destination: OfficialDestinationSchema.optional(),
  grievance_enabled: z.boolean().optional().default(false),
  source: SourceSchema,
  reviewed_by: z.array(z.string().min(1)).min(1),
});

export type LibraryEntry = z.infer<typeof LibraryEntrySchema>;
