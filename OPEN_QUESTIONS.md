# WAJAH (वजह) — Open Questions, Document Conflicts & Technical Decisions Register
**Product:** WAJAH – Rejection Decoder  
**Document Role:** Exhaustive Conflict Register, Unverified Assumptions Audit & Architecture Decisions Awaiting Approval  
**Version:** 1.0 (Synthesized from `rules.md` §24, `memory.md` §O, `techstack.md` §30, and `chatbot.md`)  
**Status:** BLOCKED FOR IMPLEMENTATION PENDING PRODUCT OWNER APPROVAL  
**Mandate:** Under no circumstances may Antigravity or any contributor invent answers, assume unverified NSP facts, or silently modify these decisions.

---

## 1. Executive Summary & Decision Protocol

To ensure legal safety, strict adherence to the **Digital Personal Data Protection Act (DPDP Act 2023)**, and architectural consistency, WAJAH enforces a strict rule: **"When uncertain: do not guess."**

This document logs:
1. **Formal Architectural Conflicts:** Points where different specification files contradict each other, accompanied by the Lead Architect's recommended resolution.
2. **Technical Implementation Decisions:** Open architectural choices (e.g. LLM provider, database necessity, state engine) requiring owner sign-off.
3. **Real-World Unverified Information:** Critical facts regarding National Scholarship Portal (NSP) operational rules, deadlines, and contact routes that **must not be invented** and must be verified against live government portals during Phase 0.

---

## 2. Cross-Document Conflicts & Recommended Resolutions

The table below catalogs all explicit contradictions across the 12 master documentation files and provides our proposed technical resolution for your approval:

| Conflict ID | Area of Contradiction | Source Document Discrepancy | Architectural Impact | Lead Architect Proposed Resolution | Owner Approval |
|:---|:---|:---|:---|:---|:---:|
| **C-01** | **Chatbot Architecture & Stack** | `chatbot.md` specifies a standalone Node.js Express server (`PORT=3000`) with no database and an optional React Native client. `techstack.md` and `architecture .md` mandate a unified Next.js App Router monorepo. | Having two separate backends (Express + Next.js) doubles deployment overhead and violates the single repository invariant. | **Unify under Next.js App Router:** Implement the Tina chatbot under `/chat` and its API under `/api/decode` (or `/api/chat-intent`) as Next.js serverless route handlers sharing the same library. | `[PENDING]` |
| **C-02** | **Target LLM Provider & Model** | `chatbot.md` mandates xAI Grok (`grok-2-latest` / OpenAI-compatible). `techstack.md` §11 suggests Anthropic Claude (`claude-haiku-5-5`). `setup .md` mentions Gemini. | Different API clients, key structures, and pricing models. | **Provider-Neutral Adapter:** Implement an OpenAI-compatible adapter in `src/lib/server/aiGateway.ts`. Default to **xAI Grok** or **Claude Haiku** via environment variables (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`). | `[PENDING]` |
| **C-03** | **Can AI Alone Auto-Open a Card?** | `prd.md` §8.6 and `memory.md` ADR table suggest that if local match is Ambiguous/Weak but AI confidence is $\ge 0.80$, AI can auto-open card $Y$ (`ai_only`). However, `memory__1_.md` and `rules.md` §24.3 (C3) state this is undecided and caution against false certainty. | Risk of AI hallucination showing a wrong card with false certainty to a vulnerable student. | **Conservative Safety Gate:** AI alone should **NEVER** auto-open a card directly from a Weak local match. If AI is confident ($\ge 0.80$), present $Y$ as the **top candidate on S07 Disambiguation** for student confirmation. | `[PENDING]` |
| **C-04** | **Database Necessity for MVP** | `database.md` provides a full PostgreSQL schema with 3 tables (`match_events`, `feedback`, `miss_log`). `memory.md` and `rules.md` emphasize that Wajah is local-first and a database is optional. | Setting up Supabase/Neon adds infrastructure friction to the MVP. | **Zero-Database Core MVP:** The core decode loop runs 100% DB-free against bundled JSON. Deploy PostgreSQL (Supabase/Neon) or SQLite strictly in Sprint 5/6 for optional anonymous telemetry and feedback. | `[PENDING]` |
| **C-05** | **AI Client Wait Timeout** | `techstack.md` §11 mentions an 8s timeout. `MASTER-ACCEPTANCE.md` and `rules.md` mandate a strict 3-second hard UX wait cap. | Student waiting 8 seconds on a poor 3G mobile connection will perceive the app as frozen. | **Two-Tier Timeout Standard:** Server-to-model fetch timeout is **8.0s**; Client UX overlay (`S06`) auto-dismisses at **3.0s** (drops to **1.0s** if local match is confident) and continues locally. | `[PENDING]` |
| **C-06** | **State Management Engine** | `techstack.md` and `memory.md` leave open whether to use **XState v5** or a custom **Typed Reducer** (`T-DEC-10`). | XState v5 adds $\approx 18\text{ KB}$ gzipped to bundle size budget ($\le 150\text{ KB}$). | **Custom Typed Reducer:** Build a zero-dependency typed reducer (`useReducer`) with strict discriminated union actions. Only adopt XState if nested state complexity requires it. | `[PENDING]` |
| **C-07** | **Screenshot OCR Image Formats & Resizing** | `rules.md` R-OCR-02 specifies JPEG/PNG/WebP $\le 1280\text{px}$. `RULE-035` specifies JPEG/PNG only $\le 1600\text{px}$. | Impacts client-side image processing complexity and mobile browser memory limits. | **Standardize on ADR-10:** Accept JPEG, PNG, and WebP, max 5 MB, resized client-side to max 1280px on long edge before OCR ingestion. | `[PENDING]` |
| **C-08** | **Grievance Warning Phrasing** | `task.md` uses *"Nothing has been submitted"*. `rules.md` §13.1 mandates *"Nothing has been filed. You must submit this draft yourself through the official route."* | Inconsistent legal disclaimer text in automated tests. | **Adopt Stricter `rules.md` String:** Permanently use *"Nothing has been filed. You must submit this draft yourself through the official route."* | `[PENDING]` |
| **C-09** | **Source Document Precedence Hierarchy** | Prompt specifies: `prd.md` $\rightarrow$ `architecture.md` $\rightarrow$ `rules.md` $\rightarrow$ `techstack.md`. `memory.md` cites ADR table as supreme. | Ambiguity on which document governs during conflict resolution. | **Formal Precedence Hierarchy:** 1. Approved Owner Decisions (this file) $\rightarrow$ 2. `MASTER_RULES.md` (safety tiebreaker) $\rightarrow$ 3. `MASTER-ACCEPTANCE.md` $\rightarrow$ 4. `prd.md` $\rightarrow$ 5. `techstack.md` & `architecture .md`. | `[PENDING]` |

---

## 3. Real-World Unverified Information (NSP Operational Gaps)

> **CRITICAL LEGAL NOTICE:** Under product principle **P6 (No Source, No Verified Entry)** and project rules, Antigravity is strictly prohibited from inventing government policies, deadlines, or contact details. The following items are unverified and must be validated against official portals during Phase 0:

| Gap ID | Unverified Item | Current Assumption in Docs | Risk If Invented | Phase 0 Verification Action Required | Status |
|:---|:---|:---|:---|:---|:---:|
| **OQ-01** | **Official Correction Window Duration** | Assumed to be 7–15 days for defective applications. | Giving a student a false deadline could cause them to miss their window and forfeit funds. | Inspect live NSP portal guidelines for Post-Matric schemes; verify whether deadlines are state-specific. | `UNVERIFIED` |
| **OQ-02** | **Official Grievance Route** | Mentioned as NSP Grievance portal vs CPGRAMS (`pgportal.gov.in`). | Directing students to the wrong portal delays resolution. | Verify whether NSP currently resolves grievances via its internal dashboard or via CPGRAMS. | `UNVERIFIED` |
| **OQ-03** | **Official Helpdesk Contacts** | Phone `0120-6619540` and email `helpdesk@nsp.gov.in` appear in draft notes. | Listing obsolete or incorrect phone numbers erodes student trust. | Check the live header/footer on `scholarships.gov.in` for active nodal helpdesk contact info. | `UNVERIFIED` |
| **OQ-04** | **Specific Pilot Scheme Scope** | "NSP Post-Matric Scholarship" is used as an example across all specs. | Post-Matric covers multiple ministries (Minority, Tribal, Social Justice) with differing rules. | Select exactly one specific pilot scheme (e.g. *Post-Matric Scholarship for SC Students - Central Scheme*). | `UNVERIFIED` |
| **OQ-05** | **Existence of Official NSP Decoder** | Spec questions whether NSP has launched its own status explanation tool. | Building a tool redundant with an official portal feature. | Review the current NSP portal interface (2026 release) to confirm no native explainer exists. | `UNVERIFIED` |
| **OQ-06** | **Bank Account & PFMS Verification Rules** | Remarks mention "NPCI Aadhaar mapping failure" vs "Direct Bank Account". | Banking rules for DBT (Direct Benefit Transfer) changed recently. | Review PFMS (`pfms.nic.in`) DBT Aadhaar seeding guidelines for scholarship credit. | `UNVERIFIED` |
| **OQ-07** | **Meaningful Tracking Numbers in Remarks** | Spec queries if real remarks contain meaningful internal numbers (OQ7). | Normalizer step N5 strips digits; could strip crucial case codes if not validated. | Inspect 20+ real-world captured remark screenshots to verify digit usage. | `UNVERIFIED` |
| **OQ-08** | **Hindi Spelling of "WAJAH"** | Spelled as "वजह" throughout documents. | Transliteration nuance in Hindi/Urdu. | Confirm formal spelling with the project Hindi language reviewer. | `UNVERIFIED` |
| **OQ-09** | **Legal Permission for Portal Quotations** | Reproducing exact NSP error strings and portal UI remarks. | Potential copyright or fair-use challenges under Indian law. | Fair-use / public interest review under India's DPDP Act 2023 for citing public service notices. | `UNVERIFIED` |
| **OQ-10** | **Pilot Knowledge Entries Sign-Off** | All 14 candidate entries (`nsp_*`) are currently marked `status: "unverified"`. | Deploying unverified entries in production is a critical Release Gate blocker. | Complete dual-reviewer sign-off (including external nodal officer) before production build. | `UNVERIFIED` |

---

## 4. Architectural Decisions Awaiting Explicit Approval

Before the engineering team starts authoring code in Sprint 1, please provide your formal decision on the following four key items:

### Decision 1: AI Provider Selection for the Hackathon
- **Option A (Recommended):** Use **xAI Grok API** (`grok-2-latest`) with temperature 0.0, utilizing an OpenAI-compatible client, exactly as detailed in `chatbot.md`.
- **Option B:** Use **Anthropic Claude** (`claude-haiku-5-5`), as suggested in `techstack.md` §11.
- **Option C:** Use **Google Gemini API** (`gemini-1.5-flash`), leveraging high free-tier rate limits.
- *Lead Architect Recommendation:* **Option A (xAI Grok)** or **Option C (Google Gemini)** wrapped inside the provider-neutral adapter.

### Decision 2: Database Strategy for Demo & Hackathon
- **Option A (Recommended):** **Zero-Database MVP.** Run the core application purely on static JSON (`library.json`) and in-memory state. Generate synthetic mock data for the S14 Dashboard (`mock-events.json`).
- **Option B:** Setup a lightweight **PostgreSQL** instance on Supabase or Neon to log live consented telemetry and error feedback.
- **Option C:** Use local **SQLite** via Drizzle ORM for local demo persistence.
- *Lead Architect Recommendation:* **Option A for Sprints 1–4**, graduating to **Option B** only if aggregate dashboard features are required for the live presentation.

### Decision 3: Guided Chatbot ("Tina") Inclusion in Live Demo
- **Option A (Recommended):** Build Tina (`S15`) as a secondary post-MVP feature gated behind `FEATURE_CHAT`, prioritizing the core Fix Card journey (`S01` $\rightarrow$ `S04` $\rightarrow$ `S08`) first.
- **Option B:** Build Tina as the centerpiece conversational interface alongside the Fix Card.
- *Lead Architect Recommendation:* **Option A**. The core value proposition of WAJAH is deterministic, structured Fix Cards that work offline; conversational chat should remain a secondary interface.

### Decision 4: Demo Mode Draft Content Policy
- **Option A (Recommended):** In `DEMO_MODE=true`, allow the 14 candidate pilot entries to be displayed for evaluation, but enforce a prominent orange **DRAFT / UNVERIFIED** banner (`C-DRAFT`) on every card.
- **Option B:** Physically block any unverified entries from appearing in the UI; show an empty tap list with an official portal link until Phase 0 verification is 100% complete.
- *Lead Architect Recommendation:* **Option A for Hackathon Evaluation / Demo Mode**, strictly enforcing **Option B for Production Builds**.

---

## 5. Formal Sign-Off Request

Please review this document and indicate:
1. Approval of proposed conflict resolutions (**C-01 through C-09**).
2. Selection of your preferred choices for **Decisions 1, 2, 3, and 4**.

*Implementation will strictly commence once this sign-off is recorded.*

