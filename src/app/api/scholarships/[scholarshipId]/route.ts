import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';

/**
 * GET /api/scholarships/[scholarshipId]
 * Returns full details, requirements, and official source links for a verified scholarship.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scholarshipId: string }> }
) {
  try {
    const { scholarshipId } = await params;
    const scholarship = getScholarshipById(scholarshipId);

    if (!scholarship) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Scholarship with ID "${scholarshipId}" not found in catalogue.` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      scholarship,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

