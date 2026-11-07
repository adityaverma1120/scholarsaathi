import { z } from 'zod';

// Supported comparison fields per spec 06 section 2
export const COMPARISON_FIELDS = [
  'student_name',
  'parent_name',
  'date_of_birth',
  'gender',
  'domicile_state',
  'domicile_district',
  'category',
  'academic_board',
  'roll_number',
  'passing_year',
  'marks_percentage',
  'certificate_number',
] as const;

export type ComparisonFieldKey = (typeof COMPARISON_FIELDS)[number];
export const ComparisonFieldKeySchema = z.enum(COMPARISON_FIELDS);

export const COMPARISON_FIELD_LABELS: Record<ComparisonFieldKey, { en: string; hi: string; isCritical: boolean }> = {
  student_name: { en: 'Student Full Name', hi: 'छात्र का पूरा नाम', isCritical: true },
  parent_name: { en: 'Parent / Guardian Name', hi: 'माता/पिता/अभिभावक का नाम', isCritical: true },
  date_of_birth: { en: 'Date of Birth', hi: 'जन्म तिथि', isCritical: true },
  gender: { en: 'Gender', hi: 'लिंग', isCritical: false },
  domicile_state: { en: 'Domicile State', hi: 'अधिवास राज्य', isCritical: true },
  domicile_district: { en: 'Domicile District', hi: 'अधिवास जिला', isCritical: false },
  category: { en: 'Category / Caste', hi: 'वर्ग / जाति', isCritical: true },
  academic_board: { en: 'Academic Board', hi: 'शैक्षणिक बोर्ड', isCritical: false },
  roll_number: { en: 'Roll Number', hi: 'अनुक्रमांक / रोल नंबर', isCritical: true },
  passing_year: { en: 'Passing Year', hi: 'उत्तीर्ण वर्ष', isCritical: true },
  marks_percentage: { en: 'Marks / Percentage', hi: 'प्राप्तांक / प्रतिशत', isCritical: false },
  certificate_number: { en: 'Certificate Number', hi: 'प्रमाण पत्र क्रमांक', isCritical: true },
};

// 6 Comparison result categories per spec 06 section 5
export const COMPARISON_RESULT_TYPES = [
  'exact_match',
  'likely_match',
  'possible_mismatch',
  'significant_mismatch',
  'not_comparable',
  'user_explained',
] as const;

export type ComparisonResultType = (typeof COMPARISON_RESULT_TYPES)[number];
export const ComparisonResultTypeSchema = z.enum(COMPARISON_RESULT_TYPES);

export const COMPARISON_RESULT_LABELS: Record<ComparisonResultType, { en: string; hi: string; severity: 'success' | 'warning' | 'error' | 'neutral' | 'info' }> = {
  exact_match: { en: 'Exact Match', hi: 'सटीक मिलान', severity: 'success' },
  likely_match: { en: 'Likely Match (Minor Variation)', hi: 'संभावित मिलान (मामूली अंतर)', severity: 'warning' },
  possible_mismatch: { en: 'Possible Discrepancy', hi: 'संभावित विसंगति', severity: 'warning' },
  significant_mismatch: { en: 'Significant Mismatch', hi: 'महत्वपूर्ण विसंगति', severity: 'error' },
  not_comparable: { en: 'Not Comparable / Missing', hi: 'तुलना योग्य नहीं / अनुपलब्ध', severity: 'neutral' },
  user_explained: { en: 'Student Explained', hi: 'छात्र द्वारा स्पष्टीकृत', severity: 'info' },
};

// A value extracted from a specific document or profile record
export const ComparedValueSchema = z.object({
  sourceType: z.enum(['document', 'profile']),
  sourceId: z.string(),
  sourceTitle: z.string(),
  rawValue: z.string(),
  normalisedValue: z.string(),
  confidence: z.number().min(0).max(1).default(1),
  pageNumber: z.number().int().optional(),
});
export type ComparedValue = z.infer<typeof ComparedValueSchema>;

// Detailed comparison report for a single field
export const FieldComparisonReportSchema = z.object({
  id: z.string(),
  fieldKey: ComparisonFieldKeySchema,
  fieldLabel: z.string(),
  result: ComparisonResultTypeSchema,
  values: z.array(ComparedValueSchema).min(1),
  similarityScore: z.number().min(0).max(1).optional(),
  explanation: z.string(),
  suggestedAction: z.string().optional(),
  studentExplanation: z.string().optional(),
  isCritical: z.boolean().default(false),
  reviewedAt: z.string().datetime().optional(),
});
export type FieldComparisonReport = z.infer<typeof FieldComparisonReportSchema>;

// Full cross-document analysis report
export const CrossDocumentAnalysisReportSchema = z.object({
  id: z.string(),
  comparedAt: z.string().datetime(),
  documentIds: z.array(z.string()),
  totalFieldsCompared: z.number().int().min(0),
  exactMatches: z.number().int().min(0),
  likelyMatches: z.number().int().min(0),
  mismatches: z.number().int().min(0),
  userExplained: z.number().int().min(0),
  fieldReports: z.array(FieldComparisonReportSchema),
  overallReadiness: z.enum(['ready', 'needs_attention', 'high_risk']),
});
export type CrossDocumentAnalysisReport = z.infer<typeof CrossDocumentAnalysisReportSchema>;

// API request to add/update student explanation
export const UpdateExplanationRequestSchema = z.object({
  comparisonId: z.string(),
  fieldReportId: z.string(),
  studentExplanation: z.string().min(1).max(1000),
});
export type UpdateExplanationRequest = z.infer<typeof UpdateExplanationRequestSchema>;

