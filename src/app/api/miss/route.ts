import { NextRequest, NextResponse } from 'next/server';
import { MissLogInputSchema } from '../../../lib/server/db/schema';
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
    const parsed = MissLogInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid miss log submission. Explicit consent and masked text under 200 chars required.' },
        { status: 400 }
      );
    }

    // 3. Insert into repository (applies server-side re-sanitisation & 30-day expiry)
    db.insertMissLog(parsed.data);

    // 4. Return success
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to record unrecognised remark' }, { status: 400 });
  }
}

// Restricted Table: Public clients MUST NOT read miss_log rows directly
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Miss log table is restricted.' },
    { status: 405 }
  );
}

