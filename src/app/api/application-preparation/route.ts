import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';
import { generateApplicationPreparationForm } from '@/lib/assistant/engine';
import { StudentProfileSchema } from '@/lib/profile/schema';
import { z } from 'zod';

const GeneratePrepPayloadSchema = z.object({
  scholarshipId: z.string().min(1),
  profile: StudentProfileSchema.optional(),
});

/**
 * Application Preparation Workspace API
 * 
 * POST /api/application-preparation
 * Generates or updates reviewable candidate form values with provenance.
 * Strictly adheres to Rule P3 (guides student manual entry; never auto-submits).
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

    const parseResult = GeneratePrepPayloadSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Preparation request failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { scholarshipId, profile } = parseResult.data;
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

    const preparedForm = generateApplicationPreparationForm(scheme, profile, null);

    return NextResponse.json({ data: preparedForm }, { status: 200 });
  } catch (err) {
    console.error('[Application Preparation API] Error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating application preparation form.',
        },
      },
      { status: 500 }
    );
  }
}

