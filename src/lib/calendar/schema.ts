import { z } from 'zod';

/**
 * Calendar Event Types per Spec 14 Section 2
 */
export const CALENDAR_EVENT_TYPES = [
  'application_opening',
  'application_deadline',
  'correction_window',
  'renewal_deadline',
  'certificate_expiry',
  'personal_followup',
  'status_check',
] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];
export const CalendarEventTypeSchema = z.enum(CALENDAR_EVENT_TYPES);

/**
 * Date Status per Spec 14 Section 3
 */
export const DATE_STATUSES = [
  'confirmed',
  'provisional',
  'extended',
  'closed',
  'unknown',
] as const;
export type DateStatus = (typeof DATE_STATUSES)[number];
export const DateStatusSchema = z.enum(DATE_STATUSES);

/**
 * Calendar Event Entity (Verified Official or Personal)
 */
export const CalendarEventSchema = z.object({
  id: z.string().min(1),
  schemeId: z.string().optional(),
  schemeCode: z.string().optional(),
  titleEn: z.string().min(1),
  titleHi: z.string().min(1),
  eventType: CalendarEventTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().default('Asia/Kolkata'),
  dateStatus: DateStatusSchema,
  portalName: z.string().min(1),
  officialSourceUrl: z.string().url(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewStatus: z.enum(['verified', 'unverified']),
  notesEn: z.string().optional(),
  notesHi: z.string().optional(),
  isPersonal: z.boolean().default(false),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

/**
 * Student Personal Reminder Entity
 * Stored in private IndexedDB
 */
export const PersonalReminderSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  category: CalendarEventTypeSchema,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  schemeId: z.string().optional(),
  schemeName: z.string().optional(),
  notes: z.string().max(500).optional(),
  remindBeforeDays: z.number().int().min(0).max(30).default(1),
  isCompleted: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PersonalReminder = z.infer<typeof PersonalReminderSchema>;

/**
 * Notification Preferences per Spec 14 Section 4 & 5
 */
export const NotificationPreferencesSchema = z.object({
  enabledCategories: z.array(CalendarEventTypeSchema),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  language: z.enum(['en', 'hi']).default('en'),
  privacyMode: z.boolean().default(true), // Prevents sensitive scheme categories from appearing in alert titles
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * API Request Schema for creating a personal reminder
 */
export const CreatePersonalReminderRequestSchema = z.object({
  title: z.string().min(1).max(200),
  category: CalendarEventTypeSchema.default('personal_followup'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  schemeId: z.string().optional(),
  notes: z.string().max(500).optional(),
  remindBeforeDays: z.number().int().min(0).max(30).default(1),
});
export type CreatePersonalReminderRequest = z.infer<typeof CreatePersonalReminderRequestSchema>;

/**
 * API Request Schema for exporting iCalendar file
 */
export const ExportIcsRequestSchema = z.object({
  includeOfficialDeadlines: z.boolean().default(true),
  includePersonalReminders: z.boolean().default(true),
  academicYear: z.string().default('2026-27'),
});
export type ExportIcsRequest = z.infer<typeof ExportIcsRequestSchema>;

