# ScholarSaathi (स्कॉलर साथी)

> **Independent Prototype · Not a Government Service · Not affiliated with the National Scholarship Portal (NSP) or any Ministry.**  
> Mandatory Disclaimer (Rule P1): *Independent prototype. Not a government service. Not affiliated with NSP.*

---

## 📖 Introduction

**ScholarSaathi (स्कॉलर साथी)** is a comprehensive, privacy-first scholarship lifecycle assistant built to support Indian students navigating Central, State, and private scholarship applications. 

Applying for scholarships in India often involves complex eligibility criteria, stringent documentation requirements, multi-stage verification (Institute, District, State, PFMS/Bank), and cryptic portal remarks whenever an application is marked defective or rejected. ScholarSaathi empowers students by explaining rules in plain language (**English and Hindi**), evaluating eligibility deterministically, validating document consistency, tracking deadlines, and providing step-by-step guidance ending in official portal action.

---

## 🎯 Problem Statement

1. **Information Asymmetry & Ambiguity:** Official guidelines are spread across lengthy, disparate PDF notifications. Students frequently misinterpret eligibility criteria (such as family income ceilings, category requirements, or academic mark cutoffs).
2. **Preventable Application Rejections:** Over 30% of scholarship application defects arise from avoidable discrepancies—such as minor name or date-of-birth spelling mismatches between Class 10 marksheet and Aadhaar, or unseeded bank DBT accounts.
3. **Cryptic Portal Remarks:** When an application is flagged by an Institute Nodal Officer (INO) or District Officer (DNO), students receive terse portal codes (e.g., *"Defective due to document clarity"* or *"Bank validation failed"*), leaving them unsure of **who must act** and what specific steps to take before deadlines lapse.
4. **Data Privacy Risks:** Commercial third-party platforms often demand student Aadhaar numbers, login credentials, or phone numbers, violating Digital Personal Data Protection (DPDP) principles.

---

## 🚀 Project Objectives

- **Explain, Never Decide (Rule P2):** Provide transparent, rule-based explanations grounded in published official guidelines. Never predict or guarantee scholarship approvals or disbursement.
- **Official Hand-Off (Rule P3):** Every workflow guides the student and concludes with an official external link to `scholarships.gov.in`. ScholarSaathi never collects credentials, logs in, or submits applications on behalf of students.
- **Zero-Trust Privacy & Device Security (Rule P4 / DPDP):** Personal profile information and uploaded documents exist solely in transient client-side memory or browser-local storage. Personal Identifiable Information (PII) such as Aadhaar and phone numbers are automatically sanitized before any processing.
- **Portal Deadlines Only (Rule P8):** Scholarship windows and deadlines fluctuate. ScholarSaathi prominently warns students on every screen to verify dates on the live official portal.

---

## 🛠️ Implemented Features

### 1. Scholarship Discovery (`/discovery`, `/discovery/[scholarshipId]`)
- Search and filter central, state, and UGC/AICTE scholarship schemes.
- Filter by target education level (Pre-Matric, Post-Matric, Higher Education) and social category (SC, ST, OBC, General, Minority, EWS).
- View verified benefits, eligibility rules, required documents, and official guideline source references.

### 2. Deterministic Eligibility Checker (`/eligibility`)
- Transparent, rule-based evaluation against published scheme criteria.
- Categorizes schemes into **Potentially Eligible**, **Needs Information**, and **Ineligible**.
- Detailed criteria trace showing expected criteria vs. student profile values with source citations.

### 3. Application Readiness Hub (`/readiness`, `/readiness/[scholarshipId]`)
- 7-domain readiness checklist: Eligibility Conditions, Required Documents, Document Quality & Validity, Cross-Document Consistency, Profile Completeness, Official Portal Window, and Final Student Review.
- Identifies active blockers preventing successful submission.

### 4. Student Profile Management (`/profile`)
- Manage personal details, domicile state/district, academic qualifications, and scheme-dependent information.
- All profile data remains private on the student's device.
- Export profile data as JSON for offline backup.

### 5. Document Vault (`/vault`)
- Safe local storage for required scholarship documents (Marksheets, Income Certificate, Caste Certificate, Domicile, Bank Passbook, Fee Receipts).
- Candidate field extraction and verification badges (*Verified*, *Needs Review*).
- Zero server-side persistence of raw student files.

### 6. Cross-Document Consistency Checker (`/checker`)
- Compares student name, date of birth, and parent names across identity cards, academic marksheets, and bank records.
- Flags exact matches, minor variations (e.g., middle initials), and significant mismatches to prevent portal rejection.
- Allows students to record private explanations for legitimate spelling differences.

### 7. Safe Form Assistant (`/assistant/[scholarshipId]`)
- Displays verified candidate values mapped to scheme-specific portal fields for quick copy-pasting into `scholarships.gov.in`.
- Clear field provenance badges (*Profile*, *Vault*, *Manual*).
- Pre-submission review checklist ensuring student confirms data before visiting the portal.

### 8. Application Status Tracker & Grievance Drafting (`/tracker`, `/tracker/[applicationId]`)
- Visual stage tracker through the official 5-stage lifecycle: Submitted → Institute Verification → District/State Verification → Merit List / PFMS Sanction → Payment Disbursed.
- Automated, respectful formal grievance representation draft generator for delayed applications.

### 9. Application Deadlines & Calendar (`/calendar`)
- Track verified application windows and correction deadlines for active schemes.
- Set personal follow-up reminders with quiet-hour configuration.
- Export dates as standard iCalendar (`.ics`) files for Google Calendar, Apple Calendar, or Outlook.

### 10. Rejection & Remark Decoder (`/decode/pick`, `/decode/paste`, `/card/[entryId]`)
- Decode confusing rejection, defective, or pending remarks into plain language.
- Identifies the responsible action party: **Student**, **Institute / College**, **District / State**, or **Bank**.
- Delivers $\le 5$ ordered steps ending in official portal action.

### 11. Community Trends Dashboard (`/dashboard`)
- Privacy-preserving aggregate insights on common scholarship rejection causes.
- Strictly enforces $k$-anonymity suppression ($k \ge 10$) so no individual student data is ever exposed.

### 12. Bilingual Interface
- Complete reactive bilingual support in **English** and **हिन्दी (Hindi)** with instant language toggling.

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router), React 19, TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4, DaisyUI 5, Mantine Core 9 primitives |
| **Icons** | Lucide React |
| **State & Storage** | In-memory reactive state machines, IndexedDB / restricted localStorage allowlist |
| **Matching & Rules**| Pure deterministic TypeScript engines (zero external fuzzy/vector DB dependencies) |
| **Validation** | Zod schemas for all API payloads and content entries |
| **Testing** | Node.js native test runner (`node:test`, `node:assert`), Playwright E2E |

---

## 📁 Project Structure

```text
scholarsaathi/
├── content/                     # Reviewed static knowledge base
│   ├── glossary/                # Official terminology definitions
│   ├── library/                 # Verified NSP rejection Fix Cards (JSON)
│   └── lint/                    # Domain allowlists and forbidden phrase sets
├── data/                        # Static datasets
│   ├── assistant_knowledge.json # Application domain knowledge
│   ├── library.json             # Bundled compiled library
│   ├── mock-events.json         # Mock data for demonstration mode
│   └── scholarships.json        # Verified scholarship catalog
├── docs/                        # Specifications and rulebooks (READ-ONLY)
│   ├── MASTER-ACCEPTANCE.md     # Blocking release acceptance gates
│   ├── prd.md                   # Product specification
│   └── rules.md                 # Permanent development rulebook
├── scripts/                     # Build, test, and verification utilities
│   ├── build-library.mjs        # Library compiler
│   ├── eval-matcher.mjs         # Matcher accuracy & gate verification
│   ├── lint-library.mjs         # Content schema & policy linter
│   ├── run-all-tests.mjs        # Master test harness
│   └── ts-resolver.mjs          # Native Node ESM TypeScript resolver
├── src/
│   ├── app/                     # Next.js App Router (pages & serverless routes)
│   │   ├── about/               # About and privacy page
│   │   ├── assistant/           # Safe Form Assistant
│   │   ├── calendar/            # Deadlines & personal calendar
│   │   ├── card/                # Fix Cards & grievance drafting
│   │   ├── checker/             # Cross-Document Consistency Checker
│   │   ├── dashboard/           # Community trends dashboard
│   │   ├── decode/              # Remark picker and paste decoder
│   │   ├── discovery/           # Scholarship discovery & details
│   │   ├── eligibility/         # Deterministic eligibility checker
│   │   ├── profile/             # Student Profile management
│   │   ├── readiness/           # Application Readiness Hub
│   │   ├── tracker/             # Status tracking & lifecycle management
│   │   └── vault/               # Document Vault
│   ├── components/              # Shared presentation components
│   │   ├── FirstRunModal.tsx    # Privacy boundary consent modal
│   │   ├── LanguageSwitch.tsx   # Bilingual toggle
│   │   ├── MatchingOverlay.tsx  # Matching progress overlay
│   │   └── RibbonBanner.tsx     # Mandatory non-affiliation disclaimer
│   ├── context/                 # Application contexts (LanguageContext)
│   ├── lib/                     # Core business logic & pure engines
│   │   ├── ai/                  # AI gateway & intent classifier
│   │   ├── calendar/            # Calendar computation & iCal generator
│   │   ├── catalogue/           # Scholarship catalog query engine
│   │   ├── checker/             # Cross-document comparison algorithms
│   │   ├── eligibility/         # Deterministic eligibility evaluation
│   │   ├── profile/             # Profile schema & storage handlers
│   │   ├── readiness/           # Readiness evaluation engine
│   │   ├── sanitise/            # Zero-trust PII sanitization engine
│   │   ├── server/              # Server-side API handlers & storage
│   │   ├── tracker/             # Lifecycle timeline & grievance builder
│   │   └── vault/               # Document vault metadata handlers
│   └── styles/                  # Global styles (Tailwind CSS v4 & DaisyUI 5)
└── tests/                       # Unit, integration, and E2E test suites
    ├── ai/                      # AI gateway, prompt injection & schema tests
    ├── calendar/                # Calendar & reminder tests
    ├── catalogue/               # Catalog query tests
    ├── checker/                 # Field comparison tests
    ├── e2e/                     # End-to-end user journey tests
    ├── eligibility/             # Eligibility rule engine tests
    ├── matcher/                 # Normalizer & scorer tests
    ├── profile/                 # Profile storage & validation tests
    ├── readiness/               # Application readiness tests
    ├── sanitise/                # PII sanitizer tests
    └── vault/                   # Document vault tests
```

---

## ⚙️ Installation & Development Setup

### Prerequisites
- **Node.js:** v18.17.0 or later (v20+ recommended)
- **Package Manager:** npm (v9+) or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/adityaverma1120/scholarsaathi.git
cd scholarsaathi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
*(No external API keys are required for core features; the local deterministic engine runs out-of-the-box).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the full automated test suite (22 test suites):
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

---

## 👥 Team Details — Visionary Bytes

- **Project Owner:** Aditya Verma (`adityaverma1120`)
- **Team Members:**
  - Yatin Kumar (`yatinkumar2512006-code`)
  - Pooja Mehra
  - Yashika Shrivastav

---

## ⚠️ Known Limitations

1. **Advisory Nature:** ScholarSaathi is a technical preparation and guidance tool. It is not an official scholarship portal and cannot approve, award, or disburse scholarship funds.
2. **Official Portal Deadlines:** Deadlines announced by Central and State ministries fluctuate. Students must verify dates directly on `scholarships.gov.in`.
3. **Client-Side Document OCR:** Document inspection and candidate extraction are performed using browser-safe heuristics. Poor scan quality, low resolution, or crumpled documents may require manual field verification.
4. **No Direct Submission:** Per Principle P3, ScholarSaathi never directly logs into or alters applications on government servers. Final submission must be completed by the student on the official portal.

---

## 📜 License

*License specification pending project owner selection.*
