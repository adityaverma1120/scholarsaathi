# MASTER_MEMORY.md — Wajah (Scholarship Rejection Decoder)

**Role of this file:** persistent project memory for Antigravity and any contributor. It is a navigation aid and context summary. It does **not** replace the PRD, rules, architecture, tech stack, app flow or acceptance criteria. Read it before starting any task.

**Created:** 2026-11-02 · **Memory version:** 1.0
**Built from (only these were available at creation):** `memory.md` (consolidated brief + Appendices A–J), `memory__1_.md` (earlier project memory), `WAJAH_MEMORY.md` (earlier project memory), and the creation prompt. The underlying PRD, architecture, rules, app-flow, tech-stack, setup, task, acceptance documents and the original Wajah build specification were **not provided** — their content is known only second-hand through the three memory files.

### Evidence labels used in this file
- **[SPEC]** — stated in the source memory files as a documented requirement or decision.
- **[PROPOSED]** — recommended in the sources but not confirmed as selected.
- **[ASSUMPTION]** — my inference; not a project decision.
- **[OPEN]** — unresolved; see Section O.

### Status labels (use only these)
`NOT STARTED` · `IN PROGRESS` · `COMPLETED` · `BLOCKED` · `NEEDS REVIEW`

> **Global implementation status: no repository, code, deployment or verified content has been confirmed. Everything below is specification unless Section I says otherwise.**

---

## A. Project Identity

| Item | Value |
|---|---|
| Name | **Wajah** ("reason" in Hindi/Urdu) — the *Rejection Decoder* |
| Category | Mobile-first, installable PWA (responsive web app); no native app in MVP |
| Context | Build For Bharat 2026 Pan-India Hackathon, KIET Deemed to be University, Ghaziabad — Problem Statement 1 |
| Spec baseline | Wajah App Build Specification v1.0 / AI-layer update v1.1 (1 Nov 2026) |
| Core problem | Students see confusing National Scholarship Portal (NSP) statuses/remarks and cannot tell what they mean, who must act, or what to do next |
| Target users | Students whose NSP application is pending, defective or rejected in one pilot category. Secondary: caregivers, cyber-cafe helpers, institute nodal officers. Demo persona: portal owner (mock dashboard) |
| Tagline | *Understand your scholarship status. Know what to do next.* |
| Core promise | *Understand what to do next after a rejection — with sources, not guesses.* |
| Positioning | **Independent prototype. Not a government service.** Not affiliated with NSP or any ministry |
| Expected outcome | A student can tap/paste a message and get a reviewed, source-linked explanation: likely meaning, who acts, ≤ 5 ordered steps, source with checked date, and a hand-off to the official NSP page |

---

## B. Project Background

- NSP messages (e.g. "Defective", pending at a level, rejected, approved-but-unpaid) are short and technical. Hypothesised failure points F1–F6 (pending at unknown level; defective vs rejected confusion; terse remarks; correction window closing; unpaid money possibly bank-side; wrong institute/duplicate) are **hypotheses, not findings** (R-HON-03).
- Wajah **explains; it does not decide or act**. Every answer comes from a reviewed library entry; every card ends at an official action performed by the student.
- Pilot scope: one NSP category (Post Matric is an *example*, not confirmed), three groups — **Waiting · Returned (Defective) · Not approved or not paid**. Target 12–15 verified entries drawn from 14 candidates (none verified yet).
- Preserve original terminology: *fix card, reviewed library, tap list, fault label, who acts, checked date, why-line, no-match.*
- Honesty rules for pitch/demo/copy (R-HON-01…06): never claim deployment, government endorsement, live NSP integration, or that NSP wording/rules/deadlines are current; no numeric comprehension claim before the comprehension test is run; say "mock data" aloud when showing the dashboard.

---

## C. Core Application Features

Only features present in the source documents. Priority: **M** Must · **S** Should · **C** Could. Implementation status for all: `NOT STARTED` (see Section I).

| Feature | Pri | Summary |
|---|---|---|
| Scholarship rejection decoding | M | Capture by tap list or pasted text (3–1000 chars) → sanitise → normalise → match → card / choose-list / no-match |
| Reason matching | M | Deterministic local TypeScript matcher over a bundled library; optional AI second opinion (see G) |
| Fix cards | M | Plain-language cause, fault label (words + colour + icon), ≤ 5 ordered steps, "say this" line, source + checked date, trust sentence, **"Open the official NSP page"** |
| Reviewed knowledge library | M | Versioned JSON entries (`nsp_*`); only source of advice. 14 candidates, all DRAFT/UNVERIFIED |
| AI understanding layer | S | Server-side, optional; returns entry ID + enums + numbers only; never prose |
| Guided chatbot | C | Not generative: fixed templates + reviewed entry fields; 13 fixed intents; cut before grievance draft and Hindi text |
| Grievance draft generation | S | Fixed template, ≈150 words; optional AI slot-fill; "Nothing has been filed"; no Send button; review checkbox gates Copy/Share/Print |
| Dashboard and analytics | S | Mock dashboard (`mock: true`, MOCK DATA banner), min group size 10; optional AI cluster panel; anonymous consented events only |
| Language support | M | English + Hindi for all UI/library strings; human-reviewed Hindi; no runtime machine translation; extra language build-time only (High, not MVP) |
| Accessibility / low bandwidth | M | WCAG 2.1 AA, text-first, offline after first load, ≤ 150 KB first-load JS, audio, B/W-friendly print |
| Other S/C | S | Listen (audio), share image 1080×1350, print A4, Hindi voice input, screenshot OCR (on-device), why-line, report-wrong-answer, "This is not my message", feedback |

**Won't (MVP):** state-specific portals (→ no-match with reason), eligibility check, approval/payment prediction, document upload/analysis, NSP login/scraping/submission/editing, direct grievance filing, accounts/saved history, deadline reminders, money tracking, collecting age/DOB/profile.

**Scope cut order when short on time:** *Keep:* tap list + sourced card → fault label + uncertainty → paste + local match → Hindi text → grievance draft. *Cut first:* OCR → second extra language → AI fallback (keep local matcher) → share image (keep print) → dashboard (keep static mock). **Never cut** privacy, source verification, uncertainty handling, or the independence notice.

---

## D. Technology Stack

> **[PROPOSED] throughout.** The sources call these *recommendations*, not confirmed installs. Authoritative detail: `tech-stack.md` / `TECH_STACK.md` (not provided). Do not replace or add technologies without a recorded decision.

| Area | Choice per sources |
|---|---|
| Frontend | Next.js App Router (SSG per card × locale), React, TypeScript, Tailwind CSS; selective shadcn/ui |
| State | XState **or** typed reducer — **[OPEN]** (T-DEC-10, decide against 150 KB budget) |
| i18n | next-intl (`en.json`, `hi.json`; per-string English fallback) |
| Matching | Plain TypeScript, no heavy/fuzzy/ML libraries |
| Backend | Thin stateless Next.js API routes; Zod validation (or Ajv) |
| Database | PostgreSQL (Supabase/Neon) for 3 small tables; SQLite for local demo; **optional** — sources disagree on whether it is needed (see O) |
| AI | Server route → LLM via `MATCH_MODEL`; docs *suggest* `claude-haiku-5-5` as a starting point; provider **not selected** |
| OCR | Tesseract.js EN+HI, on-device, lazy-loaded, flagged |
| Voice | Web Speech API in (`hi-IN`/`en-IN`); `speechSynthesis` out → pre-recorded audio fallback |
| Share/print | `html-to-image` or Canvas (1080×1350 PNG); `@media print` A4 |
| Charts | Recharts or light SVG, always with table alternative, lazy-loaded |
| PWA/offline | Workbox service worker |
| Security | HTTPS+HSTS, strict CSP, server-only secrets, origin check, rate limit, no third-party runtime scripts |
| Dev/test tools | Vitest, Testing Library, Playwright, axe-core, `size-limit`, Lighthouse CI, ESLint import boundaries |
| Hosting | Vercel / Netlify / any Node host, HTTPS only — **not selected** |
| Development environment | Google Antigravity |

**Explicitly NOT in the stack:** accounts/sessions/tracking cookies · third-party analytics/ads/CDN scripts/pixels · runtime machine translation · generative chatbot · native app · document upload · NSP login/scraping · offline event queue · public DB reads · heavy matching libraries · vector DB / RAG (small structured library; deterministic retrieval is simpler and safer).

**Browser support:** Chrome/Edge (latest 2), Firefox (latest 2), Safari 15+, Android Chrome (Android 8+), Samsung Internet; widths 320 px → desktop.

---

## E. System Architecture

**One line:** client-heavy PWA runs the whole decision loop in the browser; a thin stateless API serves only the optional AI second opinion and anonymous consented counters.

**Runtime pipeline (fixed order):**
`Capture → Sanitise → Normalise → Local score (always first, offline) → Decide → [AI understanding] → Reconcile → Decide → Render`
- Tap-list choices skip normalise/match/AI. AI is never called for tap-list choices and never offline.
- **Sanitise before normalise** (the normaliser strips digit runs; a leaked Aadhaar would otherwise vanish silently).
- **Every capture route ends in exactly one of:** entry ID → card · candidate list (≤ 3) → choose screen · no-match.
- **Degradation order, never skipped:** AI result → local candidates → no-match → tap list.

**Layering (ESLint-enforced):** `components/` must not import the AI network client or contain advice strings · `state/` has no React/DOM · `lib/matcher` and `lib/sanitise` are pure (no network/DOM/localStorage) · `lib/library` is data + types · `app/api/*` uses `lib/server/*` only.

**Trust boundaries:** Wajah→NSP = navigation only (new tab, `noopener noreferrer`) · Wajah→LLM = only sanitised, normalised text ≤ 500 chars + server-owned entry list; no identifiers/IP/session · no third-party analytics.

**Data classes:** **A** raw paste/screenshots/audio/grievance fields/application ID → memory only · **B** sanitised normalised text → may go to AI endpoint in one unlogged request · **C** entry IDs/enums/week/optional state → storable with consent.

**Screens/routes:** S01 Home `/` · S02 first-run notice · S03 Tap list `/decode/pick` · S04 Paste(+mic) `/decode/paste` · S05 Scan `/decode/scan` (flag) · S06 Matching overlay · S07 Choose `/decode/choose` · **S08 Fix card `/card/[entryId]`** (SSG) · S09 No match `/no-match` · S10 Grievance (flag) · S11 Share/print · S12 Report `/report` · S13 About `/about` · S14 Dashboard mock `/dashboard` (flag) · S15 Chat `/chat` (flag).

**Decode state machine** (memory only, never persisted; the machine definition *is* the e2e spec): `IDLE · PICKING · PASTING · SCANNING · ERROR_OCR · SANITISING · MATCHING_LOCAL · MATCHING_AI · DISAMBIGUATING · RESULT · NO_MATCH · GRIEVANCE · SHARE · REPORT` (+ `CHAT` sub-state).

**API endpoints (all optional to the core loop):** `POST /api/understand` (+ `/api/match-ai` alias) · `/api/grievance-draft` · `/api/chat-intent` · `/api/ocr` (optional) · `/api/cluster` (admin-only in demo) · `/api/events` (204) · `/api/feedback` (204) · `/api/miss` · `GET /api/dashboard` · static `/library/library-version.json`. Pipeline per POST: origin check → body ≤ 4 KB → rate limit 20/IP/10 min → Zod validate (reject unknown fields) → handler. Errors generic, never echo input. `/api/*` is network-only, never cached.

**Offline:** works after first load — Home, tap list, all cards, About, print, paste + local match, share image, Listen. Needs network: AI, events, feedback, miss, dashboard. Offline banner is the only visible difference.

---

## F. Important Technical Decisions

Decisions below come from the ADR table in `memory.md` (itself derived from `architecture.md`, which was not provided). All are **[SPEC]**; the team lead may overrule any ADR. **Do not change any without recording the change in Section P and updating the dependent documents.**

| ADR | Decision | Documented reason |
|---|---|---|
| 01 | Client-heavy PWA, thin stateless API | Offline/low-bandwidth; privacy |
| 02 | Library JSON is the only advice source; components carry no advice strings (CI scans) | Prevents ungrounded advice |
| 03 | Deterministic local matcher first; AI is a second opinion and cannot silently overrule a confident local match | Safety; works without AI |
| 04 | `FEATURE_AI_ALWAYS`: ON = AI on every free-text decode; OFF = ambiguous/weak only. Both paths maintained and tested | Cost/bandwidth control |
| 05 | Separate `input_channel` (tap/paste/voice/ocr/chat) from `match_path` (tap/local/ai/both/chosen); corrected DB schema supersedes PRD/Word spec | Resolves schema inconsistency |
| 06 | Server→model timeout **8 s**; client wait cap **3 s** (1 s if local confident) | Responsive fallback — see conflict C2 in Section O |
| 07 | Canonical ID is `nsp_rejected_institute` everywhere | Fixes erroneous example |
| 08 | One shared `faultMap.ts` maps `who_acts[0]` → FaultLabel → AI `fault_hint` | Single source of truth |
| 09 | Tap list stays the primary Home action; Scan/Speak secondary | Safest route first |
| 10 | OCR on-device by default, flagged, lazy-loaded; JPEG/PNG/WebP ≤ 5 MB, long edge ≤ 1280 px; Should, cut first | Privacy; schedule risk |
| 11 | Public DB role INSERT-only; reads only via suppression function | Anti re-identification |
| 12 | No accounts, no persistent user text, no offline event queue | Privacy |
| 13 | AI never produces user-visible prose except grievance template slots and cluster labels (both linted, with fallback) | Prevent invented advice |
| 14 | Build-time bundle selection by `DEMO_MODE` (prod bundle physically lacks unverified entries) | Prevent leak of drafts |
| 15 | Server owns the AI entry list keyed by `library_version`; retains recent library hashes | Prevent client tampering |
| 16 | XState or typed reducer for decode flow; chat is a sub-state | Testable flow |
| 17 | No third-party analytics; consented first-party events only | Privacy |

**Other resolved items:** card block order = title → why-line → chips → "What you chose" → portal wording → meaning · 14 candidates are a pool; ship only what clears verification · Hindi "Wajah" = वजह *pending reviewer confirmation*.

**UI/UX decisions [SPEC]:** calm editorial style, not a government look; saffron only as deadline-box highlight (never a fault colour, never flag-imitating); fault state = words + icon + colour + print border (never colour alone); reading level ≈ Class 5; base type 18 px; touch targets ≥ 48 px; design for 360 px first.

**Privacy/security decisions [SPEC]:** no accounts, history, tracking; localStorage exhaustive list = `wajah.lang`, `wajah.notice.v1`, `wajah.consent.stats`; stats consent asked once, OFF by default; no IP/device ID/exact timestamp in any table; secrets server-env only.

---

## G. AI Behaviour and Integration Context

> Authoritative rules live in `rules.md`/`RULES`, `ml-pipeline.md` and `api.md` (not provided). This section is a pointer, not a redefinition. Values shown are as recorded in the sources.

- **Local first.** Deterministic matcher: normalise → score → decide. Confident local = top ≥ **0.85** and lead over runner-up ≥ **0.20**. Ambiguous = 0.50–0.85 or lead < 0.20. Weak < 0.50. Out-of-scope markers → no-match with reason. Whole-library match ≤ 50 ms. Level words (institute/district/state) are high-weight so level pairs never swap. A wrong confident card is worse than asking the student to choose.
- **AI role.** Reads sanitised free text and returns `entry_id` (from the server-owned list or `"none"`), `confidence`, ≤ 2 alternatives, fixed-vocabulary `situation` fields, optional fixed `rationale_code`. temperature 0, `max_tokens` ≈ 150, one call per decode.
- **AI thresholds.** ≥ 0.80 → card · 0.50–0.79 → choose (AI pick first + ≤ 2 alternatives, merged/deduped with local) · `none`/< 0.50/error/timeout/invalid → local ≥ 0.50 on choose, else no-match.
- **Reconciliation.** Local CONFIDENT X + AI Y≠X ≥ 0.80 → **choose [X, Y], never silent** (`disagree`). CONFIDENT X + AI none/error → open X (`local_only`). AMBIG/WEAK + AI ≥ 0.80 → open Y (`ai_only`) **[see conflict C3]**. Situation found but no entry → no-match with "We understood: <status> at <level>, but we have no reviewed card for it yet."
- **Timeouts/limits.** Server→model 8 s; client cap 3 s (1 s if local confident) **[see conflict C2]**; no retry on timeout, one retry only on clear 5xx; 20 req/IP/10 min; `AI_DAILY_CAP` default 2000 → `503 ai_unavailable` → silent local-only.
- **Output hard gate.** Any schema/enum/ID/range failure = "no AI result". Treat model output as untrusted. Model words never reach the UI.
- **Prompt-injection defence (defence in depth).** Sanitiser strips secrets → user text delimited as DATA (`<input>…</input>`) → strict JSON schema → server compares IDs to its own library copy → forbidden-phrase linter → injection tests (AIU-T5).
- **PII sanitisation.** One boundary for every text input (typed, pasted, voice, OCR, grievance notes, feedback, chat). Returns types found, never values; over-masks on purpose; masked preview + user confirmation; synthetic strings only in tests. Pattern masking may miss identifiers — be honest about that in the privacy notice.
- **Restrictions on AI-generated advice.** AI never authors scholarship advice, deadlines, URLs, phone numbers or procedures. Only exceptions: fixed grievance template slots (≤ 40 words each, validated, silently replaced on failure) and dashboard cluster labels (≤ 6 words, linted).
- **Fallback.** Degradation order AI → local candidates → no-match → tap list. The client treats every AI error (400/413/429/502/503/504) as "no AI result". CI never calls a real model; nightly job measures accuracy/cost.
- **Never show confidence scores or percentages to students.** Candidate order is stable on refresh; ≤ 3 candidates.
- **Why-line.** Exactly one per card from typed/spoken/scanned input, from fixed bilingual templates + ≤ 2 matched trigger words.

---

## H. Project Structure

> **No repository has been confirmed to exist.** The tree below is the **specified layout** from the sources (`memory.md` §7.5), **not the actual file system**. Replace with the real structure after the repository is created and update on every structural change.

Specified layout `[SPEC — NOT YET VERIFIED TO EXIST]`:

```
wajah/
├─ content/
│  ├─ library/        one JSON per entry (nsp_*.json) — the only advice source
│  ├─ lint/           forbidden.json, allowed-domains.json
│  ├─ glossary/       glossary.json
│  └─ chat/           templates.json
├─ public/            mock-events.json (generated, "mock": true), audio/ (optional TTS fallback)
├─ scripts/           lint-library.ts, build-library.ts, gen-mock-events.ts, translate-build.ts, gen-audio.ts
├─ src/
│  ├─ app/            routes + api/*/route.ts
│  ├─ components/     RibbonBanner, FaultChip, StepList, SourceBox, SayThis, PiiWarning, LanguageSwitch, ListenButton, ShareImage, ...
│  ├─ lib/            sanitise/ matcher/ ai/ chat/ library/ grievance/ audio/ share/ dashboard/ i18n/ server/
│  ├─ mock/           unmatched.json, clusters.json ("mock": true)
│  └─ state/          decodeMachine.ts
└─ tests/             matcher, sanitise, lint, e2e, a11y
```

Key purposes: `content/library/*` = reviewed entries · `lib/sanitise` = single PII boundary · `lib/matcher` = normalise/score/decide/decode + `variants.json` · `lib/ai` = client, reconcile, why-line, vocabularies · `lib/library/faultMap.ts` = fault-label mapping · `lib/server/*` = rate limit, AI gateway, validation, DB · `scripts/lint-library.ts` = library rules (`npm run lint:library`, non-zero exit on failure).
Config: env vars `AI_PROVIDER_KEY`, `DATABASE_URL` (server-only secrets), `MATCH_MODEL`, `AI_DAILY_CAP`, `ALLOWED_ORIGIN`; flags `DEMO_MODE`, `FEATURE_AI_MATCH`, `FEATURE_AI_ALWAYS`, `FEATURE_OCR`, `FEATURE_OCR_SERVER`, `FEATURE_VOICE_INPUT`, `FEATURE_AI_GRIEVANCE`, `FEATURE_AI_DASHBOARD`, `FEATURE_WHY_LINE`, `FEATURE_CHAT`, `FEATURE_GRIEVANCE`, `FEATURE_DASHBOARD` — each independently toggleable without breaking another flow. Script names `lint:library` and `test:matcher` are named in the spec; the rest are proposed.

---

## I. Development Progress

**Basis: no evidence of any implementation was provided.** Nothing is marked `COMPLETED`. Update only after verification with evidence (tests run, results observed).

### 1. Completed features
None verified.

### 2. Features currently under development
None confirmed.

### 3. Pending features (all `NOT STARTED` unless noted)

| Feature / workstream | Status |
|---|---|
| P0 Verify & capture (real NSP screens, sources, pilot category) | NOT STARTED |
| Repository + Next.js/TypeScript shell + CI | NOT STARTED |
| Independence ribbon + privacy notice | NOT STARTED |
| Library schema + validation (`lint:library`, `build:library`) | NOT STARTED |
| Library content: 14 candidates | NOT STARTED as verified; exist only as DRAFT/UNVERIFIED specification (Appendix A of `memory.md`) |
| Sanitiser (PII masking) | NOT STARTED |
| Normaliser + local matcher + labelled test set (≥ 60 rows) | NOT STARTED |
| Tap list → fix card journey (EN + HI) | NOT STARTED |
| Paste/choose/no-match screens | NOT STARTED |
| Offline/PWA service worker | NOT STARTED |
| AI understanding endpoint + reconciliation + why-line | NOT STARTED |
| Grievance draft | NOT STARTED |
| Listen, share image, print | NOT STARTED |
| Voice input, OCR | NOT STARTED |
| Events/feedback/miss APIs + DB | NOT STARTED |
| Mock dashboard (+ AI clusters) | NOT STARTED |
| Guided chat | NOT STARTED |
| Hardening (a11y, perf, privacy e2e) | NOT STARTED |
| Comprehension test + demo | NOT STARTED |

### 4. Known bugs
None recorded.

### 5. Technical limitations (from the plan, not from observed behaviour)
Pilot limited to one NSP category and EN+HI · draft entries cannot ship in production · state-specific portals route to no-match · OCR largest schedule risk · Web Speech API may send audio to the browser vendor's service (disclose; do not claim local/offline unless verified).

### 6. Blockers
- Phase 0 verification (live NSP wording, correction windows, grievance route, contacts) must precede any entry becoming `verified` — status `BLOCKED` for verification until done.
- Named content reviewer, external reviewer, and Hindi reviewer not confirmed.

---

## J. Current Development State

| Item | State |
|---|---|
| Current phase | Pre-build / documentation consolidation (**[ASSUMPTION]** — first phase in the plan is P0) |
| Most recently completed task | Creation of this file (2026-11-02) |
| Current task | None recorded |
| Files/modules being modified | None |
| Latest verified working functionality | None |
| Errors encountered | None recorded |

**Immediate next steps** (from the plan; confirm with the developer before starting):
1. Confirm which documents exist in the repository and their actual filenames (Section N).
2. Phase 0: capture real NSP screens/wording, pick the pilot category, build the source checklist (Appendix J.1 of `memory.md`).
3. Resolve the pre-build decisions in Section O.
4. Do the **first vertical slice** before any AI/OCR/dashboard work: repo + Next.js/TS app → lint/typecheck/build/test scripts → app shell + independence notice → EN/HI locale structure → library entry type + two clearly labelled sample entries → library validation → sanitiser with tests → local matcher with starter tests → one tap-list-to-fix-card journey → verify it works with AI disabled and offline after first load.

---

## K. Important Constraints

Detailed rules: `MASTER_RULES.md` / `rules.md` (not provided). If anything conflicts with P1–P10, **the principle wins**.

**Product principles**
- **P1** Independent, not official — ribbon "Independent prototype. Not a government service." on every screen (root layout, not dismissable); no government logos/emblems/colours imitated.
- **P2** Explains, never decides — no eligibility ruling, no approval/payment prediction.
- **P3** Every fix ends at an official action ("Open the official NSP page"); Wajah never logs in, edits or submits.
- **P4** Never ask for secrets — no password, OTP, Aadhaar, bank details or application ID fields.
- **P5** Library is the only source of advice. **P6** No source, no entry. **P7** Honest uncertainty: only confident card / choose (≤ 3) / no-match. **P8** Deadlines from portal only — show "Check the date on the portal." unless an official source is stored. **P9** Light and accessible. **P10** Privacy by default.

**Privacy:** no accounts/history/logs of typed text; raw input, OCR images, audio, transcripts, grievance notes and chat are memory-only; screenshots/audio never stored; events only with consent, anonymous, weekly granularity; miss log ≤ 200 chars, 30-day expiry. Check obligations under India's DPDP Act 2023 with a qualified adviser before any real launch (not legal advice).

**Security:** see Section D/E; server logs never contain bodies for `/api/events|feedback|miss|match-ai|understand`; no `dangerouslySetInnerHTML`; external links only to `allowed-domains.json`.

**Accessibility:** WCAG 2.1 AA; contrast ≥ 4.5:1; never colour alone; touch ≥ 48 px; keyboard/screen-reader support; `lang` on page and mixed spans.

**Performance targets (design choices, not measured results):** first-load JS ≤ 150 KB; library ≤ 100 KB; Hindi font subset ≤ 120 KB; LCP ≤ 2.5 s (Slow 4G); local match ≤ 50 ms; first card < 1 s; AI path p90 < 3 s on 4G. OCR, charts, audio fallback, TTS fallback, Devanagari font are lazy-only.

**Content constraints:** steps ≤ 5 (hard, lint) · cause ≤ 25 words using "likely/usually" · forbidden-phrase lint (EN+HI) fails the build · Hindi human-reviewed · `verified` requires official source + `checked_on` + `last_verified_on` + ≥ 2 reviewers (≥ 1 outside the team) + reviewed Hindi + no `machine_translated`.

**Targets (design choices):** Top-1 ≥ 90%; confident-and-wrong ≤ 2% (aim 0); out-of-scope rejected ≥ 90%.

**MVP scope:** Section C. Do not build chat or the AI layer first (R-PRI-01).

**Release blockers (any one stops release):** missing independence notice or implied affiliation · eligibility/approval/payment prediction · advice not grounded in a reviewed entry · `VERIFIED` entry lacking source/date/review evidence · weak or conflicting evidence forcing a match · AI able to write or override advice · secrets or raw input stored/logged · optional-feature failure breaking tap-list/card · Wajah performing or implying an official action · mock dashboard shown as real or exposing groups < 10 · core journey failing privacy/a11y/offline/acceptance checks.

---

## L. Known Issues and Solutions

| Issue | Cause | Attempted | Verified solution | Status |
|---|---|---|---|---|
| None observed (no code exists) | — | — | — | — |

Documentation-level inconsistencies already resolved by ADRs (record only; these are paper fixes, not tested): old `match_events` schema → ADR-05 · OCR 1600 px vs 1280 px → ADR-10 · Scan-first door order → ADR-09 · client wait 9 s → ADR-06 · `nsp_rejected_by_institute` → ADR-07.

Troubleshooting pointers (expected behaviours, per `memory.md` §22): entry missing from tap list → rebuild library/check mode; AI always "no result" → check `ALLOWED_ORIGIN`, `library_version`, `AI_DAILY_CAP`; `429` is expected; Scan/Mic hidden = flag off; dashboard refusing to render without banner is deliberate.

*Never record an unverified fix as successful.*

---

## M. Pending Tasks and Roadmap

Planning estimate in the sources ≈ 16–18 build days for a small team in parallel — an estimate, not a promise. Phase order matters more than day counts (R-PROC-01). Dependencies shown after `←`.

**Critical**
- P0: capture real NSP wording/screens; answer OQ1–OQ5; assemble source list. *(blocks every `verified` entry)*
- Confirm repository state and actual doc filenames.
- Pre-build decisions T-DEC-01…11 (Section O).
- P1: repo, Next.js shell, CI, locale/content structure.
- P2: library schema + lint; sanitiser; normaliser; matcher + labelled set (≥ 60 rows) ← P1.
- P3: tap list, paste, choose, fix card, no-match, EN+HI ← P2.

**High priority**
- Source and review ≥ 12 entries (≥ 1 external reviewer, Hindi reviewer) ← P0.
- Privacy/PII e2e tests; offline/PWA ← P3.
- P4: AI endpoint, reconciliation, why-line, injection + failure tests ← P2/P3 stable.
- P6: hardening (a11y, perf budgets, privacy gates).
- P7: comprehension test (10–20 students) + 3-minute demo + recorded fallback.

**Medium priority**
- Listen (audio), print, share image; grievance draft (EN template; Hindi template `[NEEDS REVIEW]`) ← verified entries with `grievance_enabled`.
- Events/feedback/miss APIs + DB ← DB decision.
- Mock dashboard ← mock generator (`gen-mock-events.ts`).

**Low priority**
- Hindi voice input → AI grievance slot-fill → OCR → AI dashboard clusters → guided chat (build order, after core loop is real). AI-layer **cut** order is the reverse-ish list: AIU-06 → AIU-01 → AIU-02 → AIU-04 → AIU-03 → AIU-05 (do not confuse the two).
- Second extra language (build-time only).

---

## N. Important File References

Filenames differ between the three source memory files. **Use the names that actually exist in the repository and correct this table.**

| Purpose | Names seen in sources | Verified present? |
|---|---|---|
| Rules (non-negotiables) | `rules.md` / `RULE.md` / prompt: `MASTER_RULES.md` | Not verified |
| Product requirements | `PRD.md` / `prd.md` / prompt: `MASTER_PRD.md` | Not verified |
| Tech stack | `tech-stack.md` / `TECH_STACK.md` | Not verified |
| Acceptance criteria | `acceptance.md` / prompt: `ACCEPTANCE_CRITERIA.md` | Not verified |
| Setup | `setup.md` / prompt: `SETUP.md` | Not verified |
| Tasks | `task.md` / `tasks.md` / `TASK.md` / prompt: `TASKS.md` | Not verified |
| App flow | `app-flow.md` / `appflow.md` / `APP_FLOW.md` | Not verified |
| Architecture | `architecture.md` / `ARCHITECTURE.md` / `docs/architecture/` | Not verified |
| Also referenced | `design.md`, `database.md`, `api.md`, `components.md`, `ml-pipeline.md`, `README.md`, `docs/INDEX.md`, original *Wajah App Build Specification v1.1* | Not verified |
| Consolidated briefs | `memory.md` (full, with Appendices A–J), `memory__1_.md`, `WAJAH_MEMORY.md` | Provided |

**Appendices in `memory.md` worth opening on demand:** A (14 candidate entries + capture protocol) · B (EN/HI copy deck) · C (grievance templates) · D (AI prompts) · E (API samples/errors) · F (guided chat) · G (About/dashboard/cluster panel) · H (AI-layer additions) · I (decision outline sketch) · J (personas, Phase 0 checklist, requirement ID modules).

---

## O. Open Questions and Unresolved Decisions

### Conflicts between documents (not silently resolved)

| # | Conflict | Documents | Current handling |
|---|---|---|---|
| C1 | **Source precedence differs.** Prompt: original spec → MASTER_RULES → MASTER_PRD → TECH_STACK → architecture/flow → acceptance → task/setup. `memory.md`: architecture ADRs → rules → app-flow → tech-stack → PRD → Word spec | Creation prompt vs `memory.md` | Unresolved; ask developer which order governs |
| C2 | **AI timeout.** `WAJAH_MEMORY.md`: server-side 8 s. `memory__1_.md`: strict 3 s target/cap; older table says 8 s server / 9 s client; asks for a formal decision. `memory.md` ADR-06: server→model 8 s, client cap 3 s (1 s if local confident) | All three | Recorded as ADR-06 above; needs formal confirmation and code/API/architecture/test alignment |
| C3 | **Can AI alone auto-open a card?** `memory.md` reconciliation: AMBIG/WEAK local + AI ≥ 0.80 → open Y (`ai_only`). `memory__1_.md` lists this as an undecided item ("default conservatively; require explicit tested decision") | `memory.md` vs `memory__1_.md` | Open; default conservatively until decided |
| C4 | **Database necessity.** `memory.md` lists PostgreSQL + 3 tables and DB env var; `WAJAH_MEMORY.md` says use PostgreSQL only if a justified requirement emerges and not by default; `memory__1_.md` says optional/not selected | All three | Open |
| C5 | **AI model.** `memory.md` suggests `claude-haiku-5-5`; other two say provider/model not selected | All three | Treated as suggestion only |
| C6 | **Chat scope.** "Could" in `memory.md`; optional/conditional in the others; inclusion in demo undecided | All three | Open |
| C7 | **Filenames** for rules/task/app-flow/etc. differ across sources and from the prompt (Section N) | All | Verify against repository |
| C8 | **OCR details** conflict in sources (1600 vs 1280 px; "JPG/PNG/WebP" vs "JPEG/PNG") | PRD/Word spec vs AI-layer | ADR-10 chosen: 1280 px, JPEG/PNG/WebP, ≤ 5 MB |
| C9 | Word spec title says v1.0 in places, derivation says v1.1 with Chat and AI layer | Word spec | Treat v1.1 as baseline |

### Decisions awaiting confirmation
1. Ship with AI, and which provider/model, or explicit decision to ship without AI (T-DEC-06 / OQ-A3).
2. Database choice: PostgreSQL via Supabase/Neon, SQLite for demo, or none.
3. Hosting provider and DB region (OQ9); HTTPS/server-route support.
4. XState vs typed reducer (T-DEC-10).
5. Whether guided chat, voice, OCR (on-device only vs + server — OQ-A2), audio, share export, dashboard (OQ-A4) are in demo scope.
6. Final timeout, daily AI cap, rate-limit storage approach, confidence thresholds.
7. Demo language Hindi vs English (OQ-A1; decides whether voice is Must).
8. Whether unverified entries appear in the demo with a Draft banner (OQ8).
9. Second extra language (OQ6).
10. Event/feedback consent and retention choices.
11. Permission to use NSP wording/screens (OQ10).

### Missing information
- Pilot NSP scholarship category (Post Matric is only an example).
- Verified library entries — **none**; all 14 are DRAFT/UNVERIFIED; most have only third-party support.
- Live NSP wording, correction-window rules, grievance route, permitted helpline/contact details (OQ1–OQ4); whether NSP has added its own status-explanation tool (OQ5).
- Whether meaningful numbers appear in real NSP messages (OQ7 — affects normaliser step N5).
- Which team members fill which roles; named content reviewer, external reviewer (e.g. a college scholarship clerk), Hindi reviewer (OQ-A5).
- Confirmation of "वजह" transliteration.
- PFMS or other payment page for entries 12–14.
- Whether any repository, deployment, or user research exists.
- Exact device/browser support matrix; legal/privacy review.

### Rule
Never convert an assumption into a project decision. Record decisions with date and decider in Section P.

---

## P. Development Session History

| Date | Objective | Work completed | Files changed | Decisions made | Problems discovered | Next steps |
|---|---|---|---|---|---|---|
| 2026-11-02 | Create `MASTER_MEMORY.md` | Reviewed the three uploaded memory files and consolidated them into this file | `MASTER_MEMORY.md` (created); no source code or other docs touched | None (no new decisions recorded; everything marked [SPEC]/[PROPOSED]/[ASSUMPTION]/[OPEN]) | Original PRD/spec and companion docs not available; no repository to inspect; conflicts C1–C9 | Section J immediate next steps |

---

## Maintenance rules for Antigravity

1. Read this file before each new development task; then read the specific authoritative documents for that task. Inspect the actual repository before editing.
2. Update **only** the affected sections after significant work. Do not rewrite the whole file for small changes.
3. Update an existing entry instead of adding a duplicate. Preserve verified information; remove outdated information only when superseded, and note what replaced it.
4. Change a feature's status only after verification (tests actually run, results observed). Never mark `COMPLETED` from generated code or a passing build alone.
5. Record architectural changes and decisions in F (with reason) and in P (date, decider). Never silently change an ADR.
6. Record conflicts in O instead of choosing the easiest interpretation. Preserve the strictest safety/privacy rule while a conflict is open.
7. Once the repository exists, replace the specified tree in H with the real one and fix the filenames in N.
8. Keep sessions in P concise: date, objective, work, files, decisions, problems, next steps.

*Independent prototype · Not a government service · All NSP facts must be re-verified against live NSP pages before any real use.*
