import { NextRequest, NextResponse } from 'next/server';
import { EvaluateEligibilityRequestSchema } from '@/lib/eligibility/schema';
import { runEligibilityEvaluation } from '@/lib/eligibility/engine';

/**
 * Deterministic Scholarship Eligibility Evaluation API Route
 * 
 * POST /api/eligibility/evaluate
 * Evaluates a student profile against structured scholarship rules.
 * Strictly adheres to 3-valued logic (PASS, FAIL, UNKNOWN) and Rule P2 (explains, never decides).
 * No raw PII is logged or persisted to server storage.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Check payload size limit (4 KB per AGENTS.md Section 6)
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

    const parseResult = EvaluateEligibilityRequestSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Eligibility evaluation payload failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { profile, scholarshipIds, uploadedDocumentCategories } = parseResult.data;

    // Run deterministic engine
    const evaluationBatch = runEligibilityEvaluation(
      profile,
      scholarshipIds,
      uploadedDocumentCategories
    );

    return NextResponse.json({ data: evaluationBatch }, { status: 200 });
  } catch (err) {
    console.error('[Eligibility API] Error processing evaluation request:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while evaluating scholarship eligibility.',
        },
      },
      { status: 500 }
    );
  }
}

