import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';
import { NSP_PORTAL_FIELD_DEFS, CURRENT_MAPPING_VERSION } from '@/lib/assistant/engine';

/**
 * Official Scholarship Form Guide API
 * 
 * GET /api/scholarships/[scholarshipId]/form-guide
 * Returns verified portal form fields, accepted formats, and instructions.
 * Strictly adheres to Rule P3 (guides manual entry; never auto-submits).
 */
export async function GET(
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

    return NextResponse.json(
      {
        data: {
          scholarshipId: scheme.id,
          scholarshipCode: scheme.code,
          scholarshipNameEn: scheme.nameEn,
          scholarshipNameHi: scheme.nameHi,
          portalName: 'National Scholarship Portal (NSP)',
          portalUrl: scheme.officialSource.applicationUrl,
          academicYear: scheme.academicYear,
          mappingVersion: CURRENT_MAPPING_VERSION,
          sections: [
            'General Information',
            'Academic Details',
            'Bank Account Details',
            'Contact & Residential Details',
          ],
          fields: NSP_PORTAL_FIELD_DEFS,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Form Guide API] Error fetching form guide:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the form guide.',
        },
      },
      { status: 500 }
    );
  }
}

