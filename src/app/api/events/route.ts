import { NextRequest, NextResponse } from 'next/server';
import { MatchEventInputSchema } from '../../../lib/server/db/schema';
import { db } from '../../../lib/server/db/index';

const MAX_BODY_BYTES = 4096; // 4 KB size cap

export async function POST(req: NextRequest) {
  try {
    // 1. Check Content-Length cap
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }

    const json = await req.json();

    // 2. Strict Zod Schema Validation (reject unknown fields)
    const parsed = MatchEventInputSchema.safeParse(json);
    if (!parsed.success) {
      // Return 400 with generic error (never echo user input)
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    // 3. Consent Gate: Opt-in only
    if (parsed.data.consent !== true) {
      // Event dropped without storage
      return new NextResponse(null, { status: 204 });
    }

    // 4. Insert into repository
    db.insertMatchEvent(parsed.data);

    // 5. Fire-and-forget success response
    return new NextResponse(null, { status: 204 });
  } catch {
    // Generic fallback: never echo error or user data
    return new NextResponse(null, { status: 204 });
  }
}

// Restricted Table: Public clients MUST NOT read operational tables directly
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Public reads prohibited on operational tables.' },
    { status: 405 }
  );
}

