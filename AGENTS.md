# AGENTS.md — Permanent Developer & AI Coding Agent Instructions
**Product:** WAJAH (वजह) – Rejection Decoder  
**Context:** Independent Prototype · Not a Government Service · Not affiliated with NSP or any Ministry  
**Authority:** Mandatory permanent instructions for all AI coding agents (Antigravity) and human contributors.  
**Binding Rules:** Governed by `docs/rules.md` and `docs/MASTER-ACCEPTANCE.md`.

---

## 1. Project Purpose & Core Invariants
WAJAH decodes confusing, defective, pending, and rejected National Scholarship Portal (NSP) application statuses into plain language in **English and Hindi**. It identifies **who must act** (Student, Institute, District/State, Bank) and provides $\le 5$ ordered steps ending in an official portal action.
- **P1 — Independent, Not Official:** The non-dismissable disclaimer ribbon (`C-RIBBON`) must be present in the root layout on every screen:  
  `"Independent prototype. Not a government service. Not affiliated with NSP."`  
  Never use government emblems, Ashoka lions, or flag-imitating color combinations.
- **P2 — Explains, Never Decides:** WAJAH explains remarks; it never evaluates scholarship eligibility, never promises approval, and never predicts payment disbursement.
- **P3 — Official Hand-Off:** Every Fix Card ends with an external link button to `scholarships.gov.in`. WAJAH never logs in, edits, or submits forms for students.
- **P5 — Library Is the Sole Advice Source:** All guidance comes from reviewed JSON entries (`content/library/*.json`). Components and AI must never author scholarship advice.
- **P8 — Portal Deadlines Only:** Deadlines fluctuate. Every card must show the saffron warning box: `"Check the date on the portal."` Never hardcode application deadlines.

---

## 2. Documentation Hierarchy & Precedence
When resolving discrepancies, follow this strict precedence:
1. **Explicit Owner Decisions:** Recorded in `OPEN_QUESTIONS.md` with status `[APPROVED]`.
2. **`docs/rules.md`:** The permanent development rulebook and safety tiebreaker.
3. **`docs/MASTER-ACCEPTANCE.md`:** Formal acceptance criteria and blocking release gates.
4. **`docs/prd.md` & `docs/architecture .md`:** Product specification and system architecture.
5. **`docs/techstack.md` & `docs/design.md`:** Technology standards and UI design handbook.
6. **Tiebreaker Rule:** The stricter rule on safety, honesty, and privacy always wins. Never invent requirements silently.

---

## 3. Technology Restrictions
- **Framework:** Next.js 15+ (App Router), React 19, TypeScript 5 (Strict Mode).
- **Styling:** Tailwind CSS v4, DaisyUI 5 semantic component classes (`btn`, `card`, `modal`). Mantine Core 9 primitives namespaced under `@layer mantine`.
- **Icons:** Lucide React (24×24, 2px stroke, `aria-hidden="true"`).
- **Matching Engine:** Pure TypeScript in `src/lib/matcher/`. Zero external fuzzy/ML/vector DB dependencies.
- **Validation:** Zod schemas for all API payloads, AI responses, and library entries.
- **Forbidden Dependencies:** No client-side LangChain, Pinecone, Chroma, or vector stores. No third-party tracking scripts (Google Analytics, Meta Pixel). No runtime machine translation libraries.

---

## 4. Coding Conventions & Architecture Boundaries
- **7-Layer Architecture:**
  1. `src/app/`: Routes, pages, serverless route handlers.
  2. `src/components/`: Pure presentation. **MUST NOT** import from `src/lib/server/`. **MUST NOT** contain hardcoded advice strings.
  3. `src/state/`: In-memory state machine (`decodeMachine.ts`). Decoupled from DOM/React.
  4. `src/lib/sanitise/` & `src/lib/matcher/`: Pure TypeScript. No DOM, `window`, `localStorage`, or network access.
  5. `content/library/`: Reviewed static JSON entries.
  6. `src/lib/server/`: Serverless utilities (AI gateway, rate limiter, schema validator).
  7. Storage: Client localStorage allowlist (3 keys only); optional server database.
- **Naming Conventions:**
  - Files & components: PascalCase (e.g., `FaultBadge.tsx`, `RibbonBanner.tsx`).
  - Pure functions & utilities: camelCase (e.g., `normaliseRemark.ts`, `sanitiseText.ts`).
  - Entry IDs: snake_case with `nsp_` prefix (e.g., `nsp_defective_returned.json`).
  - Feature flags: uppercase snake_case with `FEATURE_` prefix (e.g., `FEATURE_OCR`).

---

## 5. Component Reuse & UI Standards
- Reuse shared components: `RibbonBanner` (`C-RIBBON`), `LanguageSwitch` (`C-LANG`), `FaultBadge`, `StepList`, `SayThis`, `DeadlineBox`, `SourceBox`, `PiiWarning` (`C-PII`), `VoiceSheet` (`C-MIC`), `MatchingOverlay` (`S06`).
- **360px Viewport First:** Mobile-first layout; zero horizontal scrolling (`overflow-x: clip`).
- **Touch Ergonomics:** Minimum interactive touch target is $48\text{px} \times 48\text{px}$ with $\ge 8\text{px}$ gap.
- **Never Rely on Color Alone:** Every fault status badge must feature text, an icon, a distinct border style, and color.

---

## 6. Database & API Conventions
- **Core MVP is Zero-Database:** The core decode loop runs entirely against static bundled JSON. Database (Supabase/Neon/SQLite) is optional post-MVP.
- **Public DB Role is INSERT-Only:** Public reads are prohibited. Reads occur solely via server aggregation functions with $k$-anonymity suppression ($k \ge 10$; groups $< 10$ hidden).
- **Serverless API Request Pipeline (`POST /api/*`):**
  1. Origin verification (`ALLOWED_ORIGINS`).
  2. Request body size check ($\le 4\text{ KB}$).
  3. Rate limiting (20 req / 10 min per IP; daily cap `AI_DAILY_CAP`).
  4. Zod schema validation (reject unknown fields).
  5. Handler execution. Errors return generic JSON; never echo user input.

---

## 7. Privacy & Security Rules (Zero-Trust DPDP Alignment)
- **Sanitize Before Everything:** The PII regex scanner runs before the normalizer strips digits (N5). Aadhaar (12 digits), phone numbers (10 digits), and emails are masked in-place with `[ID]`, `[NUM]`, and `[EMAIL]`.
- **Client Storage Allowlist:** `localStorage` is restricted strictly to 3 keys:
  1. `wajah.lang` (`"en"` | `"hi"`)
  2. `wajah.notice.v1` (`"true"`)
  3. `wajah.consent.stats` (`"true"` | `"false"`, default `"false"`)
- **Zero Raw Text Persistence:** Raw pasted text, OCR images, voice audio, transcripts, grievance notes, and chat messages exist **only in transient memory**. Never write them to localStorage, server logs, or databases.
- **Server-Only Secrets:** AI API keys (`LLM_API_KEY`) and database URLs live strictly in server environment variables. Never prefix secrets with `NEXT_PUBLIC_`.

---

## 8. AI Restrictions & Guardrails
- **AI Never Authors Advice:** The LLM acts purely as an intent classifier selecting an existing entry ID or fixed enum. It never writes explanations, causes, steps, deadlines, or amounts.
- **Structured Schema Gate:** The model must return only valid JSON matching `{ "id": string, "confidence": number, "alternatives": string[], "situation": {...} }`.
- **Defensive Gate:** If JSON fails parsing, contains unknown entry IDs, or violates schema, the server silently returns `{"status": "not_sure", "candidates": []}`. Never throw 500 on LLM failure.
- **Timeout Caps:** Server-to-model timeout is **8.0s**. Client UX progress overlay (`S06`) auto-dismisses at **3.0s** (drops to **1.0s** if local match is confident) and continues locally.
- **Reconciliation Invariant:** If local match is confident ($X$) and AI suggests $Y \ne X$, the system routes to `S07 Disambiguation` to present both. Never silently override a confident local match. AI alone from a weak match never auto-opens a card.

---

## 9. Testing & Acceptance Criteria
- **Blocking Release Gates (G1–G8):**
  - **G1:** Independence ribbon string asserted on all routes.
  - **G2:** Zero scholarship advice strings inside UI components.
  - **G3:** 100% of bundled production entries are `status: "verified"` with source URL, checked date, and 2 reviewers.
  - **G4:** PII sanitizer passes positive/negative tests; zero raw text in logs.
  - **G5:** Matcher achieves $\ge 90\%$ Top-1 accuracy and $\le 2\%$ confident-wrong on test set.
  - **G6:** AI output gate validated; prompt injection tests pass.
  - **G7:** axe-core reports 0 WCAG 2.1 AA violations; touch targets $\ge 48\text{px}$.
  - **G8:** Initial JS bundle $\le 150\text{ KB}$ gzipped; LCP $\le 2.5\text{s}$ on Slow 4G.
- **Definition of Done:** A feature is complete only after unit tests, Playwright E2E tests, and accessibility scans pass. Never claim untested code works.

---

## 10. Mandatory Prohibitions (Check Before Every Merge)
1. ❌ **NEVER invent official NSP rules, dates, deadlines, phone numbers, or URLs.**
2. ❌ **NEVER claim scholarship eligibility or approval.**
3. ❌ **NEVER store, log, or persist raw student text or identifiers.**
4. ❌ **NEVER expose API keys in client-side code or public bundles.**
5. ❌ **NEVER treat draft scholarship entries as verified in production.**
6. ❌ **NEVER present simulated or mock data without a prominent "MOCK DATA" banner.**
7. ❌ **NEVER claim a feature is complete without verified test execution.**
8. ❌ **NEVER modify or delete files inside `/docs`.**

