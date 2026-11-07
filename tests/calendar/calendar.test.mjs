import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CalendarEventSchema,
  PersonalReminderSchema,
  CreatePersonalReminderRequestSchema,
  ExportIcsRequestSchema,
  NotificationPreferencesSchema,
  CALENDAR_EVENT_TYPES,
  DATE_STATUSES,
} from '../../src/lib/calendar/schema.ts';
import {
  getVerifiedOfficialCalendarEvents,
  reminderToCalendarEvent,
  filterCalendarEvents,
  generateIcsCalendar,
} from '../../src/lib/calendar/engine.ts';

test('Calendar Schema - Event types and date statuses', () => {
  assert.equal(CALENDAR_EVENT_TYPES.length, 7);
  assert.ok(CALENDAR_EVENT_TYPES.includes('application_opening'));
  assert.ok(CALENDAR_EVENT_TYPES.includes('application_deadline'));
  assert.ok(CALENDAR_EVENT_TYPES.includes('correction_window'));
  assert.ok(CALENDAR_EVENT_TYPES.includes('renewal_deadline'));
  assert.ok(CALENDAR_EVENT_TYPES.includes('personal_followup'));

  assert.equal(DATE_STATUSES.length, 5);
  assert.ok(DATE_STATUSES.includes('confirmed'));
  assert.ok(DATE_STATUSES.includes('provisional'));
  assert.ok(DATE_STATUSES.includes('closed'));
});

test('Calendar Engine - Verified official calendar event derivation (Spec 14 Section 3)', () => {
  const events = getVerifiedOfficialCalendarEvents('2026-27');
  assert.ok(events.length >= 8, 'Catalogue should yield at least 8 verified calendar events');

  for (const evt of events) {
    const parse = CalendarEventSchema.safeParse(evt);
    assert.ok(parse.success, `Event ${evt.id} must pass schema validation`);
    assert.equal(evt.reviewStatus, 'verified');
    assert.equal(evt.academicYear, '2026-27');
    assert.match(evt.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(evt.lastVerifiedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(
      evt.officialSourceUrl.includes('.gov.in') || evt.officialSourceUrl.includes('.nic.in'),
      `Official source URL must be .gov.in or .nic.in: ${evt.officialSourceUrl}`
    );
    assert.equal(evt.isPersonal, false);
    assert.ok(evt.notesEn && evt.notesEn.length > 0);
    assert.ok(evt.notesHi && evt.notesHi.length > 0);
  }

  // Ensure application deadlines, openings, and correction windows exist
  const deadlines = events.filter(e => e.eventType === 'application_deadline');
  const openings = events.filter(e => e.eventType === 'application_opening');
  const corrections = events.filter(e => e.eventType === 'correction_window');

  assert.ok(deadlines.length >= 4, 'Should include scheme application deadlines');
  assert.ok(openings.length >= 2, 'Should include scheme application openings');
  assert.ok(corrections.length >= 2, 'Should include correction windows');
});

test('Calendar Engine - Event filtering by category and timeframe', () => {
  const allEvents = getVerifiedOfficialCalendarEvents('2026-27');

  // Filter by category
  const correctionOnly = filterCalendarEvents(allEvents, 'correction_window');
  assert.ok(correctionOnly.length > 0);
  assert.ok(correctionOnly.every(e => e.eventType === 'correction_window'));

  const deadlineOnly = filterCalendarEvents(allEvents, 'application_deadline');
  assert.ok(deadlineOnly.length > 0);
  assert.ok(deadlineOnly.every(e => e.eventType === 'application_deadline'));

  // Filter by timeframe with mock current date
  const mockCurrentDate = '2026-10-01';
  const upcomingEvents = filterCalendarEvents(allEvents, undefined, 'upcoming', mockCurrentDate);
  const closedEvents = filterCalendarEvents(allEvents, undefined, 'closed', mockCurrentDate);

  for (const evt of upcomingEvents) {
    assert.ok(evt.date >= mockCurrentDate && evt.dateStatus !== 'closed');
  }

  for (const evt of closedEvents) {
    assert.ok(evt.date < mockCurrentDate || evt.dateStatus === 'closed');
  }
});

test('Calendar Engine - Personal reminder conversion', () => {
  const now = new Date().toISOString();
  const reminder = {
    id: 'rem_test_123',
    title: 'Submit Income Certificate to College Nodal Officer',
    category: 'personal_followup',
    dueDate: '2026-10-25',
    dueTime: '14:30',
    schemeId: 'nsp_postmatric_sc',
    schemeName: 'Post Matric Scholarship for SC Students',
    notes: 'Bring 2 copies attested by Gazetted Officer',
    remindBeforeDays: 1,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const validation = PersonalReminderSchema.safeParse(reminder);
  assert.ok(validation.success);

  const event = reminderToCalendarEvent(reminder);
  assert.equal(event.id, 'evt_rem_rem_test_123');
  assert.equal(event.titleEn, reminder.title);
  assert.equal(event.eventType, 'personal_followup');
  assert.equal(event.date, '2026-10-25');
  assert.equal(event.time, '14:30');
  assert.equal(event.isPersonal, true);
  assert.equal(event.dateStatus, 'confirmed');
});

test('Calendar Engine - RFC 5545 iCalendar generation and Rule P8 notice', () => {
  const events = getVerifiedOfficialCalendarEvents('2026-27').slice(0, 3);
  const ics = generateIcsCalendar(events, 'Test Scholarship Calendar');

  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('VERSION:2.0\r\n'));
  assert.ok(ics.includes('PRODID:-//ScholarSaathi//Scholarship Calendar 2026-27//EN\r\n'));
  assert.ok(ics.includes('BEGIN:VEVENT\r\n'));
  assert.ok(ics.includes('SUMMARY:'));
  assert.ok(ics.includes('DTSTART;'));
  assert.ok(ics.includes('URL:https://'));
  assert.ok(ics.endsWith('END:VCALENDAR'));

  // Mandatory Rule P8 notice verification in export
  assert.ok(
    ics.includes('Notice: Check the date on the official portal as application deadlines fluctuate.'),
    'iCalendar export MUST include Rule P8 fluctuating portal deadline notice'
  );
});

test('Calendar Schema - Create reminder and export payload validation', () => {
  // Valid reminder request
  const validRequest = {
    title: 'Check college verification status',
    category: 'status_check',
    dueDate: '2026-11-15',
    dueTime: '10:00',
    notes: 'Log in to scholarship portal',
    remindBeforeDays: 2,
  };
  const parseValid = CreatePersonalReminderRequestSchema.safeParse(validRequest);
  assert.ok(parseValid.success);

  // Invalid reminder request (empty title, invalid date)
  const invalidRequest = {
    title: '',
    category: 'unknown_category',
    dueDate: '15-11-2026',
  };
  const parseInvalid = CreatePersonalReminderRequestSchema.safeParse(invalidRequest);
  assert.equal(parseInvalid.success, false);

  // Valid export request
  const exportReq = {
    includeOfficialDeadlines: true,
    includePersonalReminders: false,
    academicYear: '2026-27',
  };
  assert.ok(ExportIcsRequestSchema.safeParse(exportReq).success);

  // Valid notification preferences
  const prefs = {
    enabledCategories: ['application_deadline', 'correction_window'],
    quietHoursStart: '23:00',
    quietHoursEnd: '07:00',
    language: 'hi',
    privacyMode: true,
  };
  assert.ok(NotificationPreferencesSchema.safeParse(prefs).success);
});

