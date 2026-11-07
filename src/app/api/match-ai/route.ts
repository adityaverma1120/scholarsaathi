import { NextRequest, NextResponse } from 'next/server';
import { sanitiseText } from '../../../lib/sanitise/sanitiser';
import { classifyRemark } from '../../../lib/server/aiGateway';

const MAX_BODY_BYTES = 4096; // 4 KB size cap

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const body = await req.json();
    const query = body?.text || body?.message;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        id: 'none',
        confidence: 0,
        alternatives: [],
        situation: null,
      });
    }

    // 1. Sanitise personal data before anything else (P4, P10)
    const sanitised = sanitiseText(query);

    // 2. Classify via AI gateway
    const result = await classifyRemark(sanitised.maskedText);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      id: 'none',
      confidence: 0,
      alternatives: [],
      situation: null,
      is_simulated: true,
    });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
