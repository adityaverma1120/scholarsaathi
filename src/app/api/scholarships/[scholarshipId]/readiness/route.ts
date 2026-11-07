import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';
import { evaluateScholarshipReadiness } from '@/lib/readiness/engine';
import { EvaluateReadinessRequestSchema } from '@/lib/readiness/schema';
import { StudentProfileSchema } from '@/lib/profile/schema';
import { z } from 'zod';

const ReadinessPayloadSchema = z.object({
  profile: StudentProfileSchema.optional(),
  studentNotes: z.string().max(500).optional(),
  studentConfirmed: z.boolean().default(false),
});

/**
 * Scholarship Application Readiness API
 * 
 * POST /api/scholarships/[scholarshipId]/readiness
 * Evaluates readiness checklist across all 6 technical domains.
 * Rule P2: Explains readiness; never guarantees official scholarship approval.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scholarshipId: string }> }
) {
  try {
    const { scholarshipId } = await context.params;
    const scheme = getScholarshipById(scholarshipId);

    if (!scheme) {
      return NextResponse.json(
        {
          error: {
            code: 'SCHOLARSHIP_NOT_FOUND',
            message: `Scholarship with ID "${scholarshipId}" was not found.`,
          },
        },
        { status: 404 }
      );
    }

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

    const parseResult = ReadinessPayloadSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Readiness evaluation request failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { profile, studentNotes, studentConfirmed } = parseResult.data;

    // Evaluate readiness
    const report = evaluateScholarshipReadiness(
      scheme,
      profile,
      null, // Vault docs loaded on client
      studentConfirmed,
      studentNotes
    );

    return NextResponse.json({ data: report }, { status: 200 });
  } catch (err) {
    console.error('[Readiness API] Error evaluating readiness:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while evaluating application readiness.',
        },
      },
      { status: 500 }
    );
  }
}

