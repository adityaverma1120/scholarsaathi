import { NextRequest, NextResponse } from 'next/server';
import {
  getVerifiedOfficialCalendarEvents,
  filterCalendarEvents,
} from '@/lib/calendar/engine';
import {
  CalendarEventTypeSchema,
  type CalendarEventType,
} from '@/lib/calendar/schema';

/**
 * Calendar Events API
 * 
 * GET /api/calendar/events
 * Query params:
 * - academicYear (default: '2026-27')
 * - category (optional CalendarEventType)
 * - timeframe ('all' | 'upcoming' | 'closed', default: 'all')
 * - currentDate (optional YYYY-MM-DD for deterministic evaluation)
 * 
 * Returns verified official calendar events from the curated catalogue.
 * Strictly adheres to Spec 14 Section 3 & Rule P8.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2026-27';
    const categoryParam = searchParams.get('category');
    const timeframeParam = searchParams.get('timeframe') || 'all';
    const currentDate = searchParams.get('currentDate') || undefined;

    let category: CalendarEventType | undefined = undefined;
    if (categoryParam) {
      const catParse = CalendarEventTypeSchema.safeParse(categoryParam);
      if (!catParse.success) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_CATEGORY',
              message: `Invalid calendar event category: ${categoryParam}`,
            },
          },
          { status: 400 }
        );
      }
      category = catParse.data;
    }

    if (!['all', 'upcoming', 'closed'].includes(timeframeParam)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TIMEFRAME',
            message: 'Timeframe must be one of: "all", "upcoming", "closed"',
          },
        },
        { status: 400 }
      );
    }
    const timeframe = timeframeParam as 'all' | 'upcoming' | 'closed';

    // Retrieve verified official events
    const allOfficialEvents = getVerifiedOfficialCalendarEvents(academicYear);
    const filteredEvents = filterCalendarEvents(allOfficialEvents, category, timeframe, currentDate);

    return NextResponse.json({
      events: filteredEvents,
      count: filteredEvents.length,
      academicYear,
      filters: {
        category: category || null,
        timeframe,
      },
      notice: 'Check the date on the portal. Application deadlines fluctuate; verify all dates directly on the official portal before acting.',
    });
  } catch (err) {
    console.error('[API calendar/events] Error handling request:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving calendar events.',
        },
      },
      { status: 500 }
    );
  }
}

