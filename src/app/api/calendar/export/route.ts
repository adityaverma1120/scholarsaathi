import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getVerifiedOfficialCalendarEvents,
  reminderToCalendarEvent,
  generateIcsCalendar,
} from '@/lib/calendar/engine';
import {
  PersonalReminderSchema,
  type CalendarEvent,
} from '@/lib/calendar/schema';

const CalendarExportPayloadSchema = z.object({
  includeOfficialDeadlines: z.boolean().default(true),
  academicYear: z.string().default('2026-27'),
  personalReminders: z.array(PersonalReminderSchema).optional(),
});

/**
 * Calendar Export API (RFC 5545 iCalendar)
 * 
 * POST /api/calendar/export
 * Generates and returns a downloadable .ics file.
 * Enables students to import verified deadlines directly to Google, Apple, or Outlook Calendar.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > 32768) { // 32 KB limit for multi-event exports
      return NextResponse.json(
        {
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds maximum export size.',
          },
        },
        { status: 413 }
      );
    }

    let parsedBody: unknown = {};
    if (rawBody.trim().length > 0) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_JSON',
              message: 'Request body must be valid JSON.',
            },
          },
          { status: 400 }
        );
      }
    }

    const parseResult = CalendarExportPayloadSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Export request failed validation.',
          },
        },
        { status: 400 }
      );
    }

    const { includeOfficialDeadlines, academicYear, personalReminders } = parseResult.data;
    const events: CalendarEvent[] = [];

    // 1. Add verified official deadlines from catalogue
    if (includeOfficialDeadlines) {
      const officialEvents = getVerifiedOfficialCalendarEvents(academicYear);
      events.push(...officialEvents);
    }

    // 2. Add student personal reminders if supplied
    if (personalReminders && personalReminders.length > 0) {
      for (const reminder of personalReminders) {
        events.push(reminderToCalendarEvent(reminder));
      }
    }

    // Sort chronologically
    events.sort((a, b) => a.date.localeCompare(b.date));

    // Generate RFC 5545 iCalendar string
    const icsContent = generateIcsCalendar(
      events,
      `ScholarSaathi Scholarship Deadlines (${academicYear})`
    );

    const safeFilenameYear = academicYear.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `scholarship_deadlines_${safeFilenameYear}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[API calendar/export] Error exporting calendar:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating calendar export.',
        },
      },
      { status: 500 }
    );
  }
}

