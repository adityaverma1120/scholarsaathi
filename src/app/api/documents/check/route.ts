import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategorySchema } from '@/lib/vault/schema';
import { runDocumentChecks } from '@/lib/vault/checker';
import { z } from 'zod';

const RunCheckRequestSchema = z.object({
  category: DocumentCategorySchema,
  fileName: z.string().min(1).max(255),
  fileSizeBytes: z.number().int().min(1),
  mimeType: z.string().min(1),
  rawBytesBase64: z.string().optional(),
});

/**
 * POST /api/documents/check
 * Runs automated readiness checks for an uploaded document against official scholarship portal rules.
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

    const parseResult = RunCheckRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid check request parameters.' } },
        { status: 400 }
      );
    }

    const { category, fileName, fileSizeBytes, mimeType, rawBytesBase64 } = parseResult.data;

    let bytes: Uint8Array | undefined;
    if (rawBytesBase64) {
      try {
        const binary = atob(rawBytesBase64.slice(0, 100));
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
      } catch {
        // Continue with basic validation
      }
    }

    const analysis = runDocumentChecks(category, fileName, fileSizeBytes, mimeType, bytes);

    return NextResponse.json({
      status: 'success',
      category,
      fileName,
      fileSizeBytes,
      analysis,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred during document checks.' } },
      { status: 500 }
    );
  }
}

