import { z } from 'zod';

export const FaultLabelEnum = z.enum(['student', 'institute_officer', 'bank', 'unsure']);
export type FaultLabel = z.infer<typeof FaultLabelEnum>;

export const MatchPathEnum = z.enum(['tap', 'local', 'ai', 'chosen', 'voice', 'ocr', 'both', 'chat']);
export type MatchPath = z.infer<typeof MatchPathEnum>;

export const MatchOutcomeEnum = z.enum(['matched', 'chosen', 'no_match']);
export type MatchOutcome = z.infer<typeof MatchOutcomeEnum>;

export const FeedbackCategoryEnum = z.enum([
  'wrong_meaning',
  'wrong_step',
  'wrong_next_step',
  'out_of_date',
  'hard_to_understand',
  'translation',
  'other'
]);
export type FeedbackCategory = z.infer<typeof FeedbackCategoryEnum>;

// POST /api/events schema
export const MatchEventInputSchema = z.object({
  entry_id: z.string().min(1).max(100),
  fault_label: FaultLabelEnum,
  state_code: z.string().max(3).optional().nullable(),
  match_path: MatchPathEnum,
  outcome: MatchOutcomeEnum,
  consent: z.boolean().optional().default(false),
}).strict();
export type MatchEventInput = z.infer<typeof MatchEventInputSchema>;

export interface MatchEventRecord {
  event_id: string; // UUID
  week_start: string; // YYYY-MM-DD (Monday bucket, server-derived)
  entry_id: string;
  fault_label: FaultLabel;
  state_code: string | null;
  match_path: MatchPath;
  outcome: MatchOutcome;
}

// POST /api/feedback schema
export const FeedbackInputSchema = z.object({
  entry_id: z.string().min(1).max(100),
  category: FeedbackCategoryEnum,
  note: z.string().max(300).optional().nullable(),
}).strict();
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export interface FeedbackRecord {
  id: string; // UUID
  created_on: string; // YYYY-MM-DD
  entry_id: string;
  category: FeedbackCategory;
  note: string | null;
}

// POST /api/miss schema
export const MissLogInputSchema = z.object({
  text_masked: z.string().min(1).max(200),
  consent: z.boolean().refine(val => val === true, {
    message: 'Explicit consent is required to submit unrecognised remarks for review',
  }),
}).strict();
export type MissLogInput = z.infer<typeof MissLogInputSchema>;

export interface MissLogRecord {
  id: string; // UUID
  created_on: string; // YYYY-MM-DD
  expires_at: string; // YYYY-MM-DD (30 days from creation)
  text_masked: string;
}

// POST /api/match-ai schema
export const MatchAiInputSchema = z.object({
  text: z.string().min(1).max(2000),
  language: z.enum(['en', 'hi', 'hinglish']).optional(),
}).strict();
export type MatchAiInput = z.infer<typeof MatchAiInputSchema>;

