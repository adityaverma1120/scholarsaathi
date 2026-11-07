import { z } from 'zod';

/**
 * Knowledge Chunk Category Enum per Spec 13 Section 3 & 7
 */
export const KNOWLEDGE_CATEGORIES = [
  'eligibility',
  'income_limit',
  'documents',
  'renewal',
  'defective_remedy',
  'rejection_reason',
  'payment_dbt',
  'grievance_route',
  'general_process',
] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];
export const KnowledgeCategorySchema = z.enum(KNOWLEDGE_CATEGORIES);

/**
 * Verified Knowledge Chunk Schema
 * Governed by Spec 13 Section 3
 */
export const KnowledgeChunkSchema = z.object({
  id: z.string().min(1),
  category: KnowledgeCategorySchema,
  sourceTitle: z.string().min(1),
  officialUrl: z.string().url(),
  schemeId: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  sectionLocator: z.string().min(1),
  titleEn: z.string().min(1),
  titleHi: z.string().min(1),
  contentEn: z.string().min(1),
  contentHi: z.string().min(1),
  keywordsEn: z.array(z.string()).min(1),
  keywordsHi: z.array(z.string()).min(1),
  reviewStatus: z.literal('verified'),
  checkedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewers: z.array(z.string()).min(2),
});
export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

/**
 * Citation Reference Schema
 */
export const CitationSchema = z.object({
  sourceTitle: z.string().min(1),
  officialUrl: z.string().url(),
  sectionLocator: z.string().min(1),
  academicYear: z.string().min(1),
  checkedDate: z.string().min(1),
});
export type Citation = z.infer<typeof CitationSchema>;

/**
 * Suggested Action Link Schema
 */
export const SuggestedActionSchema = z.object({
  labelEn: z.string().min(1),
  labelHi: z.string().min(1),
  href: z.string().min(1),
  actionType: z.enum(['internal_link', 'external_portal']),
});
export type SuggestedAction = z.infer<typeof SuggestedActionSchema>;

/**
 * Structured Grounded Assistant Response Schema
 */
export const AssistantResponseSchema = z.object({
  id: z.string().min(1),
  answerEn: z.string().min(1),
  answerHi: z.string().min(1),
  citations: z.array(CitationSchema),
  confidence: z.number().min(0).max(1),
  insufficientEvidence: z.boolean(),
  matchedCategory: KnowledgeCategorySchema.optional(),
  suggestedActions: z.array(SuggestedActionSchema),
  disclaimerEn: z.string().min(1),
  disclaimerHi: z.string().min(1),
});
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;

/**
 * API Request Schema for POST /api/assistant/messages
 */
export const AssistantMessageRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  language: z.enum(['en', 'hi']).default('en'),
  preferredSchemeId: z.string().optional(),
});
export type AssistantMessageRequest = z.infer<typeof AssistantMessageRequestSchema>;

