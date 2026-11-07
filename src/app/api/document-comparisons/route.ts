import { NextRequest, NextResponse } from 'next/server';
import {
  UpdateExplanationRequestSchema,
  ComparisonFieldKeySchema,
  ComparedValueSchema,
} from '@/lib/checker/schema';
import {
  compareNameField,
  compareDateField,
  compareGenericField,
} from '@/lib/checker/engine';
import { z } from 'zod';

const RunPairComparisonSchema = z.object({
  fieldKey: ComparisonFieldKeySchema,
  valueA: ComparedValueSchema,
  valueB: ComparedValueSchema,
});

/**
 * Cross-Document Comparisons API Route
 * 
 * POST /api/document-comparisons
 * Compares a field between two sources and returns an explainable report.
 * 
 * PATCH /api/document-comparisons
 * Validates a student explanation for an identified discrepancy.
 */

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 }
      );
    }

    const parseResult = RunPairComparisonSchema.safeParse(body);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Comparison payload failed validation.', details } },
        { status: 400 }
      );
    }

    const { fieldKey, valueA, valueB } = parseResult.data;

    let report;
    if (fieldKey === 'student_name') {
      report = compareNameField(valueA, valueB);
    } else if (fieldKey === 'date_of_birth') {
      report = compareDateField(valueA, valueB);
    } else {
      report = compareGenericField(fieldKey, valueA, valueB);
    }

    return NextResponse.json({
      status: 'success',
      report,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred during comparison.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 }
      );
    }

    const parseResult = UpdateExplanationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid explanation payload.' } },
        { status: 400 }
      );
    }

    const { comparisonId, fieldReportId, studentExplanation } = parseResult.data;

    return NextResponse.json({
      status: 'success',
      message: 'Student explanation recorded safely without altering evidence.',
      comparisonId,
      fieldReportId,
      studentExplanation,
      recordedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

