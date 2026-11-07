# SCHOLARSAATHI DOCUMENTATION RECONCILIATION
**Project:** ScholarSaathi (formerly WAJAH – वजह)  
**Date:** November 2026  
**Document Status:** Approved Permanent Master Reconciliation Specification  
**Authority:** Governed by `AGENTS.md`, `docs/rules.md`, `docs/MASTER-ACCEPTANCE.md`, and `scholarship_assistant_docs/00_MASTER_INDEX.md`.

---

## 1. Overview and Purpose of Reconciliation

This reconciliation document bridges and unifies two sets of specifications:
1. **The Original WAJAH Specification (`docs/*`):** The focused, production-grade NSP rejection status decoder prototype, delivering sub-second local matching, PII sanitization, structured Fix Cards, grievance drafting, and the safe Tina Guided Chatbot.
2. **The New ScholarSaathi Specification (`scholarship_assistant_docs/*`):** An expanded vision transforming WAJAH into a comprehensive student scholarship lifecycle companion covering student profiles, document vaults with OCR, cross-document inconsistency checks, verified scholarship discovery, deterministic 3-valued eligibility evaluation, application readiness checklists, guided form-filling assistance, status tracking, and grounded conversational support.

### Reconciliation Principle: In-Place Evolution, Zero Regressions
- **Do not rebuild from scratch:** The existing Next.js 15 App Router application, pure TypeScript matching engine, Zod-validated APIs, SQLite/in-memory analytics layer, and Tina chatbot provide a robust foundation.
- **Preserve core invariants:** All DPDP privacy rules (zero raw text persistence, PII sanitization before normalization, 3-key localStorage allowlist), non-affiliation ribbons, explain-never-decide rules, and official portal hand-offs remain strictly binding.
- **Layered expansion:** The original WAJAH rejection decoding capabilities become the "Status Tracker & Grievance Assistant" pillar of ScholarSaathi, while new lifecycle capabilities (Profile, Vault, Discovery, Eligibility, Readiness) are cleanly added alongside it.

---

## 2. Review of Existing WAJAH Documentation

The existing WAJAH documentation suite in `docs/` defines the architecture, rules, and implementation of the NSP rejection decoder:

| File | Core Role & Specifications |
|---|---|
| `docs/prd.md` | Defines WAJAH as an independent NSP status explanation tool in English & Hindi. Identifies the 4 actors (Student, College, District/State, Bank). Sets non-goals: no login, no auto-submission, no predicting payment dates. |
| `docs/architecture .md` | 7-layer architecture: App Router, pure presentation components, decoupled state machine, pure TypeScript matcher, reviewed JSON library (`content/library/*.json`), serverless API routes, zero-raw-text storage. |
| `docs/rules.md` | Permanent developer rules: P1 (non-official disclaimer ribbon), P2 (explains, never decides), P3 (official portal hand-off button), P5 (library is sole advice source), P8 (portal deadlines only - saffron warning), N1-N10 text normalisation. |
| `docs/database.md` | Minimal data schema: anonymous match events (opt-in only), feedback with masked notes, restricted miss logs (30-day retention), k-anonymity (k ≥ 10), and mandatory "MOCK DATA" labeling. |
| `docs/chatbot.md` | "Tina" Guided Chatbot specification: 13 fixed intents, bilingual English/Hindi, strict library-grounded response templates, safe refusals for out-of-scope or manipulative inputs, zero transcript persistence. |
| `docs/MASTER-ACCEPTANCE.md` | 8 blocking release gates (G1–G8): G1 Ribbon banner, G2 Zero advice in UI, G3 100% verified library entries, G4 PII regex pass, G5 Matcher accuracy ≥ 90%, G6 AI schema gate, G7 WCAG AA, G8 Bundle ≤ 150 KB. |
| `docs/design.md` | Mobile-first 360px viewport design, touch targets ≥ 48px, high-contrast badges (never rely on color alone), saffron caution containers, DaisyUI 5 semantic components. |
| `docs/techstack.md` | Next.js 15, React 19, TypeScript 5 (Strict), Tailwind CSS v4, DaisyUI v5, Lucide React, Zod schemas, zero client vector databases. |
| `docs/setup .md` | Local dev setup, environment variables (`LLM_API_KEY`, `ALLOWED_ORIGINS`), test execution scripts. |
| `docs/appflow.md` | Detailed 9-screen flow: S01 Landing, S02 Paste Input, S03 Common Defects, S04 OCR Scan, S05 Audio Mic, S06 Matching Overlay, S07 Disambiguation, S08 Fix Card, S09 Grievance Draft. |
| `docs/task.md` | Historical implementation task tracker for the WAJAH prototype milestones. |
| `docs/memory.md` | Developer context notes, architectural invariants, and design system decisions. |
| `AGENTS.md` | Permanent binding instructions for AI coding assistants and human developers. |

---

## 3. Review of New ScholarSaathi Documentation

The 27 markdown files in `scholarship_assistant_docs/` describe the broader scholarship lifecycle platform:

| File | Scope & Key Mandates |
|---|---|
| `00_MASTER_INDEX.md` | Master index, product principles (evidence before confidence, rules decide; AI explains, no false authentication, student in control, privacy by design, honest status labels, no fabricated data), proposed first release scope. |
| `01_PRODUCT_VISION.md` | Vision statement: "Your complete scholarship assistant — discover, check, prepare, apply and track." Target audience: secondary, higher-secondary, UG, PG, central/state scholarship applicants. Initial geography: NSP and Uttar Pradesh. |
| `02_PRD.md` | PRD defining personas (student applicant, renewal applicant, document issue, application problem, scheme reviewer), main 16-step user journey, P0/P1/P2 priority tiers, user-visible language standards. |
| `03_FUNCTIONAL_REQUIREMENTS.md` | System-wide functional requirements FR-001 to FR-094 covering identity, profile, consent, document intake, OCR, cross-document comparison, catalogue, eligibility, readiness, and status tracking. |
| `04_FEATURE_STUDENT_PROFILE.md` | Reusable academic profile: basic, academic, and scheme-dependent sections; board-specific marks preservation; field provenance tracking (`user_input`, `document_extraction`, `official_verification`); progressive disclosure. |
| `05_FEATURE_DOCUMENT_VAULT_OCR.md` | Secure document storage, upload workflow, processing states (`uploaded`, `processing`, `needs_user_review`, etc.), readability and format checks, confidence-aware OCR extraction, and short-lived signed URLs. |
| `06_FEATURE_CROSS_DOCUMENT_CHECKER.md` | Consistency comparison engine across marksheets, certificates, and income proofs. Flags name, DOB, parent name, passing year, marks discrepancies. Safe normalisation, human explanation recording, zero fraud accusations. |
| `07_FEATURE_SCHOLARSHIP_DISCOVERY.md` | Curated scholarship catalogue. Source hierarchy (official guideline > portal page > provider page). Filters for state, course, provider, academic-year validity. Zero mock scholarships. |
| `08_FEATURE_ELIGIBILITY_ENGINE.md` | Deterministic 3-valued eligibility engine: `PASS`, `FAIL`, `UNKNOWN`. Rule schema, constrained operators. Mandatory unknown = `NEEDS_INFORMATION`. Unverified rule = `UNVERIFIED`. AI explains but cannot decide. |
| `09_FEATURE_DOCUMENT_MATCHING_READINESS.md` | Scheme-specific document checklist, matching student vault files to requirements (`AVAILABLE`, `MISSING`, `NEEDS_REVIEW`, `POTENTIAL_MISMATCH`, `EXPIRED`). Application readiness stages. |
| `10_FEATURE_VERIFICATION_ASSISTANT.md` | Verification boundaries: file validation vs content extraction vs consistency check vs official verification. Separates automated heuristics from official authority verification. Zero "AI certificate authenticity" claims. |
| `11_FEATURE_APPLICATION_ASSISTANT.md` | Guided form preparation: Stage A (guided explanation & copy), Stage B (preparation workspace), Stage C (assisted browser interaction). No auto-submit, no password/OTP storage, no bypassing security controls. |
| `12_FEATURE_STATUS_TRACKER_GRIEVANCE.md` | Status explanation, timeline recording, and grievance generator. Directly incorporates WAJAH's status decoding, who-must-act responsibility mapping, and official grievance desk routing. |
| `13_FEATURE_AI_ASSISTANT_RAG.md` | Conversational RAG assistant grounded strictly in verified knowledge sources. Citations and source links required. Transparent admission when evidence is insufficient. Bilingual Hindi/English. |
| `14_FEATURE_NOTIFICATIONS_CALENDAR.md` | Application opening, closing, renewal, and correction deadlines. Backend scheduled reminders with source verification dates. Personal custom reminders. Quiet hours and user opt-out. |
| `15_UX_DESIGN_ACCESSIBILITY.md` | Mobile-first UX, bottom navigation, card-based dashboard, design tokens, WCAG 2.2 AA accessibility, Android small-screen ergonomics, low-bandwidth optimizations. |
| `16_SYSTEM_ARCHITECTURE.md` | Architectural components: Frontend, Backend API services (Profile, Document, Catalogue, Eligibility, Readiness, Status, AI, Admin), relational database, private object storage, queue/job processor, external adapters. |
| `17_DATA_MODEL.md` | Logical entities: `User`, `StudentProfile`, `AcademicRecord`, `Document`, `ExtractedField`, `DocumentCheck`, `CrossDocumentComparison`, `Scholarship`, `ScholarshipRuleSet`, `EligibilityCondition`, `EligibilityEvaluation`, `ApplicationRecord`, `KnowledgeSource`. |
| `18_API_SPECIFICATION.md` | Proposed REST API routes: `/api/profile`, `/api/documents`, `/api/document-comparisons`, `/api/scholarships`, `/api/eligibility/evaluate`, `/api/readiness`, `/api/application-preparation`, `/api/assistant/messages`, `/api/admin/*`. |
| `19_SECURITY_PRIVACY.md` | Zero-trust DPDP privacy governance: data minimisation, explicit consent per purpose, encrypted private storage, short-lived URLs, zero full PII in logs, secure deletion cascades, prompt-injection defense. |
| `20_TECH_STACK_AND_INTEGRATIONS.md` | Preservation rule: retain working frontend/backend/Capacitor setup. Guidelines for PostgreSQL, private object storage, PaddleOCR/cloud OCR adapters, Gemini AI adapters, background workers. |
| `21_TESTING_AND_ACCEPTANCE.md` | Test strategy: unit, integration, contract, E2E, accessibility, security IDOR tests, RAG evaluation set, 15 release acceptance criteria. |
| `22_ROADMAP_AND_MILESTONES.md` | 8 delivery milestones (M0 Audit to M7 Expansion). Narrow complete journey first. Release gates at every milestone. |
| `23_RENAMING_AND_MIGRATION.md` | Migration checklist from Wajah to ScholarSaathi: inventory, visible branding update, Android app label update, preserve Android package ID, backward compatibility of internal keys and APIs. |
| `24_BACKLOG_AND_TASKS.md` | Implementation backlog structured by Epics A through I with explicit Definition of Done. |
| `25_KNOWN_LIMITATIONS_AND_RISKS.md` | Risk registry: outdated rules, OCR errors, false warnings, false authenticity claims, sensitive data exposure, AI hallucinations, portal policy violations. Mitigation strategies and blocking release risks. |
| `RENAMING_WAJAH_TO_SCHOLARSAATHI.md` | Step-by-step rebranding guide: modify in place, preserve working code, replace visible branding, preserve internal compatibility identifiers (`nsp_*`, storage keys, API routes). |

---

## 4. Retained Requirements from WAJAH

The following core requirements from WAJAH are non-negotiable and carried forward directly into ScholarSaathi:

1. **Non-Affiliation Disclaimer Ribbon (`C-RIBBON`):**
   - Present on every screen in the root layout: *"ScholarSaathi is an independent prototype. Not a government service. Not affiliated with NSP or any Ministry."*
   - Never use official government emblems, Ashoka lions, or flag-imitating tricolors.
2. **Explains, Never Decides (`P2`):**
   - The platform explains status remarks and eligibility criteria; it never decides scholarship approval and never predicts payment disbursement dates.
3. **Official Portal Hand-Off (`P3`):**
   - Every status fix card, application preparation screen, and grievance draft ends with an external hand-off button to the relevant official portal (`scholarships.gov.in`, state portals). ScholarSaathi never logs into portals or submits applications automatically on behalf of students.
4. **Reviewed Library as the Sole Advice Source (`P5`):**
   - Scholarship status explanations, fault badge assignments, and action steps must originate exclusively from reviewed JSON library entries. Components and AI must never hallucinate advice.
5. **Portal Deadlines Only (`P8`):**
   - All deadlines fluctuate; every card and timeline display features the prominent caution: *"Check the date on the portal."* Never hardcode unverified application deadlines.
6. **PII Sanitizer Precedence (`N5`):**
   - The regex-based PII sanitizer always executes before normalisation and before any network call. Aadhaar numbers (12 digits) are masked with `[ID]`, phone numbers (10 digits) with `[NUM]`, and emails with `[EMAIL]`.
7. **Zero Raw Text Persistence:**
   - Raw pasted rejection remarks, raw chat transcripts, and grievance scratch text exist exclusively in transient memory. They are never written to `localStorage`, server application logs, or database tables.
8. **Client Storage Allowlist:**
   - Client `localStorage` is strictly restricted to known keys: language preference (`wajah.lang` / `scholarsaathi.lang`), notice acknowledgement, and anonymous statistics consent.
9. **Tina Guided Chatbot Invariants:**
   - 13 fixed intents, safe refusals for manipulative/out-of-scope inputs, library-backed responses, Web Speech read-aloud support, and session-cleared memory.
10. **Anonymous Analytics with $k$-Anonymity:**
    - Match event counts and defect statistics require explicit opt-in and enforce $k$-anonymity suppression ($k \ge 10$). Mock data is always clearly badged with a "MOCK DATA" banner.

---

## 5. New Requirements Introduced by ScholarSaathi

ScholarSaathi broadens the scope from a reactive rejection decoder to a proactive scholarship assistant:

1. **Student Profile and Academic Vault (`04_FEATURE_STUDENT_PROFILE.md`):**
   - Reusable profile containing basic personal information (domicile state, district, language), academic history (Class 10, Class 12, higher education, board, marks, CGPA), and scheme-dependent fields (income bracket, category, minority status).
   - Progressive profiling: only prompt for sensitive or scheme-dependent fields when an active scheme requires them.
   - Field-level provenance tracking: `user_input`, `document_extraction`, `official_verification`.
2. **Secure Document Vault and OCR (`05_FEATURE_DOCUMENT_VAULT_OCR.md`):**
   - Secure intake for marksheets, income certificates, caste certificates, and domicile proofs.
   - OCR text extraction preserving field-level confidence, original extracted text, and user-edited overrides.
   - Quality checks: blur, rotation, low resolution, missing fields, certificate validity.
   - Private storage with short-lived signed URLs.
3. **Cross-Document Consistency Checker (`06_FEATURE_CROSS_DOCUMENT_CHECKER.md`):**
   - Automated comparison across uploaded student documents for critical fields (Student Name, Parent Name, Date of Birth, Passing Year, Board, Marks).
   - Results: `exact_match`, `likely_match`, `possible_mismatch`, `significant_mismatch`, `not_comparable`, `user_explained`.
   - Clear distinction: preliminary consistency check, never a fraud accusation.
4. **Curated Scholarship Catalogue (`07_FEATURE_SCHOLARSHIP_DISCOVERY.md`):**
   - Scheme records with verified source hierarchy (official scheme guidelines, department portal pages).
   - Scheme fields: stable ID, academic year, provider type (Central, State, Institutional), benefits, required documents, application window.
   - Academic-year awareness: past-year deadlines are clearly marked closed/expired.
5. **Deterministic 3-Valued Eligibility Engine (`08_FEATURE_ELIGIBILITY_ENGINE.md`):**
   - Rules-based evaluation returning `PASS`, `FAIL`, or `UNKNOWN` for each condition.
   - Overall outcomes: `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE`, `NEEDS_INFORMATION` (missing student field), or `UNVERIFIED` (stale/unreviewed scheme rule).
   - Core principle: Rules decide; AI explains. AI cannot alter condition outcomes.
6. **Scheme Document Matching & Application Readiness (`09_FEATURE_DOCUMENT_MATCHING_READINESS.md`):**
   - Comparison of scholarship requirements against student vault documents: `AVAILABLE`, `MISSING`, `NEEDS_REVIEW`, `POTENTIAL_MISMATCH`, `EXPIRED`.
   - Readiness stages: `NOT_STARTED` → `IN_PROGRESS` → `BLOCKED` → `READY_FOR_STUDENT_REVIEW` → `STUDENT_CONFIRMED_READY`.
7. **Document Verification Boundaries (`10_FEATURE_VERIFICATION_ASSISTANT.md`):**
   - 4-layer taxonomy: File validation, Content extraction, Consistency check, Official verification.
   - Official verification is claimed only when confirmed via an official authority endpoint; zero AI-only authenticity claims.
8. **Guided Form-Filling Assistant (`11_FEATURE_APPLICATION_ASSISTANT.md`):**
   - Field-by-field guidance mapping student profile values to official form fields with one-click copy.
   - Student confirmation of all values before leaving for the official portal.
   - Absolute prohibition against automated portal submission or security/CAPTCHA bypass.
9. **Grounded AI RAG Assistant (`13_FEATURE_AI_ASSISTANT_RAG.md`):**
   - Answers grounded exclusively in verified knowledge base chunks with citations.
   - Explicit abstention when sources do not contain evidence.
10. **Application Timeline and Deadline Calendar (`14_FEATURE_NOTIFICATIONS_CALENDAR.md`):**
    - Calendar tracking verified scheme opening/closing dates, correction windows, and user-defined reminders.

---

## 6. Existing Features to Preserve

The following implemented features from WAJAH are fully functional, have 100% test coverage, and must be retained without breaking changes:

| Module / Component | File Location | Status | Action |
|---|---|---|---|
| PII Sanitizer | `src/lib/sanitise/sanitiser.ts` | Fully working (100% test pass) | Preserve; reuse across profile and document text. |
| Text Normaliser | `src/lib/matcher/normaliser.ts` | Fully working (N1-N10 pipeline) | Preserve; extend for cross-document name/field normalisation. |
| Matcher Scorer | `src/lib/matcher/scorer.ts` | Fully working (Gate G5: 100% accuracy) | Preserve as the core engine for status remark matching. |
| Reviewed JSON Library | `content/library/*.json` | 8 verified entries (CI Gate G3) | Preserve; expand with new status entries. |
| Tina Guided Chatbot | `src/app/chat/page.tsx`, `src/lib/chat/*` | 13 fixed intents, Web Speech, safe refusals | Preserve; update branding to ScholarSaathi Assistant. |
| Fix Card & Grievance | `src/app/card/[entryId]/*` | Fully working, official portal links | Preserve as the status decoder Fix Card. |
| Local AI Reconciliation | `src/lib/ai/reconcile.ts`, `why.ts` | 6-branch decision tree, Gate G6 | Preserve; acts as AI fallback for status decoding. |
| Forbidden Phrase Gate | `src/lib/ai/forbidden.ts` | Catches promise/guarantee/deadline words | Preserve; enforce on all RAG and AI outputs. |
| Analytics & Dashboard | `src/app/api/dashboard/*`, `src/app/dashboard/*` | $k$-anonymity, MOCK DATA label | Preserve; update product labels. |

---

## 7. Duplicate Requirements Analysis

Both Wajah and ScholarSaathi specifications share several requirements. These duplicates are reconciled as follows:

| Area | WAJAH Requirement | ScholarSaathi Requirement | Reconciled Standard |
|---|---|---|---|
| **Independence Disclaimer** | Mandatory non-dismissable disclaimer ribbon (`C-RIBBON`). | Independent prototype, not an official government service. | Unified root `RibbonBanner` with ScholarSaathi branding: *"ScholarSaathi is an independent student-support platform. Not a government service. Not affiliated with NSP or any Ministry."* |
| **Explains, Never Decides** | WAJAH explains remarks; never decides eligibility or predicts payment. | Rules decide; AI explains. Never guarantee approval or payment. | Deterministic logic evaluates rules/remarks; AI only explains. Strictly zero payment or sanction guarantees. |
| **Official Portal Handoff** | Every Fix Card ends with a button linking to `scholarships.gov.in`. | Student applies on the official portal themselves; no auto-submit. | Clear external links with handoff guidance to official portals. No automated submissions or credential handling. |
| **Grievance Drafting** | Editable template with official escalation desk contacts. | Editable grievance draft with official routing sources. | Single unified grievance generator (`/api/grievance-draft`) with editable placeholders and verified desk contacts. |
| **PII & Privacy** | Regex masking (`[ID]`, `[NUM]`, `[EMAIL]`); zero raw text stored. | Data minimisation, zero raw text in logs, encrypted storage. | Unified PII masking pipeline applied before any processing, matching, or logging. |
| **Language Support** | Full English and Hindi support; toggle anywhere. | Simple English with Hindi support retained; WCAG contrast. | Retained `LanguageContext` supporting instant English/Hindi switching across all screens. |

---

## 8. Conflicting Requirements & Architectural Resolutions

| Conflict | WAJAH Specification | ScholarSaathi Specification | Resolution & Architectural Decision |
|---|---|---|---|
| **Product Scope** | Narrow NSP rejection status decoder only. | Full scholarship lifecycle: Profile, Vault, Discovery, Eligibility, Readiness, Status. | **Unified Modular Architecture:** The rejection status decoder is retained intact as the **Status & Grievance** pillar (`/decode`, `/card`, `/grievance`). The expanded lifecycle pillars (`/profile`, `/vault`, `/discovery`, `/eligibility`, `/readiness`) are added as complementary modules. |
| **Data Persistence** | Zero database required for MVP; purely transient client memory; strictly 3 `localStorage` keys. | User profile, document metadata, and uploaded files stored across sessions. | **Dual-Mode Data Architecture:**<br>1. *Status Decoder & Tina Chat:* Retains 100% zero-database, zero-raw-text transient execution.<br>2. *Profile & Document Vault:* Uses local client-side storage (indexedDB/encrypted session) for prototype/offline mode, with optional authenticated backend storage when user accounts are enabled. |
| **Branding Name** | Wajah (वजह) – Rejection Decoder. | ScholarSaathi – Your all-in-one scholarship assistant. | **Safe In-Place Rebrand:** All user-facing screens, navigation, titles, and chatbot greetings are renamed to **ScholarSaathi**. Internal technical identifiers (`nsp_*`, `wajah.*` storage keys, existing API paths) are preserved to prevent backward compatibility breaks. |
| **Eligibility Authority** | Never evaluate or comment on scholarship eligibility. | Evaluate deterministic eligibility against published criteria (`PASS`/`FAIL`/`UNKNOWN`). | **Deterministic Rule Engine with Strict Boundaries:** ScholarSaathi evaluates whether *recorded student data satisfies published criteria*, clearly badged as *"Potentially eligible based on published rules"*. It never claims official eligibility sanction or approval. |
| **Document Authenticity** | No document analysis beyond OCR text extraction. | OCR extraction, readability checks, cross-document comparison. | **Honest Verification Taxonomy:** Implement file checks, content extraction, and cross-document comparison, but **strictly prohibit claiming certificate authenticity** without an authorized issuing authority API. |

---

## 9. Architecture and Technology Evolution

The project will continue to use the modern, lightweight Next.js 15 stack:

```
src/
├── app/                              # Next.js 15 App Router
│   ├── layout.tsx                    # Root Layout with C-RIBBON & Nav
│   ├── page.tsx                      # ScholarSaathi Unified Hub
│   ├── about/page.tsx                # About ScholarSaathi
│   ├── chat/page.tsx                 # ScholarSaathi Assistant (Tina)
│   ├── dashboard/page.tsx            # Analytics Dashboard
│   ├── decode/                       # Status Decoder Flow (from Wajah)
│   │   ├── paste/page.tsx            # Paste Rejection Remark
│   │   ├── pick/page.tsx             # Common Defects
│   │   └── choose/page.tsx           # Disambiguation
│   ├── card/[entryId]/               # Fix Card & Grievance
│   ├── profile/                      # (New) Student Profile & Academic Vault
│   ├── vault/                        # (New) Document Vault & Checks
│   ├── discovery/                    # (New) Scholarship Discovery Catalogue
│   ├── eligibility/                  # (New) Deterministic Eligibility Engine
│   ├── readiness/                    # (New) Application Readiness Checklist
│   └── api/                          # Backend API Routes
│       ├── decode/                   # Status matching
│       ├── match-ai/                 # Status AI fallback
│       ├── understand/               # Match reconciliation
│       ├── grievance-draft/          # Grievance generation
│       ├── events/                   # Anonymous analytics
│       ├── feedback/                 # User feedback
│       ├── profile/                  # (New) Profile management
│       ├── documents/                # (New) Document upload/checks
│       ├── compare/                  # (New) Cross-document comparison
│       ├── scholarships/             # (New) Scholarship discovery
│       └── eligibility/              # (New) Deterministic rule evaluation
├── components/                       # Shared presentation components
│   ├── RibbonBanner.tsx              # C-RIBBON non-affiliation banner
│   ├── LanguageSwitch.tsx            # C-LANG bilingual toggle
│   ├── FaultBadge.tsx                # Responsibility badge
│   ├── StepList.tsx                  # Action steps
│   ├── DeadlineBox.tsx               # Saffron deadline caution
│   └── SourceBox.tsx                 # Official source link
├── lib/                              # Pure TypeScript business logic
│   ├── sanitise/                     # PII Masking
│   ├── matcher/                      # Text Normaliser & Scorer
│   ├── eligibility/                  # (New) Deterministic 3-valued engine
│   ├── compare/                      # (New) Cross-document comparator
│   ├── vault/                        # (New) File & OCR checker
│   ├── chat/                         # Tina Guided Chatbot intents
│   ├── ai/                           # Reconciliation, why-lines, forbidden gate
│   └── server/                       # AI Gateway, DB & rate limiting
└── content/                          # Static Reviewed Knowledge Base
    ├── library/                      # Status rejection entries (nsp_*.json)
    └── scholarships/                 # (New) Verified scholarship scheme rules
```

---

## 10. Database and API Specification Gaps

| API Route | Existing Status | ScholarSaathi Requirement | Implementation Strategy |
|---|---|---|---|
| `POST /api/decode` | Fully implemented | Retained for status decoding | Preserved with zero changes. |
| `POST /api/match-ai` | Fully implemented | Retained for status AI fallback | Preserved with zero changes. |
| `POST /api/understand` | Fully implemented | Retained for match reconciliation | Preserved with zero changes. |
| `POST /api/grievance-draft` | Fully implemented | Retained for grievance generation | Preserved; extend to support scheme-specific desk contacts. |
| `POST /api/events` | Fully implemented | Retained for opt-in analytics | Preserved with zero changes. |
| `POST /api/feedback` | Fully implemented | Retained for card feedback | Preserved with zero changes. |
| `POST /api/miss` | Fully implemented | Retained for unknown statuses | Preserved with zero changes. |
| `GET /api/dashboard` | Fully implemented | Retained for dashboard stats | Preserved; update branding copy. |
| `GET /api/profile` | Not implemented | Profile retrieval | Implement in Phase 2 with schema validation. |
| `PUT /api/profile` | Not implemented | Profile update & provenance | Implement in Phase 2 with schema validation. |
| `POST /api/documents` | Not implemented | Document upload & validation | Implement in Phase 3 with file signature checks. |
| `POST /api/compare` | Not implemented | Cross-document field check | Implement in Phase 4 with safe normalisation. |
| `GET /api/scholarships` | Not implemented | Curated scholarship discovery | Implement in Phase 5 with verified static schemes. |
| `POST /api/eligibility/evaluate` | Not implemented | Deterministic rule evaluation | Implement in Phase 6 with PASS/FAIL/UNKNOWN engine. |

---

## 11. Missing Information and Unresolved Decisions

The following open decisions from `scholarship_assistant_docs/25_KNOWN_LIMITATIONS_AND_RISKS.md` and `OPEN_QUESTIONS.md` are documented with their interim development resolutions:

1. **User Authentication vs Anonymous Mode:**
   - *Status:* Core MVP operates in **zero-account mode** using client-side encrypted storage for profiles and documents. Server-side multi-user authentication is scheduled for Post-MVP Milestone 7.
2. **OCR Engine Selection:**
   - *Status:* In local development and browser environments, use Tesseract.js / Canvas-based extraction with a pure TypeScript fallback mock parser for synthetic test documents. Cloud OCR adapters (PaddleOCR / Google Cloud Document AI) will be isolated behind an adapter interface.
3. **Official Verification APIs:**
   - *Status:* Since no official government API credentials or Digilocker B2B keys are currently configured in this environment, official verification is labeled as `"Official verification not available in prototype mode"`. Under no circumstances will the system claim a certificate is officially authenticated.
4. **Initial Scholarship Schemes:**
   - *Status:* Starting with a focused, verified set of 3 National Scholarship Portal (NSP) schemes (Pre-Matric Minorities, Post-Matric SC/ST, Merit-cum-Means) and 1 Uttar Pradesh State Scholarship scheme, fully documented with official guideline URLs and academic year 2026-27 validity.

---

## 12. Conclusion & Authorization to Proceed

This reconciliation establishes a clean, non-destructive path to advance WAJAH into ScholarSaathi. All existing tests (`npm test`) pass 100%, and production builds compile cleanly. 

The project will proceed immediately into **Phase 1: Rebranding and Foundation**.

