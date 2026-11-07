import { NextRequest, NextResponse } from 'next/server';
import { generateGrievanceDraft } from '@/lib/tracker/grievance';
import { TrackedApplicationSchema } from '@/lib/tracker/schema';
import { StudentProfileSchema } from '@/lib/profile/schema';
import { z } from 'zod';

const GrievanceRequestSchema = z.object({
  application: TrackedApplicationSchema,
  profile: StudentProfileSchema.optional(),
  specificReason: z.string().max(500).optional(),
});

/**
 * Grievance Draft Generator API
 * 
 * POST /api/grievance-drafts
 * Generates an editable formal representation routed to official grievance channels (CPGRAMS / Jan Sunwai).
 * Zero raw PII persisted to server.
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

    const parseResult = GrievanceRequestSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Grievance draft request failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { application, profile, specificReason } = parseResult.data;
    const draft = generateGrievanceDraft(application, profile, specificReason);

    return NextResponse.json({ data: draft }, { status: 200 });
  } catch (err) {
    console.error('[Grievance Drafts API] Error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating grievance draft.',
        },
      },
      { status: 500 }
    );
  }
}

