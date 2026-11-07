import { NextRequest, NextResponse } from 'next/server';
import { UpdateProfileRequestSchema } from '@/lib/profile/schema';

/**
 * Profile API — Validation Endpoint
 *
 * In MVP (no user accounts, no server-side database), this endpoint
 * validates profile data against the Zod schema and returns the result.
 * Actual persistence is client-side (IndexedDB).
 *
 * POST /api/profile — Validate profile data
 *
 * SAFETY: Never logs request bodies. Never stores raw PII.
 */

export async function POST(request: NextRequest) {
  try {
    // Size check (4 KB limit per AGENTS.md API pipeline)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 4096) {
      return NextResponse.json(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds 4 KB limit.' } },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 }
      );
    }

    const result = UpdateProfileRequestSchema.safeParse(body);

    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Some fields need attention.', details } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'valid',
      message: 'Profile data passed validation.',
      validated: result.data,
    });
  } catch {
    // Never echo internal errors
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}
