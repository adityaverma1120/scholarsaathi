import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';
import {
  CreatePersonalReminderRequestSchema,
  PersonalReminderSchema,
  type PersonalReminder,
} from '@/lib/calendar/schema';
import { sanitiseText } from '@/lib/sanitise/sanitiser';

/**
 * Personal Reminders API
 * 
 * POST /api/calendar/reminders
 * Validates and prepares a new personal reminder entity.
 * Stored client-side in private IndexedDB (scholarsaathi_calendar).
 * Strictly adheres to Spec 14 Section 3 & 4.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4096) {
      return NextResponse.json(
        {
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds 4 KB maximum limit.',
          },
        },
        { status: 413 }
      );
    }

    let parsedBody: unknown;
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

    const parseResult = CreatePersonalReminderRequestSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Personal reminder failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    let schemeName: string | undefined = undefined;
    if (data.schemeId) {
      const scheme = getScholarshipById(data.schemeId);
      if (scheme) {
        schemeName = scheme.nameEn;
      }
    }

    // Sanitise student title and notes to prevent PII exposure
    const sanitisedTitle = sanitiseText(data.title.trim());
    const sanitisedNotes = data.notes ? sanitiseText(data.notes.trim()) : undefined;

    const nowIso = new Date().toISOString();
    const reminderId = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const reminder: PersonalReminder = {
      id: reminderId,
      title: sanitisedTitle.maskedText,
      category: data.category,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      schemeId: data.schemeId,
      schemeName,
      notes: sanitisedNotes ? sanitisedNotes.maskedText : undefined,
      remindBeforeDays: data.remindBeforeDays,
      isCompleted: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const entityValidate = PersonalReminderSchema.safeParse(reminder);
    if (!entityValidate.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Generated reminder entity failed validation.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reminder,
        message: 'Personal reminder prepared successfully. Persist to private local vault.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API calendar/reminders] Error handling request:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating personal reminder.',
        },
      },
      { status: 500 }
    );
  }
}

