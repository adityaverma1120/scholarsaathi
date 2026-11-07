import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/catalogue/engine';
import {
  CreateTrackedApplicationRequestSchema,
  TrackedApplicationSchema,
  maskApplicationId,
  type TrackedApplication,
} from '@/lib/tracker/schema';

/**
 * Scholarship Applications Tracking API
 * 
 * POST /api/applications
 * Validates and prepares a new tracked application entity.
 * Strictly adheres to Spec 12 Section 4 (never claims live tracking; masks identifiers).
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

    const parseResult = CreateTrackedApplicationRequestSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Application tracking request failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { scholarshipId, rawApplicationId, initialStatus, initialRemark, inputMethod, studentNotes } =
      parseResult.data;

    const scheme = getScholarshipById(scholarshipId);
    if (!scheme) {
      return NextResponse.json(
        {
          error: {
            code: 'SCHOLARSHIP_NOT_FOUND',
            message: `Scholarship "${scholarshipId}" not found in catalogue.`,
          },
        },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const maskedId = maskApplicationId(rawApplicationId || '');

    const trackedApp: TrackedApplication = {
      id: `app_${scheme.id}_${Date.now()}`,
      scholarshipId: scheme.id,
      scholarshipCode: scheme.code,
      scholarshipNameEn: scheme.nameEn,
      scholarshipNameHi: scheme.nameHi,
      portalName: scheme.state === 'Uttar Pradesh' ? 'UP Scholarship Portal' : 'National Scholarship Portal (NSP)',
      portalUrl: scheme.officialSource.applicationUrl,
      academicYear: scheme.academicYear,
      maskedApplicationId: maskedId,
      currentStatus: initialStatus,
      statusLabelEn: initialStatus.replace(/_/g, ' ').toUpperCase(),
      statusLabelHi: initialStatus.replace(/_/g, ' '),
      whoActs:
        initialStatus === 'defective_correction_needed' || initialStatus === 'rejected'
          ? 'STUDENT'
          : initialStatus === 'submitted_pending_institute'
          ? 'INSTITUTE'
          : initialStatus === 'pending_district_state'
          ? 'DISTRICT_STATE'
          : 'PORTAL',
      inputMethod,
      isLiveLookup: false, // Student-recorded status
      timelineEvents: [
        {
          id: `evt_init_${Date.now()}`,
          status: initialStatus,
          statusLabelEn: initialStatus.replace(/_/g, ' ').toUpperCase(),
          statusLabelHi: initialStatus.replace(/_/g, ' '),
          recordedAt: now,
          rawRemark: initialRemark,
          whoActs: 'INSTITUTE',
          notes: studentNotes,
          inputMethod,
        },
      ],
      nextActionEn: 'Track institute verification status on the official portal.',
      nextActionHi: 'आधिकारिक पोर्टल पर संस्थान सत्यापन स्थिति की जाँच करें।',
      officialHelpdeskUrl: scheme.officialSource.applicationUrl,
      officialGrievanceUrl: scheme.state === 'Uttar Pradesh' ? 'https://jansunwai.up.nic.in' : 'https://pgportal.gov.in',
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ data: trackedApp }, { status: 201 });
  } catch (err) {
    console.error('[Applications API] Error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while tracking the application.',
        },
      },
      { status: 500 }
    );
  }
}

