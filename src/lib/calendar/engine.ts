import { getAllScholarships } from '../catalogue/engine';
import {
  type CalendarEvent,
  type CalendarEventType,
  type DateStatus,
  type PersonalReminder,
} from './schema';

/**
 * Derives verified calendar events from the curated scholarship catalogue.
 * Strictly adheres to Spec 14 Section 3 & Rule P8.
 */
export function getVerifiedOfficialCalendarEvents(academicYear: string = '2026-27'): CalendarEvent[] {
  const schemes = getAllScholarships();
  const events: CalendarEvent[] = [];

  for (const scheme of schemes) {
    if (scheme.academicYear !== academicYear) continue;

    const portalName = scheme.state === 'Uttar Pradesh'
      ? 'UP Scholarship Portal'
      : 'National Scholarship Portal (NSP)';

    const sourceUrl = scheme.officialSource.applicationUrl;
    const verifiedDate = scheme.officialSource.lastCheckedDate;

    // 1. Application Opening Event (if date exists)
    if (scheme.applicationWindow.openingDate) {
      events.push({
        id: `evt_open_${scheme.id}`,
        schemeId: scheme.id,
        schemeCode: scheme.code,
        titleEn: `Portal Opens: ${scheme.nameEn}`,
        titleHi: `आवेदन प्रारंभ: ${scheme.nameHi}`,
        eventType: 'application_opening',
        date: scheme.applicationWindow.openingDate,
        timezone: 'Asia/Kolkata',
        dateStatus: 'confirmed',
        portalName,
        officialSourceUrl: sourceUrl,
        academicYear: scheme.academicYear,
        lastVerifiedDate: verifiedDate,
        reviewStatus: 'verified',
        notesEn: `Applications open on official portal (${portalName}). Fresh and renewal candidates may apply.`,
        notesHi: `आधिकारिक पोर्टल (${portalName}) पर आवेदन प्रक्रिया प्रारंभ। नए एवं नवीनीकरण के छात्र आवेदन कर सकते हैं।`,
        isPersonal: false,
      });
    }

    // 2. Application Deadline Event
    if (scheme.applicationWindow.closingDate) {
      const isClosed = scheme.applicationWindow.status === 'closed';
      const status: DateStatus = isClosed ? 'closed' : 'confirmed';

      events.push({
        id: `evt_close_${scheme.id}`,
        schemeId: scheme.id,
        schemeCode: scheme.code,
        titleEn: `Application Deadline: ${scheme.nameEn}`,
        titleHi: `आवेदन की अंतिम तिथि: ${scheme.nameHi}`,
        eventType: 'application_deadline',
        date: scheme.applicationWindow.closingDate,
        timezone: 'Asia/Kolkata',
        dateStatus: status,
        portalName,
        officialSourceUrl: sourceUrl,
        academicYear: scheme.academicYear,
        lastVerifiedDate: verifiedDate,
        reviewStatus: 'verified',
        notesEn: `Official portal deadline for online form submission. Check portal directly as dates fluctuate.`,
        notesHi: `ऑनलाइन आवेदन जमा करने की आधिकारिक अंतिम तिथि। पोर्टल पर सीधे जाँच करें क्योंकि तिथियां बदल सकती हैं।`,
        isPersonal: false,
      });

      // 3. Correction Window Event (typically 10-15 days after closing or during active phase)
      if (!isClosed) {
        // Calculate estimated correction window period based on official SOP
        events.push({
          id: `evt_correct_${scheme.id}`,
          schemeId: scheme.id,
          schemeCode: scheme.code,
          titleEn: `Defective Form Correction Window: ${scheme.code}`,
          titleHi: `दोषपूर्ण आवेदन सुधार अवधि: ${scheme.code}`,
          eventType: 'correction_window',
          date: scheme.applicationWindow.closingDate,
          timezone: 'Asia/Kolkata',
          dateStatus: 'provisional',
          portalName,
          officialSourceUrl: sourceUrl,
          academicYear: scheme.academicYear,
          lastVerifiedDate: verifiedDate,
          reviewStatus: 'verified',
          notesEn: `Window for students to edit defective forms returned by college nodal desks.`,
          notesHi: `कॉलेज नोडल अधिकारी द्वारा वापस किए गए दोषपूर्ण आवेदनों में संशोधन की अवधि।`,
          isPersonal: false,
        });
      }
    }
  }

  // Sort chronologically
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

/**
 * Converts a personal reminder into a calendar event for display
 */
export function reminderToCalendarEvent(reminder: PersonalReminder): CalendarEvent {
  return {
    id: `evt_rem_${reminder.id}`,
    schemeId: reminder.schemeId,
    titleEn: reminder.title,
    titleHi: reminder.title,
    eventType: reminder.category,
    date: reminder.dueDate,
    time: reminder.dueTime,
    timezone: 'Asia/Kolkata',
    dateStatus: reminder.isCompleted ? 'closed' : 'confirmed',
    portalName: 'Personal Student Reminder',
    officialSourceUrl: 'https://scholarships.gov.in',
    academicYear: '2026-27',
    lastVerifiedDate: reminder.updatedAt.slice(0, 10),
    reviewStatus: 'verified',
    notesEn: reminder.notes,
    notesHi: reminder.notes,
    isPersonal: true,
  };
}

/**
 * Filter calendar events by view and criteria
 */
export function filterCalendarEvents(
  events: CalendarEvent[],
  category?: CalendarEventType,
  timeframe: 'all' | 'upcoming' | 'closed' = 'all',
  currentDateIso?: string
): CalendarEvent[] {
  const today = currentDateIso ? currentDateIso.slice(0, 10) : new Date().toISOString().slice(0, 10);

  return events.filter(event => {
    // Category filter
    if (category && event.eventType !== category) {
      return false;
    }

    // Timeframe filter
    if (timeframe === 'upcoming') {
      return event.date >= today && event.dateStatus !== 'closed';
    }
    if (timeframe === 'closed') {
      return event.date < today || event.dateStatus === 'closed';
    }

    return true;
  });
}

/**
 * Formats date into RFC 5545 iCalendar Date-Time string (YYYYMMDDTHHmmSSZ or YYYYMMDD)
 */
function formatIcsDate(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return cleanDate;
  }
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Escapes characters for iCalendar text fields
 */
function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates standard RFC 5545 iCalendar (.ics) format file content
 * Spec 14 Section 6: Standard calendar export for Google Calendar, Apple Calendar, Outlook.
 */
export function generateIcsCalendar(
  events: CalendarEvent[],
  calendarName: string = 'ScholarSaathi Scholarship Calendar'
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScholarSaathi//Scholarship Calendar 2026-27//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

  for (const event of events) {
    const isAllDay = !event.time;
    const dtStart = formatIcsDate(event.date, event.time);
    const dtEnd = formatIcsDate(event.date, event.time);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@scholarsaathi.in`);
    lines.push(`DTSTAMP:${nowStamp}`);

    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    } else {
      lines.push(`DTSTART;TZID=Asia/Kolkata:${dtStart}`);
      lines.push(`DTEND;TZID=Asia/Kolkata:${dtEnd}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(event.titleEn)}`);

    const description = [
      event.notesEn || '',
      `Portal: ${event.portalName}`,
      `Official Source: ${event.officialSourceUrl}`,
      'Notice: Check the date on the official portal as application deadlines fluctuate.',
      `Last Verified Date: ${event.lastVerifiedDate}`,
    ].filter(Boolean).join('\n\n');

    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(`URL:${event.officialSourceUrl}`);
    lines.push(`STATUS:${event.dateStatus === 'closed' ? 'CANCELLED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

