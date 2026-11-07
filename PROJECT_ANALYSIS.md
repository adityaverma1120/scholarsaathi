# WAJAH (वजह) — Comprehensive Project & Architecture Analysis
**Product Name:** WAJAH – Rejection Decoder  
**Tagline:** *Understand your scholarship status. Know what to do next.*  
**Context:** Build For Bharat 2026 Pan-India Hackathon (Hosted at KIET Deemed to be University, Ghaziabad) — Problem Statement 1  
**Document Role:** Master Architectural Synthesis, System Analysis, Boundary Specification & Risk Audit  
**Status:** Pre-Implementation Architectural Baseline (Awaiting Owner Approval)  
**Governance:** Bound by `MASTER_RULES.md`, `MASTER-ACCEPTANCE.md`, `techstack.md`, and `prd.md`

---

## 1. Executive Summary & Product Mission

### 1.1 The Core Student Problem
In India, hundreds of thousands of low-income, first-generation students rely on government post-matric and pre-matric scholarships distributed through the **National Scholarship Portal (NSP)** to fund their higher education. However, every year an alarming number of eligible students lose their scholarships not due to genuine ineligibility, but due to administrative friction, opaque technical remarks, and strict submission deadlines:
- **Terse and Cryptic Portal Statuses:** Remarks such as *"Application Marked Defective by Institute"*, *"Pending at District/State Nodal Officer"*, *"Bank Account Validation Failed"*, or *"Duplicate Application Detected"* provide no plain-language explanation of why the status occurred.
- **Unclear Locus of Action:** Students cannot decipher *who* is responsible for fixing the issue—the student, the college/institute nodal officer (INO), the district/state nodal officer (DNO/SNO), or the bank/Public Financial Management System (PFMS).
- **The Defective vs. Rejected Trap:** A status marked *"Defective"* is an invitation to correct and resubmit within a narrow portal window (often 7–15 days). Confused students frequently mistake "Defective" for a permanent "Rejected" ruling, let the deadline elapse, and permanently forfeit their funding.
- **Information Asymmetry & Exploitation:** Students often travel long distances to college offices or pay cyber-café operators who themselves guess at what the portal messages mean, frequently giving incorrect or predatory advice.

### 1.2 What WAJAH Is
**WAJAH (वजह)** is an independent, lightweight, privacy-preserving, mobile-first Progressive Web Application (PWA) designed to decode confusing NSP application remarks into plain, reassuring, actionable guidance in English and Hindi.
- It operates on a **zero-trust, privacy-first model**: no user accounts, no login credentials, no storage of Aadhaar numbers, application IDs, or bank records.
- It provides a **deterministic explanation engine**: every piece of guidance originates from a human-reviewed, source-attributed, version-controlled scholarship knowledge library (`data/library.json` or `content/library/*.json`).
- It produces a structured **Fix Card** identifying:
  1. The exact **Plain Meaning** of the status.
  2. The **Fault/Responsibility Label** (Student Action, Institute Action, District/State Action, or Bank Action) expressed through text, color, iconography, and border styles.
  3. Ordered, concrete **Next Steps** ($\le 5$ steps) including "Say This" phrasing for speaking to college officials.
  4. The **Official Verification Source** and the exact date it was verified.
  5. A prominent **Deadline Warning Box** emphasizing *"Check the date on the portal."*
  6. A direct, clear exit hand-off button: **"Open the official NSP page"**.

### 1.3 What WAJAH Is NOT (Strict Boundaries & Non-Goals)
To prevent legal, ethical, and operational liability, WAJAH enforces rigid boundary constraints:
1. **NOT a Government Portal:** WAJAH has zero official affiliation with the Ministry of Electronics and Information Technology (MeitY), the Ministry of Minority Affairs (MoMA), the Ministry of Social Justice and Empowerment (MoSJE), or the National Informatics Centre (NIC). It carries an inescapable independence ribbon on every single screen.
2. **Never Determines Eligibility:** WAJAH never evaluates whether a student qualifies for a scheme, never promises financial approval, and never calculates disbursement amounts.
3. **Never Interacts Directly with NSP:** WAJAH never logs into the portal, never scrapes authenticated pages, never submits forms, never edits applications, and never files grievances on behalf of the student.
4. **Never Collects Secrets:** WAJAH strictly forbids asking for, storing, logging, or transmitting student passwords, OTPs, Aadhaar numbers, bank account numbers, IFSC codes, or government application IDs.
5. **Never Generates Unbounded Advice with AI:** AI (xAI Grok, Claude, or Gemini) is restricted strictly to intent matching, input normalization, and structured entity extraction. **AI never authors scholarship guidance, deadlines, legal procedures, or advice.**

---

## 2. The Ten Non-Negotiable Principles (P1–P10)
Every architectural choice, component implementation, and automated test must enforce these 10 core principles codified in `MASTER_RULES.md` and `prd.md`:

| ID | Principle | Core Engineering Enforcement |
|:---|:---|:---|
| **P1** | **Independent, Not Official** | The disclaimer *"Independent prototype. Not a government service. Not affiliated with NSP."* is rendered permanently in the root application layout (`C-RIBBON`). No government logos, Ashoka lions, or flag-imitating color palettes may ever be used. |
| **P2** | **Wajah Explains; It Never Decides** | Automated CI linter (`scripts/lint-library.ts`) scans all UI strings and content entries to block forbidden phrases (*"you are eligible"*, *"guaranteed approval"*, *"we will disburse"*, *"file official complaint"*). Refusal templates are triggered if a student asks decision questions. |
| **P3** | **Every Fix Ends at an Official Action** | The primary call-to-action on every Fix Card is *"Open the official NSP page"*, directing students to `scholarships.gov.in` in a secure external tab (`rel="noopener noreferrer"`). WAJAH does not execute administrative tasks. |
| **P4** | **Never Ask for Secrets** | The input pipeline runs a zero-bypass Client-Side PII Sanitizer before text touches the matcher, server, or network. Aadhaar (12 digits), phone numbers (10 digits), and emails are masked in-place with `[ID]`, `[NUM]`, and `[EMAIL]`. |
| **P5** | **The Reviewed Library Is the Only Source of Advice** | All cards, cause explanations, step lists, and escalation paths are loaded from versioned, cryptographically checksummed JSON entries. The server-side AI returns only canonical entry IDs and fixed vocabulary enums. |
| **P6** | **No Source, No Verified Entry** | Every entry marked `status: "verified"` must contain an official government URL (`source.url`), a `source.checked_on` timestamp, and at least two human reviewers (`reviewed_by`), including an external reviewer. Unverified entries are physically excluded from production builds. |
| **P7** | **Honest Uncertainty** | WAJAH never guesses. If a match is ambiguous, it presents up to 3 candidate options on S07. If confidence is below threshold, it routes safely to S09 (No Match). Disagreements between local heuristics and AI are never resolved silently. |
| **P8** | **Deadlines Come from the Portal Only** | Because state and scheme deadlines fluctuate constantly, WAJAH never hardcodes application cut-off dates. Every card features a prominent deadline warning box displaying: *"Check the date on the portal."* |
| **P9** | **Accessible, Lightweight and Multilingual** | Mobile-first 360px viewport support, WCAG 2.1 AA compliance, minimum 48px touch targets, contrast $\ge 4.5:1$, initial JS bundle $\le 150\text{ KB}$, full bilingual English/Hindi parity with offline functionality for all core screens. |
| **P10** | **Privacy by Default** | Zero user tracking, zero third-party analytics (no Google Analytics, Meta Pixel, or CDN beacons). Local browser persistence is strictly restricted to three keys: `wajah.lang`, `wajah.notice.v1`, and `wajah.consent.stats`. Raw student text is never written to server logs or databases. |

---

## 3. Problem-to-Feature Traceability & Failure Hypotheses

The product architecture directly maps the 6 Hypothesised Failure Points (**FP1–FP6**) to verified system modules:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PROBLEM TRACEABILITY MAP                                │
├──────────────────────────────┬──────────────────────────────┬───────────────────────────┤
│ Failure Hypothesis (PRD §2)  │ System Countermeasure        │ Resolving Module & Screen │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP1: Status shows "Pending"; │ Disambiguates INO vs DNO vs  │ • Library: nsp_pending_*  │
│ student cannot tell which    │ SNO; provides institute desk │ • Screen S08: Fix Card    │
│ level holds the file.        │ "Say This" talking points.   │ • Component: C-SAYTHIS    │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP2: "Defective" mistaken    │ Distinct semantic fault cue; │ • Library: nsp_defective_*│
│ for permanent rejection;     │ clearly highlights resubmit  │ • Screen S08: Fix Card    │
│ correction window expires.   │ instructions and deadline.   │ • Fault Label: Returned   │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP3: Officer remark is terse │ Pure TS normalizer & keyword │ • Door: S04 Paste / Speak │
│ or technical jargon; no      │ matcher maps remark to plain │ • Engine: N1–N10 Matcher  │
│ action provided.             │ language cause and steps.    │ • Screen S08: 5-step card │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP4: Correction window shuts │ Prominent Deadline Warning   │ • Component: C-DEADLINE   │
│ before student understands   │ Box on all cards; directs to │ • Mandatory portal check  │
│ instructions.                │ portal schedule immediately. │ • Library: deadline_text  │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP5: Scholarship approved    │ Identifies bank/Aadhaar/NPCI │ • Library: nsp_bank_*     │
│ but money not credited.      │ link failure; separates portal│ • Screen S08: Bank Action │
│                              │ state from PFMS payment state│ • Hand-off: PFMS link     │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ FP6: Duplicate application   │ Explains single-scholarship  │ • Library: nsp_duplicate_*│
│ or wrong institute selected. │ policy; provides nodal desk  │ • Screen S10: Grievance   │
│                              │ withdrawal/transfer workflow.│ • Flow F12: Letter draft  │
└──────────────────────────────┴──────────────────────────────┴───────────────────────────┘
```

---

## 4. User Journey & Comprehensive Screen Inventory

WAJAH implements a shallow, task-oriented navigation hierarchy across 15 well-defined screens. The root layout provides navigation reset: clicking the WAJAH brand mark or navigating to `/` instantly flushes all in-memory decode session state.

```
                                  ┌───────────────────────────┐
                                  │      S01: Home Screen     │
                                  │   (Tap, Paste, Scan, Ask) │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────────┬───────────────┴──────────────┬──────────────────────┐
         ▼                      ▼                              ▼                      ▼
┌─────────────────┐    ┌─────────────────┐            ┌─────────────────┐    ┌─────────────────┐
│  S03: Tap List  │    │  S04: Paste/Type│            │ S05: Scan (OCR) │    │  S15: Tina Chat │
│  (Offline-First)│    │  (+ Voice Sheet)│            │ (On-Device PWA) │    │  (Grok Matcher) │
└────────┬────────┘    └────────┬────────┘            └────────┬────────┘    └────────┬────────┘
         │                      │                              │                      │
         │                      └───────────────┬──────────────┘                      │
         │                                      ▼                                     │
         │                             ┌─────────────────┐                            │
         │                             │  PII Sanitizer  │                            │
         │                             │  (N1-N3 Masking)│                            │
         │                             └────────┬────────┘                            │
         │                                      ▼                                     │
         │                             ┌─────────────────┐                            │
         │                             │ Local Matcher   │                            │
         │                             │ (Deterministic) │                            │
         │                             └────────┬────────┘                            │
         │                                      │                                     │
         │                         [Ambiguous or AI Enabled]                          │
         │                                      ▼                                     │
         │                             ┌─────────────────┐                            │
         │                             │ S06: AI Overlay │                            │
         │                             │ (<= 3s Timeout) │                            │
         │                             └────────┬────────┘                            │
         │                                      │                                     │
         │                         ┌────────────┴────────────┐                        │
         ▼                         ▼                         ▼                        ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐      ┌─────────────────┐
│  S08: Fix Card  │◄──────┤ S07: Choose One │       │  S09: No Match  │      │ Direct Response │
│  (Full Advice)  │       │ (<= 3 Candidates│       │ (Safe Fallback) │      │ (Card In Chat)  │
└────────┬────────┘       └─────────────────┘       └─────────────────┘      └─────────────────┘
         │
         ├──────────────────────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ S10: Grievance  │            │  S11: Share/PNG │            │ S12: Feedback   │
│ Draft Generator │            │  & Print (A4)   │            │ & Error Report  │
└─────────────────┘            └─────────────────┘            └─────────────────┘
```

### 4.1 Detailed Screen Inventory

| Screen ID | Screen Name | Route | Priority | Core Responsibilities & Components |
|:---|:---|:---|:---|:---|
| **S01** | Home | `/` | **P0 (MVP)** | Orientation, entry doors (Tap, Paste, Scan, Speak, Chat), safety notice, language switch, footer links. Unsupported hardware doors (e.g. Scan when `FEATURE_OCR` is off) are gracefully hidden. |
| **S02** | First-Run Orientation | Modal over `/` | **P0 (MVP)** | Presented on first visit (`wajah.notice.v1` unset). Outlines 3 core boundaries, language selection, and an anonymous statistics toggle (**default OFF**). Dismissing sets the localStorage flag. |
| **S03** | Tap List | `/decode/pick` | **P0 (MVP)** | Allows students to browse and select from all verified library entries organized by three category tabs (*Waiting*, *Returned / Defective*, *Not Approved / Unpaid*). Zero typing, zero network, zero AI. Works completely offline. |
| **S04** | Paste / Type Input | `/decode/paste` | **P0 (MVP)** | Textarea accepting 3–1000 characters. Integrated voice sheet (`C-MIC`) powered by Web Speech API. Active client-side PII sanitizer flags numbers with amber warning box (`C-PII`) requiring confirmation. |
| **S05** | Scan Screenshot | `/decode/scan` | **P1 (Post-MVP)** | Client-side image ingestion via React Dropzone. On-device crop and redaction mask. On-device OCR processing via Tesseract.js (lazy-loaded). Extracted text is inserted into S04 review box. Image is immediately purged from memory. |
| **S06** | Matching Overlay | Modal Overlay | **P0 (MVP)** | Rendered only while an asynchronous `/api/understand` network call is in flight. Displays a reassuring progress message, an immediate "Cancel" button, and a fallback escape button: *"Use the tap list instead"*. Hard client UX timeout of 3.0s (1.0s if local match is confident). |
| **S07** | Disambiguation | `/decode/choose` | **P0 (MVP)** | Rendered when matching is ambiguous or when local and AI engines produce divergent candidates. Displays $\le 3$ candidate cards, "What we understood" chips, and a why-line. Prohibits displaying raw numerical confidence scores or percentages. |
| **S08** | Fix Card | `/card/[entryId]` | **P0 (MVP)** | The core product outcome. Renders all 15 required structural elements in strict sequential order from a single library JSON entry. Zero generated text. Bilingual toggle, audio listen, grievance draft CTA, and external NSP link. |
| **S09** | No Match | `/no-match` | **P0 (MVP)** | The safe uncertainty fall-through. Displays an honest explanation (e.g., state-specific portal, non-NSP scheme, or unverified remark). Offers quick links back to Tap List (S03), Paste (S04), or official portal contact desk. |
| **S10** | Grievance Draft | `/card/[entryId]/grievance` | **P1 (Post-MVP)** | Form-filling interface generating a clean, formal grievance letter based on a rigid template. Features an inescapable banner: *"Nothing has been filed. You must submit this draft yourself through the official route."* Copy, Download `.txt`, and Print actions are disabled until the student explicitly checks a confirmation box. |
| **S11** | Share & Print | `/card/[entryId]/share` | **P1 (Post-MVP)** | High-contrast visual export. Produces a 1080×1350 PNG optimized for WhatsApp/social sharing via `html-to-image` and clean A4 black-and-white print output via `@media print`. All exports preserve the independence disclaimer. |
| **S12** | Report Wrong Answer | `/report?entry=<id>` | **P1 (Post-MVP)** | Feedback door allowing students or nodal officers to report an inaccurate decode. Collects entry ID, structured category radio selection, and an optional masked note. Zero IP logging, zero tracking. |
| **S13** | About & Privacy | `/about` | **P0 (MVP)** | Complete project disclosure: independent status, how matching works, source repository register, data privacy model, and the anonymous telemetry toggle. Fully functional offline. |
| **S14** | Mock Analytics Dashboard | `/dashboard` | **P1 (Post-MVP)** | Demonstrates aggregate portal intelligence for policy makers. Bound to synthetic mock data (`mock: true`). Render is strictly blocked if the **MOCK DATA** banner is missing. Enforces $k$-anonymity ($k \ge 10$) with small group suppression. |
| **S15** | Guided Chatbot ("Tina") | `/chat` | **P2 (Optional)** | Conversational frontend powered by xAI Grok. Strictly bound to the verified library: Grok acts purely as an intent classifier selecting canonical entry IDs. Free-form advice generation is architecturally blocked. |

---

## 5. Architectural Decomposition & Layering Rules

WAJAH is built as a **client-heavy Progressive Web Application** with an ultra-thin, stateless API layer. To prevent spaghetti dependencies and ungrounded advice leakage, code is partitioned into 7 rigid layers enforced by static analysis (ESLint / Biome import rules):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: PRESENTATION (UI)                      │
│   src/app/ (Next.js App Router Pages, Layouts, SSG Card Routes)        │
│   src/components/ (Atomic UI, Cards, Disclaimers, Modals, FaultChips)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ imports
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 2: STATE MANAGEMENT                       │
│   src/state/decodeMachine.ts (Typed Reducer / XState v5 State Machine) │
│   In-Memory Session Context (Never Persisted to Disk/Storage)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ imports
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: DETERMINISTIC CORE ENGINE                  │
│   src/lib/sanitise/ (Regex Pattern Scanner, Aadhaar/Phone Masking)     │
│   src/lib/matcher/ (Normalizer N1-N10, Trie Index, Token Scorer)       │
│   src/lib/library/ (Type Definitions, Fault Label Registry, Helpers)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ imports
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYER 4: STATIC CONTENT REPOSITORY                   │
│   content/library/*.json (Canonical Verified & Draft Entry Pool)       │
│   content/lint/ (forbidden.json, allowed-domains.json)                 │
│   content/glossary/glossary.json (Plain Term Definitions)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      LAYER 5: SERVERLESS API ROUTE                     │
│   src/app/api/understand/route.ts (Stateless AI Fallback Gateway)      │
│   src/app/api/events/route.ts (Consented Anonymous Telemetry)          │
│   src/app/api/feedback/route.ts (Anonymous Defect Reporting)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ imports
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       LAYER 6: BACKEND ADAPTERS                        │
│   src/lib/server/aiGateway.ts (Provider-Neutral xAI/Claude Adapter)    │
│   src/lib/server/rateLimiter.ts (In-Memory / Token Bucket Limiter)     │
│   src/lib/server/schemaValidator.ts (Zod Guardrails & Parser Gate)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ writes (optional)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     LAYER 7: PERSISTENCE & TELEMETRY                   │
│   Client: localStorage (Strict Allowlist: 3 Keys Only)                │
│   Server (Optional): PostgreSQL (Supabase/Neon) or SQLite (Local Demo) │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Enforced Import Boundaries
1. `src/components/` **MUST NOT** import from `src/lib/server/` or directly invoke external network APIs.
2. `src/components/` **MUST NOT** contain hardcoded scholarship advice, deadline rules, or administrative procedures. All advice strings must be passed via typed props from library entries.
3. `src/lib/matcher/` and `src/lib/sanitise/` **MUST BE PURE TYPESCRIPT**. They must have zero dependencies on React, browser DOM APIs, `window`, `localStorage`, or external network libraries.
4. `src/state/` must be completely decoupled from React rendering logic, allowing the entire decode state machine to be verified headlessly in CLI unit tests.
5. Server API routes (`src/app/api/`) must only communicate with LLM endpoints via the abstracted, provider-neutral gateway (`src/lib/server/aiGateway.ts`).

---

## 6. The Pure TypeScript Matching Pipeline (N1–N10)

When a student inputs text via pasting, typing, voice transcription, or screenshot OCR, it passes through a deterministic 10-stage normalization and scoring pipeline:

```
Raw Input Text (3–1000 Chars)
  │
  ├─► Stage N1: Unicode NFC Normalization (Normalizes Devanagari & Latin diacritics)
  ├─► Stage N2: HTML & Markup Stripping (Removes <script>, <b>, entities)
  ├─► Stage N3: PII Sanitization (CRITICAL: Runs BEFORE digit stripping; masks Aadhaar & phone)
  ├─► Stage N4: Lowercase Conversion (Case-insensitive matching)
  ├─► Stage N5: Digit-Run Handling (Strips standalone tracking numbers behind flag)
  ├─► Stage N6: Punctuation & Special Character Removal (Replaces punctuation with spaces)
  ├─► Stage N7: Variant & Synonym Mapping (Expands Hinglish/Hindi terms via variants.json)
  ├─► Stage N8: Stop-Word Stripping (Removes domain-neutral words: "the", "is", "kripya")
  ├─► Stage N9: Suffix & Stemming Normalization (Basic Porter/Hindi suffix normalization)
  └─► Stage N10: Tokenization & Whitespace Collapse (Generates clean token array)
        │
        ▼
   Scoring Engine:
   • Adjacent phrase match: 1.0 * weight
   • Unordered token match: 0.7 * weight
   • Extra trigger bonus:   +0.10 per trigger (max +0.20)
   • Negative trigger:      -0.50 penalty (prevents level swapping)
        │
        ▼
   Decision Matrix:
   • CONFIDENT: Top Score >= 0.85 AND Lead over Runner-up >= 0.20 ──► S08: Fix Card
   • AMBIGUOUS: Top Score 0.50–0.84 OR Lead < 0.20 ──────────────────► S07: Choose (<= 3)
   • WEAK / NO MATCH: Top Score < 0.50 ──────────────────────────────► AI Fallback or S09
```

---

## 7. The AI Understanding Layer & Reconciliation Engine

The AI layer is an **optional second opinion**, never an authoritative advice author. It activates only when local matching is ambiguous, when `FEATURE_AI_ALWAYS` is enabled, or when free text contains complex colloquial phrasing.

### 7.1 Strict AI Guardrails
- **Prompt Structure:** The student's sanitized text is injected strictly as isolated data inside `<input>...</input>` tags within the user message. It is **never** interpolated into the system prompt.
- **Structured Output Only:** The LLM is forced via JSON schema to return only:
  ```json
  {
    "id": "nsp_defective_returned",
    "confidence": 0.88,
    "alternatives": ["nsp_unclear_document"],
    "situation": {
      "status": "defective",
      "level": "institute",
      "input_kind": "remark",
      "language": "en"
    }
  }
  ```
- **Validation Hard Gate:** The server checks that `id` exists in the verified library and that `confidence` is a valid float in $[0, 1]$. Any schema violation, unexpected field, or unknown ID causes the AI result to be discarded silently, falling back to local results.
- **Why-Line Generation (`FEATURE_WHY_LINE`):** AI generates a one-line explanatory breadcrumb (e.g., *"Matched because your remark mentions 'defective' and 'institute'"*) based strictly on predefined bilingual templates and at most two matched trigger words.

### 7.2 Reconciliation Truth Table (Single Source of Truth)

| Local Match State | AI Gateway Result | Final System Action | Target Screen | Telemetry `match_path` |
|:---|:---|:---|:---|:---|
| **CONFIDENT** ($X \ge 0.85$) | Matches $X$ ($\ge 0.80$) | Open Fix Card $X$ directly | S08: Fix Card | `both` |
| **CONFIDENT** ($X \ge 0.85$) | Disagrees ($Y \ne X \ge 0.80$) | Present choice between $[X, Y]$ | S07: Disambiguation | `disagree` |
| **CONFIDENT** ($X \ge 0.85$) | Weak / Timeout / Error | Open Fix Card $X$ directly | S08: Fix Card | `local_only` |
| **AMBIGUOUS** ($0.50–0.84$) | High Confidence ($Y \ge 0.80$) | Present candidates with $Y$ prioritized (or auto-open if approved) | S07 or S08 | `ai_only` |
| **AMBIGUOUS** ($0.50–0.84$) | Ambiguous ($0.50–0.79$) | Merge & deduplicate top candidates ($\le 3$) | S07: Disambiguation | `both` |
| **AMBIGUOUS** ($0.50–0.84$) | Weak / Timeout / Error | Present local candidates ($\le 3$) | S07: Disambiguation | `local_only` |
| **WEAK** ($< 0.50$) | High Confidence ($Y \ge 0.80$) | Present candidate $Y$ (or auto-open if approved) | S07 or S08 | `ai_only` |
| **WEAK** ($< 0.50$) | Weak / Timeout / Error | Route to Safe Uncertainty | S09: No Match | `none` |

---

## 8. Technology Stack Harmonization & Invariants

Based on a comprehensive review of `techstack.md`, `architecture .md`, and `rules.md`, the production stack is harmonized as follows:

| Layer | Selected Production Technology | Architectural Role & Justification |
|:---|:---|:---|
| **Frontend Framework** | **Next.js 15+ (App Router, React 19)** | Static site generation (SSG) for card routes (`/card/[entryId]`), fast hydration, integrated serverless route handlers. |
| **Programming Language** | **TypeScript 5.x (Strict Mode)** | End-to-end type safety, pure domain logic modeling, zero `any` allowance. |
| **Styling & Design System** | **Tailwind CSS v4 + DaisyUI 5** | Atomic CSS utility engine paired with DaisyUI semantic classes (`btn`, `card`, `modal`). Zero runtime CSS overhead. |
| **Accessible Primitives** | **Mantine Core 9 primitives** | Accessible focus management, modals, and keyboard-driven roving tabindex. Namespaced via `@layer mantine`. |
| **Vector Iconography** | **Lucide React** | 24×24 vector grid, uniform 2px stroke weight, strict semantic color mapping. |
| **State Management** | **Typed Reducer / XState v5** | Pure, testable state machine in `src/state/decodeMachine.ts`. Strict memory-only lifecycle. |
| **Internationalization** | **next-intl** | Bilingual `en.json` and `hi.json` dictionary management with per-string English fallback. |
| **Data Validation** | **Zod 3.x** | Runtime schema enforcement for API requests, library entries, and AI responses. |
| **PII Sanitizer & Matcher** | **Pure TypeScript Engine** | Built-in zero-dependency regex engine and deterministic Levenshtein/token scoring. Runs in browser offline. |
| **Client-Side OCR** | **Tesseract.js (v5)** | On-device optical character recognition for screenshots. Lazy-loaded on demand (`FEATURE_OCR`). |
| **Speech Processing** | **Web Speech API** | Native browser `SpeechRecognition` (voice input) and `SpeechSynthesis` (audio playback) with static audio fallback. |
| **Offline & PWA** | **@ducanh2912/next-pwa / Workbox** | Service worker precaching application shell and static JSON content library. |
| **Backend & AI Gateway** | **Next.js Serverless Route Handlers** | Stateless edge/node handlers (`/api/understand`, `/api/events`, `/api/feedback`). |
| **LLM Provider & Model** | **Provider-Neutral Adapter (xAI Grok / Claude / Gemini)** | Default target: `grok-2-latest` or `claude-haiku-5-5`. Temperature 0.0, max tokens 150, 8s server timeout. |
| **Persistence (Optional)** | **PostgreSQL (Supabase/Neon) or SQLite** | Optional telemetry logging with $k$-anonymity suppression ($k \ge 10$). Local demo mode runs completely DB-free or with SQLite. |
| **Quality Assurance** | **Vitest, Playwright, axe-core** | Fast unit testing for matcher/sanitizer, Playwright E2E flows, and automated WCAG 2.1 AA accessibility checks. |

---

## 9. Conflicting Requirements & Formal Resolutions

Across the 12 documentation files, several historical discrepancies exist due to iterative drafting. The table below consolidates all identified conflicts and records their formal architectural resolutions:

| Conflict ID | Issue Description | Source Documents in Conflict | Architectural Resolution Applied |
|:---|:---|:---|:---|
| **RC-01** | Priority classification naming: MoSCoW (`M/S/C/W`) vs. Numeric P-tags (`P0/P1/P2/W`). | `task.md` vs. `rules.md` vs. `prd.md` | **Harmonized:** $M \equiv P0$ (Must Have), $S \equiv P1$ (Should Have), $C \equiv P2$ (Could Have), $W \equiv$ Out of Scope. |
| **RC-02** | Input length limit: `rules.md` truncates $>1000$ chars with message; `rules__2_.md` rejects input out of range. | `rules.md` §6.3 vs. `rules__2_.md` | **Resolution:** Truncate inputs $>1000$ characters with a visible alert; reject empty or $<3$ character inputs. |
| **RC-03** | Sanitizer execution timing: "Before normalizer" vs. "N3 inside N1–N10". | `rules.md` §6.1 vs. `techstack.md` §10.2 | **Resolution:** Sanitizer runs N1 (Unicode), N2 (HTML strip), and N3 (PII mask) **before** digit stripping (N5) can delete numbers. N3 is idempotent. |
| **RC-04** | Fix Card element rendering order: 15-item inventory order vs. visual layout order. | `MASTER-ACCEPTANCE.md` vs. `appflow.md` | **Resolution:** `appflow.md` §10.1 governs visual DOM order: Ribbon $\rightarrow$ Brand $\rightarrow$ Why-Line $\rightarrow$ Chips $\rightarrow$ Title $\rightarrow$ Fault Badge $\rightarrow$ Meaning $\rightarrow$ Steps $\rightarrow$ "Say This" $\rightarrow$ Wait $\rightarrow$ Deadline Box $\rightarrow$ Source $\rightarrow$ Official NSP Button $\rightarrow$ Action Toolbar $\rightarrow$ Footer. |
| **RC-05** | Grievance warning banner phrasing. | `task.md` vs. `rules.md` §13.1 | **Resolution:** Standardized exact banner: *"Nothing has been filed. You must submit this draft yourself through the official route."* |
| **RC-06** | Deadline box standard string. | `rules.md` vs. `prd.md` | **Resolution:** Exact string asserted in tests: *"Check the date on the portal."* |
| **RC-07** | Telemetry timestamp granularity: Exact timestamp vs. weekly bucket. | `database.md` vs. `rules.md` §15.2 | **Resolution:** Strictest privacy wins: `week_start` date only. Zero timestamps, zero IP storage. |
| **RC-08** | AI timeout duration: 8-second table vs. 3-second client wait cap. | `techstack.md` §11 vs. `MASTER-ACCEPTANCE.md` | **Resolution:** Two-tier timeout: Server-to-LLM timeout is **8.0s**; Client UX overlay timeout is **3.0s** (drops to **1.0s** if local match is confident). |
| **RC-09** | Canonical entry ID for rejected institute applications. | `architecture .md` vs. `database.md` | **Resolution:** Canonical ID is `nsp_rejected_institute` (ADR-07). All references to `nsp_rejected_by_institute` are deprecated. |
| **RC-10** | Chatbot architecture: Standalone Express app in `chatbot.md` vs. Next.js App Router in Master Tech Stack. | `chatbot.md` §2 vs. `techstack.md` §8 | **Resolution:** Tina chatbot is integrated directly into Next.js App Router under `/chat` and `/api/decode` (or `/api/chat-intent`). A separate Express server is prohibited in the unified monorepo. |
| **RC-11** | Database necessity for MVP. | `database.md` vs. `memory.md` | **Resolution:** The core MVP is 100% database-free (local-first JSON content). Database (Supabase/Neon) is optional and restricted strictly to aggregate analytics and feedback. |
| **RC-12** | OCR image formats: JPEG/PNG vs. JPEG/PNG/WebP. | `rules.md` vs. `techstack.md` | **Resolution:** Support JPEG, PNG, and WebP, max 5 MB, resized client-side to max 1280px on long edge before OCR ingestion. |

---

## 10. Technical Risks & Mitigation Strategies

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TECHNICAL RISK REGISTER                                 │
├──────────────────────────────┬────────────┬─────────────────────────────────────────────┤
│ Risk Description             │ Severity   │ Mitigation Strategy                         │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 1. Zero Verified Content:    │ CRITICAL   │ Phase 0 verification protocol requires      │
│ All 14 pilot candidate       │ (Blocker)  │ dual-reviewer sign-off (including external  │
│ entries are currently DRAFT. │            │ nodal clerk) before any entry is marked     │
│                              │            │ "verified". Production build bundles only   │
│                              │            │ verified entries (`DEMO_MODE=false`).       │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 2. LLM Hallucination /       │ HIGH       │ Architectural hard gate: AI returns only    │
│ Invented Scholarship Advice. │            │ entry IDs and structured enums. AI text is  │
│                              │            │ never displayed in UI. Output schema is     │
│                              │            │ strictly validated via Zod.                 │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 3. PII Leakage (Aadhaar,     │ HIGH       │ Client-side regex sanitizer masks all       │
│ Phone, Names) via Network.   │            │ 12-digit and 10-digit runs before input can │
│                              │            │ leave browser. End-to-end privacy test      │
│                              │            │ verifies zero unmasked digits in payloads.  │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 4. Heavy OCR Bundle Size:    │ MEDIUM     │ Tesseract.js core and traineddata (~15 MB)  │
│ Tesseract.js impacting initial│           │ are dynamically imported only when user     │
│ load on 3G networks.         │            │ clicks "Scan Screenshot". First-load JS is  │
│                              │            │ strictly budgeted at <= 150 KB.             │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 5. AI API Cost Overrun /     │ MEDIUM     │ Strict token bucket rate limiting (20 req / │
│ Denial of Service.           │            │ 10 min per IP) and daily global budget cap  │
│                              │            │ (`AI_DAILY_CAP=2000`). Automatically falls   │
│                              │            │ back to local deterministic matcher on 429. │
├──────────────────────────────┼────────────┼─────────────────────────────────────────────┤
│ 6. Hindi Typography &        │ MEDIUM     │ Use system sans-serif for Latin; load       │
│ Font Download Latency.       │            │ localized Noto Sans Devanagari subset       │
│                              │            │ (<= 120 KB) only when Hindi language is     │
│                              │            │ activated by user.                          │
└──────────────────────────────┴────────────┴─────────────────────────────────────────────┘
```

---

## 11. Architectural Sign-Off & Next Steps
This analysis synthesizes all 12 master documents into a single coherent blueprint. No code should be authored until the associated **Implementation Roadmap**, **Requirement Traceability Matrix**, and **Open Questions Register** are reviewed and formally approved.

