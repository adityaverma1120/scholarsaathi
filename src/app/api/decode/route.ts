import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { sanitiseText } from '../../../lib/sanitise/sanitiser';
import { scoreEntries } from '../../../lib/matcher/scorer';
import { classifyRemark } from '../../../lib/server/aiGateway';
import { reconcileMatches } from '../../../lib/ai/reconcile';
import type { LibraryEntry } from '../../../lib/library/types';

const MAX_BODY_BYTES = 4096;

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const body = await req.json();
    const { message, entry_id } = body;

    const libraryPath = path.resolve('data/library.json');
    if (!fs.existsSync(libraryPath)) {
      return NextResponse.json({ status: 'not_sure', candidates: [], official: 'https://scholarships.gov.in/' });
    }

    const library: LibraryEntry[] = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));

    // 1. Direct Entry ID lookup (no matching needed, O(1))
    if (entry_id && typeof entry_id === 'string') {
      const entry = library.find(e => e.id === entry_id);
      if (entry) {
        return NextResponse.json({
          status: 'match',
          entry,
          confidence: 1.0,
        });
      }
    }

    // 2. Message matching
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        status: 'not_sure',
        candidates: [],
        official: 'https://scholarships.gov.in/',
      });
    }

    // Mask personal data before matching or logging (P4, P10)
    const sanitised = sanitiseText(message);

    // Run deterministic scoring matcher
    const localOutcome = scoreEntries(sanitised.maskedText, library);

    // If local match is confident, we can return immediately or reconcile with AI
    let aiResult = null;
    if (localOutcome.band !== 'CONFIDENT') {
      try {
        aiResult = await classifyRemark(sanitised.maskedText);
      } catch {
        // Defensive: AI failure transparently falls back to local outcome
        aiResult = null;
      }
    }

    // Reconcile local and AI match results enforcing safety invariants
    const reconciled = reconcileMatches(localOutcome, aiResult, library);

    if (reconciled.action === 'auto_open' && reconciled.selectedEntryId) {
      const selected = library.find(e => e.id === reconciled.selectedEntryId);
      if (selected) {
        return NextResponse.json({
          status: 'match',
          entry: selected,
          confidence: reconciled.confidence_score,
          match_path: reconciled.match_path,
        });
      }
    }

    if (reconciled.action === 'choose') {
      return NextResponse.json({
        status: 'not_sure',
        candidates: reconciled.candidates.slice(0, 3),
        official: 'https://scholarships.gov.in/',
        match_path: reconciled.match_path,
      });
    }

    return NextResponse.json({
      status: 'not_sure',
      candidates: [],
      official: 'https://scholarships.gov.in/',
    });
  } catch {
    // Defensive: never throw 500 on LLM failure or parse error
    return NextResponse.json(
      { status: 'not_sure', candidates: [], official: 'https://scholarships.gov.in/' },
      { status: 200 }
    );
  }
}

export async function GET() {
  try {
    const libraryPath = path.resolve('data/library.json');
    if (!fs.existsSync(libraryPath)) {
      return NextResponse.json({ chips: [] });
    }
    const library: LibraryEntry[] = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
    const chips = library.map(e => ({
      id: e.id,
      label: e.what_the_screen_says,
    }));
    return NextResponse.json({ chips });
  } catch {
    return NextResponse.json({ chips: [] });
  }
}
