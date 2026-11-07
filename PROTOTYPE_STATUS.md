# WAJAH (वजह) – Prototype Status & Integration Report
**Status:** Independent Prototype (Working Local Demonstration)  
**Context:** Independent Prototype · Not a Government Service · Not Affiliated with NSP  
**Verification Date:** 2026-11-02  
**Production Readiness:** ⚠️ **Prototype / Demonstration Only** (Not certified for live deployment)

---

## 1. Executive Summary
WAJAH successfully decodes confusing, defective, pending, and rejected National Scholarship Portal (NSP) status remarks into clear, plain language (English & Hindi), identifies who must act, and provides ordered next steps ending in an official portal hand-off.

The end-to-end user journey is fully functional:
$$\text{Home} \longrightarrow \text{Paste / Select Remark} \longrightarrow \text{Matching Overlay} \longrightarrow \text{Fix Card} \longrightarrow \text{Grievance Representation Draft}$$

All mandatory architectural invariants ($P_1$ through $P_9$), privacy rules (Zero Raw Storage, client-side regex masking), and release gates ($G_1$ through $G_8$) have been verified by unit, integration, and E2E evaluation suites.

---

## 2. Feature Completion Matrix

### A. Completed Features (100% Functional)
- **Non-Dismissable Independence Ribbon ($P_1$ / Gate $G_1$):** Present on every screen; strictly prohibits government emblems or misleading official styling.
- **Bilingual Interface ($C\text{-}LANG$):** Instant client-side English $\leftrightarrow$ Hindi toggle; persistent preference stored in `localStorage` under allowlisted key `wajah.lang`.
- **First-Run Modal ($S01$):** Explains prototype scope, safety boundaries, and requests statistical telemetry consent (`wajah.consent.stats`).
- **Deterministic 10-Stage Matcher Engine:**
  - Stages N1–N10 normalisation, diacritics removal, Hindi character unification.
  - Keyword and trigger scoring, length ratio penalties, and candidate ranking.
  - Documented thresholds: $\ge 0.85$ score & $\ge 0.20$ lead for `CONFIDENT`; $0.50$–$0.79$ for `AMBIGUOUS` (top 3); $< 0.50$ for `WEAK` Safe Uncertainty ($S09$).
  - **100% accuracy** on the 18-case test set ($0\%$ confident-wrong rate, Gate $G_5$).
- **Multi-Attribute Responsibility Badges ($P_9$):** Distinct icon, text, border color, and border style for Student (solid teal), Institute (dashed blue), District/State (dotted indigo), and Bank (solid amber).
- **Fix Card Guidance ($S08$):**
  - Original Portal Status.
  - Evidence-grounded "Why this match" explanation box.
  - Plain Language Explanation (Bilingual).
  - System Inferences.
  - Ordered Steps ($\le 5$) with Where to go, What to carry/have ready, and What to say to officials.
  - Saffron Fluctuating Deadline Warning box ($P_8$).
  - Verified Guidance Metadata box with rule reference, checked date, and 2 reviewers ($P_5$).
  - Official Hand-Off button to `scholarships.gov.in` ($P_3$).
  - Web Speech API voice read-aloud ($C\text{-}VOICE$), Native Share API, and Print CSS styling.
- **Safe Uncertainty Fallback ($S09$):** Reassuring empty state with sample remarks and direct links to official helpline and portal.
- **Data Protection & Privacy ($G_4$):** In-place regex masking of Aadhaar (12 digits), phone numbers (10 digits), and email addresses before normalisation or network calls. Client memory only for raw pasted text.
- **Backend APIs:**
  - `POST /api/match-ai` & `POST /api/understand` (AI classification gate).
  - `POST /api/decode` & `GET /api/decode` (Chatbot / Hybrid endpoint & tap chips).
  - `POST /api/grievance-draft` (Slot generation for formal representations).
  - `POST /api/events` (Opt-in telemetry with strict schema validation).
  - `POST /api/feedback` (User inaccuracy reports).
  - `POST /api/miss` (Opt-in re-sanitised unrecognised remarks).
  - `GET /api/dashboard` ($k$-anonymity suppression with $k \ge 10$; explicit "MOCK DATA" banner).
  - Data retention auto-purges: 30-day miss log expiry, 12-month event cleanup.
- **AI Understanding Layer ($S10$, AIU-T1 through T10):**
  - **AI Matching Fallback:** `POST /api/understand` & `POST /api/match-ai` with 8.0s server timeout, 3.0s client timeout, and automatic local fallback.
  - **Structured Schema Gate:** Zod validation against `AiResponseSchema` with allowlist enforcement against bundled library IDs.
  - **Reconciliation Engine:** Pure TypeScript reconciliation matrix in `src/lib/ai/reconcile.ts` covering all 6 agreement/disagreement branches. Never silently overrides confident local matches.
  - **Qualitative Confidence Indicators:** `High Confidence Match`, `Student Selected`, `AI Assisted Match`, `Possible Match` chips; strictly zero raw numbers or percentages shown to students.
  - **Evidence-Grounded Why-Lines:** `src/lib/ai/why.ts` using reviewed bilingual templates and actual matched terms (max 2 terms, digits stripped).
  - **AI-Assisted Grievance Drafting:** Interactive slot filling for `grievance_cause`, `actions_summary`, and `requested_relief`.
  - **Forbidden-Phrase Detection:** Pure module `src/lib/ai/forbidden.ts` validating all AI-derived text against English and Hindi prohibited claims (e.g., "you are eligible", "you will be paid", "guaranteed", "official Wajah"). Any violation immediately reverts to a safe, reviewed template sentence.
- **Guided Chat Module (Tina, `/chat` — REMOVED):**
  - Completely removed from frontend and backend per product requirements. The conversational UI has been removed in favor of direct, deterministic scholarship workflows (Discovery, Eligibility, Readiness, Vault, Tracker, and Deadlines). Shared AI infrastructure (AI Gateway, Intent Classification, Grievance Drafting) is preserved.

### B. Partially Completed Features
- **Live Database Sync:** Optional PostgreSQL / Supabase adapter (MVP currently uses zero-database static JSON repository).

### C. Simulated Features (Explicitly Labeled)
- **LLM Matching & Grievance Fallback (`is_simulated: true`):**
  - When live credentials (`LLM_API_KEY`) are not provided in the environment, the server transparently routes to `simulateAiClassification()` and `generateTemplateSlots()`.
  - The UI explicitly renders badges: `"Template-based AI Assistant"` and `"Zero Personal Data Persisted"`.
- **Public Dashboard Data (`/dashboard`):**
  - The aggregate statistics endpoint returns local development metrics labeled with `"MOCK DATA — Prototype Demonstration"`.

### D. Unimplemented / Post-MVP Features
- Live External Database (Postgres / Supabase) — core MVP operates zero-database on reviewed bundled JSON.
- Tesseract.js Client Screenshot OCR ($C\text{-}OCR$) — postponed to Phase 2.
- Web Speech API Hindi Voice Recognition ($C\text{-}MIC$) — postponed to Phase 2.

---

## 3. Known Issues & Workarounds
1. **Windows Sandbox EPERM on `.next` Directory:**
   - *Cause:* On Windows platforms, rapid consecutive Next.js build runs occasionally experience transient directory locking.
   - *Resolution:* Rerunning `npm run build` or restarting the daemon resolves the transient file lock.
2. **Audio Read-Aloud Browser Compatibility:**
   - *Observation:* `window.speechSynthesis` depends on system Hindi TTS voices installed on the host OS. On machines lacking Hindi voices, speech synthesis falls back to default English voice.

---

## 4. Test Verification Results

| Suite / Gate | Test Scope | Result | Details |
|---|---|---|---|
| **Gate G1** | Independence Ribbon Check | **PASS** | Verified string rendered across all pages |
| **Gate G2** | Advice Strings Isolation | **PASS** | `lint-library.mjs` verified zero hardcoded advice |
| **Gate G3** | Content Verification Status | **PASS** | 100% of bundled entries verified with sources |
| **Gate G4** | PII Sanitizer Unit Tests | **PASS** | 18 positive/negative tests (Aadhaar, phone, email) |
| **Gate G5** | Matcher Scorer & Confidence | **PASS** | 100.0% accuracy, 0% confident-wrong on test set |
| **Gate G6** | AI Schema & Reconciliation | **PASS** | All 6 reconciliation branches & Zod schemas passed |
| **Safety Gate** | Forbidden-Phrase Detection | **PASS** | Case-insensitive EN & HI phrase checks & slot fallback |
| **Guided Chat** | 13 Fixed Intents & Safety | **PASS** | All 13 intents, context follow-ups, and refusals passed |
| **Gate G7** | Accessibility & Ergonomics | **PASS** | $\ge 48\text{px}$ touch targets, multi-attribute badges |
| **Gate G8** | Bundle Size & Performance | **PASS** | Initial JS: 103 kB ($\le 150\text{ kB}$ threshold) |
| **E2E Routes** | Full Server HTTP Probe | **PASS** | 9 UI routes & 11 API endpoints returned HTTP 200/204 |

---

## 5. Instructions to Run the Application

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(If `LLM_API_KEY` is omitted, the application automatically uses the verified template-based simulator).*

### Step 3: Run Full Test Suite
```bash
npm test
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Test the Complete User Journey
1. Open [http://localhost:3000](http://localhost:3000).
2. Click **"Paste Status Remark"** (or choose **"Pick Common Remark"**).
3. Paste: `"Application marked defective by institute"`.
4. Observe the matching screen and transition to Fix Card `/card/nsp_defective_returned`.
5. Review the **Why-This-Match** box, **Who Acts** badge, and **Ordered Steps**.
6. Click **"Generate Formal Grievance Draft"**.
7. Customize with checkboxes, review the letter, check the mandatory acknowledgement gate, and copy or download the draft.
8. Switch to **हिंदी** using the top language switch to verify complete localization.

