import { NextRequest, NextResponse } from 'next/server';
import { FeedbackInputSchema } from '../../../lib/server/db/schema';
import { db } from '../../../lib/server/db/index';

const MAX_BODY_BYTES = 4096; // 4 KB size cap

export async function POST(req: NextRequest) {
  try {
    // 1. Check Content-Length cap
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const json = await req.json();

    // 2. Strict Zod Schema Validation
    const parsed = FeedbackInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid feedback submission' }, { status: 400 });
    }

    // 3. Insert into repository
    db.insertFeedback(parsed.data);

    // 4. Return success without echoing submitted note
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    if (err?.message?.includes('Unknown library entry_id')) {
      return NextResponse.json({ error: 'Referenced entry not found in active library' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 400 });
  }
}

// Restricted Table: Public clients MUST NOT read feedback rows directly
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Feedback table is restricted.' },
    { status: 405 }
  );
}

