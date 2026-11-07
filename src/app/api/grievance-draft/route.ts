import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { sanitiseText } from '../../../lib/sanitise/sanitiser';
import { validateSlot } from '../../../lib/ai/forbidden';
import type { LibraryEntry } from '../../../lib/library/types';

const MAX_BODY_BYTES = 4096;
const LIBRARY_FILE = path.resolve('data/library.json');

const GrievanceInputSchema = z.object({
  entry_id: z.string().min(1),
  notes: z.string().max(500).optional().default(''),
  actions_done: z.array(z.string()).optional().default([]),
  days_since: z.number().int().min(0).max(365).optional(),
  language: z.enum(['en', 'hi']).optional().default('en'),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const json = await req.json();
    const parsed = GrievanceInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid grievance parameters' }, { status: 400 });
    }

    const { entry_id, notes, actions_done, days_since, language } = parsed.data;

    // Load library entry
    if (!fs.existsSync(LIBRARY_FILE)) {
      return NextResponse.json({ error: 'Library unavailable' }, { status: 500 });
    }
    const library: LibraryEntry[] = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf8'));
    const entry = library.find(e => e.id === entry_id);
    if (!entry) {
      return NextResponse.json({ error: 'Entry ID not found' }, { status: 404 });
    }

    // Sanitise student notes
    const sanitisedNotes = sanitiseText(notes).maskedText;

    const apiKey = process.env.LLM_API_KEY || process.env.AI_PROVIDER_KEY;
    const aiEnabled = process.env.NEXT_PUBLIC_FEATURE_AI_GRIEVANCE === 'true' && Boolean(apiKey);

    // Precompute safe reviewed template fallback slots
    const fallbackSlots = generateTemplateSlots(entry, sanitisedNotes, actions_done, days_since, language);

    // If live API key is available and enabled, we could query LLM; otherwise template assistant
    if (aiEnabled && apiKey && apiKey !== 'your_llm_api_key_here') {
      try {
        const baseUrl = process.env.LLM_BASE_URL || 'https://api.x.ai/v1';
        const model = process.env.LLM_MODEL || 'grok-2-latest';

        const systemPrompt = `You are a formal letter assistant for scholarship representations. Generate respectful, objective grievance letter slots.
Rules:
- Output ONLY a JSON object:
  {"grievance_cause": "<string>", "actions_summary": "<string>", "requested_relief": "<string>"}
- Never claim the student is eligible or guaranteed approval.
- Never invent dates or reference numbers.
- Output in ${language === 'hi' ? 'Hindi' : 'English'}.`;

        const userPrompt = `Status: ${entry.what_the_screen_says}
Official explanation: ${entry.cause.en}
Student notes: ${sanitisedNotes}
Actions taken: ${actions_done.join(', ')}
Days pending: ${days_since || 'N/A'}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const aiRes = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData?.choices?.[0]?.message?.content;
          if (content) {
            const parsedSlots = JSON.parse(content.replace(/^```json/m, '').replace(/```$/m, '').trim());

            // Validate each slot against forbidden phrases, ID runs, and length limits
            const safeCause = validateSlot(
              sanitiseText(parsedSlots.grievance_cause || '').maskedText,
              fallbackSlots.grievance_cause
            );
            const safeActions = validateSlot(
              sanitiseText(parsedSlots.actions_summary || '').maskedText,
              fallbackSlots.actions_summary
            );
            const safeRelief = validateSlot(
              sanitiseText(parsedSlots.requested_relief || '').maskedText,
              fallbackSlots.requested_relief
            );

            return NextResponse.json({
              slots: {
                grievance_cause: safeCause,
                actions_summary: safeActions,
                requested_relief: safeRelief,
              },
              is_simulated: false,
            });
          }
        }
      } catch {
        // Fallback to template assistant
      }
    }

    // Template-based Assistant (Identified Fallback)
    return NextResponse.json({
      slots: fallbackSlots,
      is_simulated: true,
      source: 'template_assistant',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate representation' }, { status: 400 });
  }
}

function generateTemplateSlots(
  entry: LibraryEntry,
  sanitisedNotes: string,
  actionsDone: string[],
  daysSince?: number,
  language: string = 'en'
) {
  const isHi = language === 'hi';

  let causeText = isHi
    ? `मेरा आवेदन वर्तमान में "${entry.what_the_screen_says}" के रूप में प्रदर्शित हो रहा है।`
    : `My application is currently showing the status "${entry.what_the_screen_says}".`;

  if (sanitisedNotes) {
    causeText += isHi
      ? ` अतिरिक्त विवरण: ${sanitisedNotes}`
      : ` Additional circumstances: ${sanitisedNotes}`;
  }

  let actionsText = '';
  if (actionsDone.length > 0) {
    actionsText = isHi
      ? `मैंने पहले ही निम्नलिखित प्रक्रिया पूर्ण कर ली है: ${actionsDone.join(', ')}।`
      : `I have already undertaken the following actions: ${actionsDone.join(', ')}.`;
  } else {
    actionsText = isHi
      ? 'मैंने अपने सभी मूल दस्तावेज एवं आवेदन पत्र का सत्यापन करा लिया है।'
      : 'I have verified all my physical credentials and certificates as instructed.';
  }

  if (daysSince && daysSince > 0) {
    actionsText += isHi
      ? ` आवेदन पिछले ${daysSince} दिनों से इसी स्थिति में है।`
      : ` The application has remained in this status for approximately ${daysSince} days.`;
  }

  const reliefText = isHi
    ? 'अतः आपसे विनम्र अनुरोध है कि कृपया संबंधित पटल पर मेरे आवेदन की समीक्षा एवं सत्यापन करने की कृपा करें ताकि प्रक्रिया समय पर पूर्ण हो सके।'
    : 'I respectfully request you to kindly examine my submission and expedite the verification/clarification process before the portal deadline.';

  return {
    grievance_cause: causeText,
    actions_summary: actionsText,
    requested_relief: reliefText,
  };
}

