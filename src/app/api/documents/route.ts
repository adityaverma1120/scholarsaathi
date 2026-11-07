import { NextRequest, NextResponse } from 'next/server';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentUploadPayloadSchema,
  verifyFileSignature,
} from '@/lib/vault/schema';

/**
 * Documents API Route — Upload Validation & Categories
 * 
 * GET /api/documents
 * Returns list of supported document categories, size caps, and portal rules.
 * 
 * POST /api/documents
 * Validates uploaded document payload (size, magic bytes, MIME, category).
 * 
 * SAFETY:
 * - 4 KB payload limit for JSON metadata or 5 MB for base64 file payloads
 * - Zero raw text persistence in logs
 * - Enforces magic byte signature verification
 */

export async function GET() {
  const categories = DOCUMENT_CATEGORIES.map(cat => ({
    id: cat,
    labelEn: DOCUMENT_CATEGORY_LABELS[cat].en,
    labelHi: DOCUMENT_CATEGORY_LABELS[cat].hi,
    maxSizeBytes: DOCUMENT_CATEGORY_LABELS[cat].maxSizeBytes,
    allowedFormats: DOCUMENT_CATEGORY_LABELS[cat].allowedFormats,
  }));

  return NextResponse.json({
    status: 'success',
    totalCategories: categories.length,
    categories,
    portalStandards: {
      minRecommendedBytes: 20480, // 20 KB
      generalMaxBytes: 2097152,   // 2 MB
      recommendedFormat: 'application/pdf',
      allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  });
}

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

    const parseResult = DocumentUploadPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Document payload failed validation.', details } },
        { status: 400 }
      );
    }

    const { category, fileName, fileSizeBytes, mimeType, rawBytesBase64 } = parseResult.data;
    const categoryConfig = DOCUMENT_CATEGORY_LABELS[category];

    // Check size limit
    if (fileSizeBytes > categoryConfig.maxSizeBytes) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds maximum permitted ${categoryConfig.maxSizeBytes / (1024 * 1024)} MB for this category.`,
          },
        },
        { status: 413 }
      );
    }

    // Check magic byte signature if base64 provided
    if (rawBytesBase64) {
      try {
        const binary = atob(rawBytesBase64.slice(0, 100)); // Decode only header
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const signature = verifyFileSignature(bytes);
        if (!signature.isValid) {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_FILE_SIGNATURE',
                message: 'The file header does not match a valid PDF, JPEG, PNG, or WebP document.',
              },
            },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: { code: 'DECODE_ERROR', message: 'Failed to decode file header bytes.' } },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      status: 'valid',
      message: 'Document passed initial validation.',
      category,
      fileName,
      fileSizeBytes,
      mimeType,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

