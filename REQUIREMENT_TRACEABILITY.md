# WAJAH (वजह) — Master Requirement Traceability Matrix (RTM)
**Product:** WAJAH – Rejection Decoder  
**Document Role:** End-to-End Requirement Traceability, Acceptance Criteria Mapping & Verification Audit  
**Version:** 1.0 (Harmonized from `prd.md`, `rules.md`, and `MASTER-ACCEPTANCE.md`)  
**Status:** Pre-Implementation Baseline (Awaiting Owner Approval)

---

## 1. Traceability Methodology & Schema

The Requirement Traceability Matrix ensures that every high-level user story, business invariant, and functional requirement has a 1:1 mapping to:
1. **Governing Principle:** The foundational product rule (`P1` through `P10`) protected.
2. **Implementation Target:** The concrete source file, component, or serverless route handler.
3. **Acceptance Criteria (AC) Reference:** The formal verification standard codified in `MASTER-ACCEPTANCE.md`.
4. **Verification Method:** The automated test strategy (`UT` = Unit Test, `IT` = Integration Test, `E2E` = Playwright E2E, `A11Y` = axe-core, `PERF` = Lighthouse/size-limit, `LINT` = Static Analysis).

---

## 2. User Stories Mapping (US-01 through US-23)

| Story ID | User Persona & Requirement Description | Priority | Principle | Target Screen & Component | Acceptance Criteria | Test Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **US-01** | As a student, I want to browse common NSP rejection remarks without typing, so I can find my issue offline. | **P0 (MVP)** | P9 | S03 Tap List (`src/app/decode/pick/page.tsx`) | `AC-CORE-01`, `CAP-02` | E2E |
| **US-02** | As a student, I want to paste my exact portal remark and get an explanation, so I know what happened. | **P0 (MVP)** | P5 | S04 Paste Screen (`src/app/decode/paste/page.tsx`) | `AC-CORE-02`, `CAP-03` | E2E |
| **US-03** | As a student, I want my sensitive details (Aadhaar, phone) masked automatically, so my privacy is protected. | **P0 (MVP)** | P4, P10 | `src/lib/sanitise/sanitiser.ts`, `C-PII` | `AC-PRIV-01`, `SAN-02` | UT, E2E |
| **US-04** | As a student, I want to see clearly who must act (me, college, district, or bank), so I know where to go. | **P0 (MVP)** | P2 | S08 Fix Card (`src/components/FaultBadge.tsx`) | `AC-CRD-03`, `CRD-03` | UT, A11Y |
| **US-05** | As a student, I want ordered next steps ($\le 5$), so I can fix my application without getting overwhelmed. | **P0 (MVP)** | P5 | S08 Fix Card (`src/components/StepList.tsx`) | `AC-CRD-05`, `CRD-05` | UT, CT |
| **US-06** | As a student, I want exact "Say This" talking points, so I can speak confidently to college nodal officers. | **P0 (MVP)** | P3 | S08 Fix Card (`src/components/SayThis.tsx`) | `AC-CRD-06`, `CRD-06` | CT, a11y |
| **US-07** | As a student, I want a prominent warning to check portal deadlines, so I don't miss the correction window. | **P0 (MVP)** | P8 | S08 Fix Card (`src/components/DeadlineBox.tsx`) | `AC-CRD-07`, `CRD-07` | UT, CT |
| **US-08** | As a student, I want to verify the official source and date of advice, so I know it is trustworthy. | **P0 (MVP)** | P6 | S08 Fix Card (`src/components/SourceBox.tsx`) | `AC-CONTENT-01`, `CRD-08` | UT, CT |
| **US-09** | As a student, I want a direct button to open the official NSP page, so I can take action immediately. | **P0 (MVP)** | P3 | S08 Fix Card (`C-PORTAL-BTN`) | `AC-CORE-08`, `CRD-13` | E2E |
| **US-10** | As a student, I want candidate choices when my remark is ambiguous, so the app never guesses incorrectly. | **P0 (MVP)** | P7 | S07 Disambiguation (`src/app/decode/choose/page.tsx`) | `AC-MAT-06`, `MAT-06` | E2E |
| **US-11** | As a student, I want an honest "No Match" screen when my remark isn't found, so I'm not given bad advice. | **P0 (MVP)** | P7 | S09 No Match (`src/app/no-match/page.tsx`) | `AC-MAT-09`, `MAT-09` | E2E |
| **US-12** | As a student, I want to switch between English and Hindi instantly, so I can read in my preferred language. | **P0 (MVP)** | P9 | `C-LANG` (`src/components/LanguageSwitch.tsx`) | `AC-LNG-01`, `LNG-01` | E2E |
| **US-13** | As a student, I want core features to work offline in airplane mode, so I can use it with poor internet. | **P0 (MVP)** | P9 | Service Worker (`public/sw.js`), `C-OFFLINE` | `AC-OFF-01`, `OFF-01` | E2E |
| **US-14** | As a student, I want to draft a formal grievance letter, so I can escalate if my college delays verification. | **P1 (Post-MVP)** | P3 | S10 Grievance (`src/app/card/[id]/grievance/page.tsx`) | `AC-GRV-01`, `GRV-01` | E2E |
| **US-15** | As a student, I want to share or print a high-contrast Fix Card, so I can take it to my college or cyber-café. | **P1 (Post-MVP)** | P9 | S11 Share/Print (`src/app/card/[id]/share/page.tsx`) | `AC-SHR-01`, `SHR-01` | UT, E2E |
| **US-16** | As a student, I want to listen to Fix Card instructions via audio, so I don't have to struggle reading. | **P1 (Post-MVP)** | P9 | `C-LISTEN` (`src/components/AudioPlayer.tsx`) | `AC-AUD-01`, `AUD-01` | UT, CT |
| **US-17** | As a student, I want to report a wrong or unhelpful answer, so the maintainers can fix it. | **P1 (Post-MVP)** | P7 | S12 Feedback (`src/app/report/page.tsx`) | `AC-FBK-01`, `FBK-01` | IT, E2E |
| **US-18** | As a student, I want to scan a screenshot of my portal page, so I don't have to re-type technical remarks. | **P1 (Post-MVP)** | P4, P10 | S05 Scan Screen (`src/app/decode/scan/page.tsx`) | `AC-CAP-09`, `CAP-09` | E2E |
| **US-19** | As a student, I want to speak my status remark using my voice, so I can input text naturally. | **P1 (Post-MVP)** | P9 | `C-MIC` (`src/components/VoiceSheet.tsx`) | `AC-CAP-07`, `CAP-07` | E2E |
| **US-20** | As a caregiver, I want to "Start for someone else", so I can clear the previous student's session instantly. | **P2 (Optional)** | P10 | S08 Footer (`src/components/ResetSession.tsx`) | `AC-CORE-07`, `C-NEWPERSON`| E2E |
| **US-21** | As a student, I want to tap unfamiliar terms to see a simple explanation, so I understand portal jargon. | **P2 (Optional)** | P9 | `C-TERM` (`src/components/TermHelpSheet.tsx`) | `AC-GLOSS-01`, `C-TERM` | UT, CT |
| **US-22** | As an admin/evaluator, I want to view mock aggregate rejection metrics, to understand systemic failure points. | **P1 (Post-MVP)** | P2, P10 | S14 Dashboard (`src/app/dashboard/page.tsx`) | `AC-DSH-01`, `DSH-01` | E2E |
| **US-23** | As a student, I want to ask questions in a guided chat, so I can navigate my status conversationally. | **P2 (Optional)** | P1, P5 | S15 Chat (`src/app/chat/page.tsx`) | `AC-CHT-01`, `CHT-01` | E2E |

---

## 3. Functional Requirements Traceability Matrix

### 3.1 Capture Module (CAP)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **CAP-01** | Home offers Tap List and Paste doors; Scan appears only when `FEATURE_OCR` is enabled. | P0 | P9 | `src/app/page.tsx` | `AC-CAP-01`: Door visibility matches flag state. | E2E (Playwright) |
| **CAP-02** | Tap List renders every verified library entry grouped by category in `display_order`. | P0 | P5 | `src/app/decode/pick/page.tsx` | `AC-CAP-02`: Row count matches verified JSON count. | Unit / E2E |
| **CAP-03** | Paste input accepts 3–1000 characters; longer input truncated with alert message. | P0 | P4 | `src/app/decode/paste/page.tsx` | `AC-CAP-03`: >1000 chars truncated; <3 blocked. | Unit / E2E |
| **CAP-04** | Input text is rendered inert; HTML tags and `<script>` are stripped and escaped. | P0 | P4 | `src/lib/matcher/normaliser.ts` | `AC-CAP-04`: Script tags stripped; XSS inert. | Unit (Vitest) |
| **CAP-05** | Every capture route terminates in exactly one of: S08 (Card), S07 (Choose), or S09 (No Match). | P0 | P7 | `src/state/decodeMachine.ts` | `AC-CAP-05`: State machine leaves no dangling states. | Unit (State Test) |
| **CAP-06** | Every capture screen provides a visible escape route to the Tap List (S03). | P0 | P9 | S04, S05, S07, S09 | `AC-CAP-06`: Tap list link present on all capture routes. | E2E (DOM Check) |
| **CAP-07** | Voice input uses Web Speech API; mic button is hidden when browser lacks support. | P1 | P9 | `src/components/VoiceSheet.tsx` | `AC-CAP-07`: Hidden when SpeechRecognition absent. | E2E (Mock API) |
| **CAP-08** | "Clear" action empties input box and resets decode state machine to `IDLE`. | P0 | P10 | `src/app/decode/paste/page.tsx` | `AC-CAP-08`: Input empty, state reset to IDLE. | E2E (Playwright) |
| **CAP-09** | Screenshot OCR runs 100% on-device; image is never uploaded or persisted over network. | P1 | P10 | `src/app/decode/scan/page.tsx` | `AC-CAP-09`: Network panel shows 0 image uploads. | Network E2E |
| **CAP-10** | Scan flow includes crop and redaction mask, editable review box, and explicit decode tap. | P1 | P4 | `src/app/decode/scan/page.tsx` | `AC-CAP-10`: Masked area blacked out; text editable. | E2E (Playwright) |
| **CAP-11** | Voice transcript lands in editable text box for student review; never auto-submits. | P1 | P4 | `src/components/VoiceSheet.tsx` | `AC-CAP-11`: Transcript appears; submit awaits tap. | E2E (Playwright) |

### 3.2 Sanitise Module (SAN)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **SAN-01** | Anonymous stats consent asked once on first visit, default OFF, toggleable in About. | P0 | P10 | `src/components/FirstRunModal.tsx` | `AC-SAN-01`: Stats toggle defaults to false. | Unit / E2E |
| **SAN-02** | All text (typed, pasted, voice, OCR, grievance) is scanned for PII before matching or API call. | P0 | P4 | `src/lib/sanitise/sanitiser.ts` | `AC-SAN-02`: Scanner executes on all input channels. | Unit (Vitest) |
| **SAN-03** | Sensitive numbers masked (`[ID]`, `[NUM]`, `[EMAIL]`); student warned and must confirm. | P0 | P4 | `src/components/PiiWarning.tsx` | `AC-SAN-03`: Warning shown; confirmation gates submit. | Unit / E2E |
| **SAN-04** | PII scanner executes before normalizer strips digit runs (N5). | P0 | P4 | `src/lib/matcher/normaliser.ts` | `AC-SAN-04`: 12-digit Aadhaar masked, not silently deleted. | Unit (Vitest) |
| **SAN-05** | Raw unmasked student text is never written to server logs, analytics, or persistent storage. | P0 | P10 | `src/lib/server/logger.ts` | `AC-SAN-05`: Log audit verifies 0 raw user strings. | CI Log Scanner |
| **SAN-06** | Application forms contain zero fields requesting passwords, OTPs, or bank account numbers. | P0 | P4 | Entire UI codebase | `AC-SAN-06`: Form audit detects 0 credential inputs. | Static Lint Scan |
| **SAN-07** | Normal scholarship remarks (e.g. "document not clear") are never falsely masked. | P0 | P7 | `src/lib/sanitise/sanitiser.ts` | `AC-SAN-07`: Negative samples pass through unmasked. | Unit (Vitest) |

### 3.3 Matching Module (MAT)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **MAT-01** | Input text is normalized through stages N1 through N10 in pure TypeScript. | P0 | P5 | `src/lib/matcher/normaliser.ts` | `AC-MAT-01`: Normalizer pipeline passes unit tests. | Unit (Vitest) |
| **MAT-02** | Local matcher scores all library entries and returns ranked top candidates. | P0 | P5 | `src/lib/matcher/scorer.ts` | `AC-MAT-02`: Scorer accurately ranks labeled dataset. | Unit (Vitest) |
| **MAT-03** | `CONFIDENT` threshold: Top score $\ge 0.85$ AND Lead over runner-up $\ge 0.20$. | P0 | P7 | `src/lib/matcher/classifier.ts` | `AC-MAT-03`: Boundary tests at 0.84/0.85 and 0.19/0.20. | Unit (Vitest) |
| **MAT-04** | Local matching runs in browser against bundled library and works 100% offline. | P0 | P9 | `src/lib/matcher/` | `AC-MAT-04`: Offline test resolves match in <50ms. | E2E (Offline) |
| **MAT-05** | Out-of-scope check (state portals, non-NSP) intercepts input and routes to S09 with reason. | P0 | P7 | `src/lib/matcher/scopeFilter.ts`| `AC-MAT-05`: State portal keywords route to S09. | Unit (Vitest) |
| **MAT-06** | Ambiguous match ($0.50–0.84$) displays $\le 3$ candidate cards on S07 Disambiguation. | P0 | P7 | `src/app/decode/choose/page.tsx` | `AC-MAT-06`: Max 3 candidate cards rendered. | Unit / E2E |
| **MAT-07** | Candidate screens (S07) and cards (S08) never display raw confidence scores or percentages. | P0 | P7 | S07, S08 Components | `AC-MAT-07`: DOM inspection finds 0 percentage scores. | E2E (DOM Check) |
| **MAT-08** | AI timeout, error, or invalid payload falls back gracefully to local candidates or S09. | P0 | P7 | `src/lib/ai/reconcile.ts` | `AC-MAT-08`: Simulated 500/timeout yields valid UI state.| Integration Test |
| **MAT-09** | If nothing matches, S09 is displayed; Fix Card never opens on a weak guess. | P0 | P7 | `src/app/no-match/page.tsx` | `AC-MAT-09`: Gibberish input always lands on S09. | E2E (Playwright) |
| **MAT-10** | Prompt injection strings inside student text cannot alter matching logic or output. | P0 | P5 | `src/lib/server/aiGateway.ts` | `AC-MAT-10`: Injection test dataset passes safely. | Security Test |
| **MAT-11** | Out-of-scope screens display specific reason (State scheme, non-NSP, unreviewed). | P1 | P7 | `src/app/no-match/page.tsx` | `AC-MAT-11`: Distinct reason message per category. | E2E (Playwright) |

### 3.4 Fix Card Module (CRD)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **CRD-01** | Fix Card is rendered entirely from a single library entry; zero hardcoded advice strings. | P0 | P5 | `src/app/card/[id]/page.tsx` | `AC-CRD-01`: Codebase scan confirms 0 inline advice. | Static Lint Scan |
| **CRD-02** | Original portal remark and plain meaning are visually separated in distinct containers. | P0 | P7 | `src/components/PortalRemarkBox.tsx` | `AC-CRD-02`: Two separate DOM cards rendered. | Component Test |
| **CRD-03** | Fault label displays responsible entity using text, color, icon, and print border. | P0 | P9 | `src/components/FaultBadge.tsx` | `AC-CRD-03`: Multi-attribute cues verified in DOM. | A11Y / Visual |
| **CRD-04** | Plain meaning is $\le 25$ words, Class 5 reading level, using "likely" or "usually". | P0 | P2 | `scripts/lint-library.ts` | `AC-CRD-04`: Word count and tone verified in CI lint. | Library Linter |
| **CRD-05** | Fix Card renders at most 5 ordered action steps. | P0 | P5 | `src/components/StepList.tsx` | `AC-CRD-05`: Step count strictly $\le 5$ in DOM. | Unit / Component |
| **CRD-06** | Fix Card includes a "Say This" talking point for talking to nodal officials. | P0 | P3 | `src/components/SayThis.tsx` | `AC-CRD-06`: Talking point present on institute cards. | Component Test |
| **CRD-07** | Deadline box displays: *"Check the date on the portal."* unless official date is sourced. | P0 | P8 | `src/components/DeadlineBox.tsx` | `AC-CRD-07`: Exact string rendered and asserted. | Component Test |
| **CRD-08** | Official CTA button opens NSP portal in new tab (`rel="noopener noreferrer"`). | P0 | P3 | `src/components/PortalButton.tsx`| `AC-CRD-08`: Target blank, security rel attributes ok. | E2E (Playwright) |
| **CRD-09** | External links restricted strictly to domains listed in `allowed-domains.json`. | P0 | P1 | `scripts/lint-library.ts` | `AC-CRD-09`: CI fails if external URL not allowlisted. | Library Linter |
| **CRD-10** | Source box displays official URL, document year, and checked date. | P0 | P6 | `src/components/SourceBox.tsx` | `AC-CRD-10`: Source metadata visible on every card. | Component Test |
| **CRD-11** | Action toolbar provides Listen, Share/Print, and Draft Grievance (if enabled). | P1 | P9 | `src/components/CardToolbar.tsx` | `AC-CRD-11`: Action toolbar buttons render properly. | Component Test |
| **CRD-12** | Footer features "This is not my message" (returns to S07/S03) and "Report wrong answer". | P0 | P7 | `src/components/CardFooter.tsx` | `AC-CRD-12`: Fallback escape links present. | E2E (Playwright) |
| **CRD-13** | In production, cards for unverified entries are blocked; in demo, they show Draft banner. | P0 | P6 | `src/components/DraftBanner.tsx` | `AC-CRD-13`: Draft banner rendered when `DEMO_MODE=true`.| Unit / Component |
| **CRD-14** | Missing Hindi translations fall back gracefully to English and show "Not yet translated". | P0 | P9 | `src/lib/i18n/` | `AC-CRD-14`: Untranslated strings fall back cleanly. | Unit (Vitest) |
| **CRD-15** | Caregiver reset action ("Start for someone else") flushes session context completely. | P2 | P10 | `src/components/ResetSession.tsx`| `AC-CRD-15`: Session context empty after click. | E2E (Playwright) |

### 3.5 Language, Audio, Share & Grievance (LNG, AUD, SHR, GRV)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **LNG-01** | English and Hindi toggle updates all UI and library strings without page reload. | P0 | P9 | `src/components/LanguageSwitch.tsx`| `AC-LNG-01`: Instant re-render upon language toggle. | E2E (Playwright) |
| **LNG-02** | Hindi text is human-reviewed; automated runtime machine translation is prohibited. | P0 | P9 | `scripts/lint-library.ts` | `AC-LNG-02`: `machine_translated: true` fails CI build. | Library Linter |
| **LNG-03** | Original portal remark text stays unchanged when switching languages. | P0 | P7 | `src/components/PortalRemarkBox.tsx`| `AC-LNG-03`: Remark string remains untouched in Hindi. | Component Test |
| **LNG-04** | Latin font uses system stack (0 KB); Devanagari subset ($\le 120\text{ KB}$) loads on demand. | P0 | P9 | `src/app/layout.tsx` | `AC-LNG-04`: Font payload $\le 120\text{ KB}$ on Hindi select.| Bundle Analyzer |
| **AUD-01** | Listen button reads meaning and steps using Web Speech API; no autoplay. | P1 | P9 | `src/components/AudioPlayer.tsx` | `AC-AUD-01`: Audio plays only upon explicit click. | Component Test |
| **AUD-02** | Pre-recorded static MP3 clips (`public/audio/`) serve as fallback when TTS fails. | P1 | P9 | `src/components/AudioPlayer.tsx` | `AC-AUD-02`: Static audio loads when TTS throws error. | Component Test |
| **SHR-01** | Share action exports 1080×1350 PNG via `html-to-image` for social messaging. | P1 | P9 | `src/app/card/[id]/share/page.tsx` | `AC-SHR-01`: PNG canvas generates cleanly at 1080x1350. | Unit (Canvas Test) |
| **SHR-02** | Print action formats Fix Card for clean black-and-white A4 paper via `@media print`. | P1 | P9 | `src/styles/print.css` | `AC-SHR-02`: Print stylesheet removes navigation and colors.| CSS Layout Test |
| **GRV-01** | Grievance generator renders fixed formal template ($\approx 150$ words) based on entry. | P1 | P3 | `src/app/card/[id]/grievance/page.tsx`| `AC-GRV-01`: Letter renders according to rigid schema.| Component Test |
| **GRV-02** | Permanent banner: *"Nothing has been filed. You submit this draft yourself..."* | P1 | P3 | `src/components/GrievanceBanner.tsx` | `AC-GRV-02`: Exact string rendered and asserted in tests.| Component Test |
| **GRV-03** | Copy, Download `.txt`, and Print actions are disabled until review checkbox is checked. | P1 | P3 | `src/app/card/[id]/grievance/page.tsx`| `AC-GRV-03`: Action buttons disabled until checked. | E2E (Playwright) |

### 3.6 AI Layer & Chatbot (AIU, CHT)

| Req ID | Requirement Statement | Pri | Prin. | Implementation File / Target | Acceptance Criteria Reference | Automated Verification Method |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **AIU-01** | AI is called per policy and NEVER invoked for Tap List selections. | P1 | P5 | `src/app/api/understand/route.ts` | `AC-AI-01`: Tap list routes make 0 network API calls. | Network E2E |
| **AIU-02** | Model returns only validated JSON; raw model text is never displayed in UI. | P1 | P5 | `src/lib/server/schemaValidator.ts` | `AC-AI-02`: Schema parser rejects any free-form prose.| Unit (Vitest) |
| **AIU-03** | Local and AI candidates are reconciled per truth table; disagreements never auto-resolved.| P1 | P7 | `src/lib/ai/reconcile.ts` | `AC-AI-03`: Disagreement routes to S07 Disambiguation.| Unit (Vitest) |
| **AIU-04** | Client waits max 3.0s (1.0s if local confident) then continues locally without AI. | P1 | P9 | `src/state/decodeMachine.ts` | `AC-AI-04`: 5s mocked API delay auto-dismisses at 3s. | E2E (Timer Test) |
| **AIU-05** | API rate limit enforced: 20 req / 10 min per IP, plus global `AI_DAILY_CAP`. | P1 | P10 | `src/lib/server/rateLimiter.ts` | `AC-AI-05`: 21st request returns 429; cap yields 503. | Load Script |
| **AIU-06** | S08 Fix Card displays exactly one why-line explaining the match from fixed templates. | P1 | P7 | `src/components/WhyLine.tsx` | `AC-AI-06`: Why-line text matches predefined template.| Component Test |
| **AIU-07** | Prompt injection defenses: user text placed in isolated `<input>` tags; schema enforced. | P0 | P5 | `src/lib/server/aiGateway.ts` | `AC-AI-07`: Adversarial prompt injection dataset passes.| Security Test |
| **CHT-01** | Chatbot "Tina" displays permanent independence disclaimer and secret warning bubble. | P2 | P1 | `src/app/chat/page.tsx` | `AC-CHT-01`: Ribbon and initial warning rendered. | E2E (Playwright) |
| **CHT-02** | Chat messages are sanitized before intent classification or LLM matching. | P2 | P4 | `src/lib/sanitise/sanitiser.ts` | `AC-CHT-02`: Aadhaar/phone masked before chat handling.| Unit (Vitest) |
| **CHT-03** | Bot replies render structured Fix Cards inside chat bubbles; never author advice. | P2 | P5 | `src/components/ChatBubble.tsx` | `AC-CHT-03`: Bot bubbles consume verified library entries.| Component Test |
| **CHT-04** | Decision questions (*"Will I get money?"*) trigger instant fixed refusal template. | P2 | P2 | `src/lib/chat/refusalEngine.ts` | `AC-CHT-04`: Eligibility questions get canned refusal.| Unit / E2E |

---

## 4. Non-Functional Requirements (NFR) Traceability

| NFR ID | Metric / Quality Requirement | Target Specification | Principle | Verification Method & Release Gate |
|:---|:---|:---|:---:|:---|
| **NFR-01** | **Bundle Size Budget** | Initial JavaScript bundle $\le 150\text{ KB}$ gzipped. | P9 | `size-limit` automated CI check (Release Gate G8). |
| **NFR-02** | **Mobile Load Performance** | LCP $\le 2.5\text{s}$, FID $\le 100\text{ms}$, CLS $\le 0.1$ on simulated Slow 4G. | P9 | Lighthouse CI automated run on Slow 4G profile. |
| **NFR-03** | **Matcher Latency** | Deterministic local matcher resolves query in $\le 50\text{ms}$. | P9 | Benchmark unit test (`eval-matcher.ts`). |
| **NFR-04** | **WCAG Accessibility** | WCAG 2.1 AA compliant; zero critical or serious automated violations. | P9 | Automated Playwright `@axe-core/playwright` scan (Release Gate G7). |
| **NFR-05** | **Touch Ergonomics** | Minimum interactive target size $48\text{px} \times 48\text{px}$ with $\ge 8\text{px}$ gap. | P9 | CSS visual regression and bounding box audit. |
| **NFR-06** | **Color Independence** | Status badges pair color with text, vector icon, and distinct border. | P9 | Greyscale contrast testing and DOM inspection. |
| **NFR-07** | **Zero Data Persistence** | Client persistence limited strictly to 3 allowlisted keys; 0 user text stored. | P10 | Automated storage inspection test (Release Gate G4). |
| **NFR-08** | **Zero Third-Party Tracking**| Zero Google Analytics, Facebook Pixel, or external telemetry scripts. | P10 | Content Security Policy (CSP) header audit; script audit. |
| **NFR-09** | **Complete Offline Operation**| Core user loop (Tap $\rightarrow$ Match $\rightarrow$ Card) functional without internet. | P9 | Playwright airplane-mode network interception test. |
| **NFR-10** | **Small Group Suppression** | Mock analytics suppress counts $< 10$ ($k$-anonymity enforcement). | P10 | Seeded database suppression unit test. |
| **NFR-11** | **Forbidden Phrase Ban** | Zero forbidden marketing/eligibility phrases in codebase or content. | P2 | `scripts/lint-library.ts` dictionary scan (Release Gate G2). |
| **NFR-12** | **Bilingual Content Parity** | 100% of verified library entries have human-reviewed Hindi translations. | P9 | CI library verification scan. |
| **NFR-13** | **Viewport Scalability** | Flawless rendering on 360px viewports; zero horizontal scrolling. | P9 | Viewport test at 360px, 375px, 412px, 768px, 1280px. |
| **NFR-14** | **Server API Rate Limiting** | Max 20 requests per 10 minutes per IP; hard daily ceiling (`AI_DAILY_CAP`).| P10 | Artillery / k6 load test simulating rate exhaustion. |
| **NFR-15** | **Graceful Degradation** | Complete failure of AI API never halts core application UI. | P7 | Mocked network failure test asserting UI fallback. |

---

## 5. Verification Sign-Off
All 23 User Stories, 39 Functional Requirements, and 15 Non-Functional Requirements are formally traced to specific architectural components, acceptance criteria, and automated test fixtures. No requirement is orphaned or unverified.

