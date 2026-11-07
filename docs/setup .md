# Wajah — Setup (Consolidated)

> Consolidated from the setup files supplied for Wajah — Rejection Decoder. Source content is reproduced verbatim, including all commands, versions and configuration values; only heading levels were deepened so each source section nests under the part and source label shown below.

## Source key

| Source file | Notes |
|---|---|
| `setup2.md` | Reproduced under “Source: `setup2.md`” in each part |
| `setup.md` | Reproduced under “Source: `setup.md`” in each part |
| `wajah_development_setup_installation_guide.md` | Reproduced under “Source: `wajah_development_setup_installation_guide.md`” in each part |

Section numbers and cross-references inside each reproduced source refer to that source file's own numbering. Where sources differ (for example on versions, environment variables or commands), each version is kept under its own source label and none has been resolved.

## Parts

1. Overview, Purpose and Before You Begin
2. System Requirements and Prerequisites
3. Create or Open the Project, Repository Layout and Dependencies
4. Configuration, Environment Variables and Data Files
5. Scripts, Build and Tooling
6. Running the Development Server and Verifying the Application
7. Database Setup
8. AI Setup
9. Optional Browser Features
10. Testing and Quality Assurance
11. CI/CD, Deployment and Operations
12. Troubleshooting
13. Checklists, First-Run Sequence and Completion Criteria

---

## Part 1 — Overview, Purpose and Before You Begin

### Source: `setup2.md`

#### Wajah --- Development Setup Guide (`setup.md`)

**Product:** Wajah --- Rejection Decoder\
**Document version:** 1.0\
**Aligned documents:** PRD v1.1 · Architecture v1.0 · App Flow v1.0 ·
Design v1.0 · Rules v1.0 · Tech Stack v1.0 · Database v1.0 · API v1.0 ·
Components v1.0 · Tasks v1.0\
**Source:** *Wajah App Build Specification with Chat v1.1 AI layer*\
**Status:** Proposed setup instructions; not evidence of a deployed
application\
**Classification:** Independent prototype. Not a government service.

> **Setup principle:** Get the local-first Wajah experience running
> before configuring AI or a database. The tap list, reviewed content
> library, deterministic matcher, and fix cards must not depend on an AI
> key, database, or live network connection after the app has loaded.

------------------------------------------------------------------------

##### 1. Purpose

This guide explains how a developer can prepare a computer, create or
open the Wajah repository, install dependencies, configure local
environment variables, run the application, and verify the basic
development setup.

It is written for a small student/hackathon team. Follow the core setup
first; optional services can be added later.

###### What this guide assumes

-   The team is using the recommended Next.js App Router + TypeScript +
    Tailwind stack.
-   npm is the package manager for the initial setup examples.
-   The repository may still be a proposed structure. Adapt commands to
    the actual `package.json`, framework version, and hosting provider
    selected by the team.
-   No feature is considered complete just because the project starts
    successfully.

### Source: `setup.md`

#### Wajah — Setup Guide

> Independent prototype. Not a government service. Not affiliated with NSP or any ministry.

| | |
|---|---|
| **Document** | Developer and environment setup for Wajah (Rejection Decoder) |
| **Version** | 1.0 (draft for build) |
| **Date** | 2 November 2026 |
| **Derived from** | `PRD.md`, `architecture.md`, `app-flow.md`, `rules.md`, `tech-stack.md`, `task.md`, *Wajah App Build Specification v1.1* |

**Read this first.** The source documents define the stack, layout, scripts, flags and environment variables, but **no repository exists yet**. This guide is therefore a *bootstrap* guide: it tells you how to create the project, wire the pieces the documents specify, and run, test and deploy it. Items taken directly from the documents are marked **(spec)**. Items that are my proposals to fill gaps (exact commands, package names, versions, file contents) are marked **(proposed)**. Adjust proposed items freely, but never the spec items without the team lead's sign-off (an ADR may be overruled only by the team lead).

---

##### 1. Before you write any code

1. **Phase 0 comes first (spec).** Do not build chat or the AI layer first. Capture real NSP screens (masked), write sourced entries, and answer open questions OQ1–OQ5 before anything is marked `verified`. See `task.md` §2.
2. **Know the non-negotiables (spec).** Skim `rules.md` §1 (P1–P10) and §22 (pre-merge checklist). The ones that affect setup the most:
   - The independence ribbon is in the root layout on every screen.
   - Advice text lives **only** in `content/` data files, never in components.
   - No third-party analytics or runtime scripts.
   - The AI is optional; the app must work fully with `/api/*` blocked.
   - Never log request bodies; never store typed text.
3. **Use synthetic data only (spec, R-SAN-06).** Never put real Aadhaar numbers, phones, OTPs, application IDs or real student screenshots in tests, fixtures, commits or issues.

---

### Source: `wajah_development_setup_installation_guide.md`

#### Wajah (वजह): Rejection Decoder — Development Setup & Installation Guide

| Version | 1.1 |
| :--- | :--- |
| Date | 1 November 2026 |
| Project | Wajah — Build For Bharat 2026 Pan-India Hackathon, KIET Deemed to be University, Ghaziabad |

---

---

## Part 2 — System Requirements and Prerequisites

### Source: `setup2.md`

##### 2. Before you begin

###### 2.1 Required tools

  -----------------------------------------------------------------------
  Tool                    Why it is needed        Setup guidance
  ----------------------- ----------------------- -----------------------
  Node.js (LTS)           Runs Next.js and        Install a currently
                          development tooling     supported LTS release
                                                  that satisfies the
                                                  selected Next.js
                                                  version

  npm                     Installs and manages    Included with Node.js
                          packages                

  Git                     Clones the repository   Install Git for your
                          and manages changes     operating system

  Code editor             Editing TypeScript,     VS Code is a practical
                          React, CSS and JSON     option

  Modern browser          Local testing and       Test at least one
                          browser APIs            Chromium-based browser
                                                  and, where possible, a
                                                  mobile browser
  -----------------------------------------------------------------------

Check that Node.js and npm are available:

``` bash
node --version
npm --version
git --version
```

If a command is not recognised, install the missing tool and reopen the
terminal. Do not copy an old tutorial's exact version numbers without
checking compatibility with the Next.js release selected for the
project.

###### 2.2 Recommended team setup

-   Keep the repository in a normal development folder, not inside a
    temporary downloads folder.
-   Use Git branches or pull requests for shared work.
-   Assign owners for frontend, matching, content review, Hindi review,
    backend/AI, and QA. One person may cover more than one role.
-   Keep the reviewed scholarship content and its source evidence under
    version control.
-   Never place real student messages, screenshots, credentials, or
    personal records in the repository.

### Source: `setup.md`

##### 2. Prerequisites

| Tool | Requirement | Notes |
|---|---|---|
| Node.js | Current LTS **(proposed)** | Next.js App Router; Playwright and Vitest need a recent Node |
| Package manager | npm **(spec uses `npm run …`)** | Commit the lockfile (R-SEC dependencies) |
| Git | Any recent version | Library changes are ordinary PRs; commit messages name the entry ID |
| PostgreSQL | Local PG **or** SQLite for local/demo **(spec)** | SQLite is acceptable for a demo; Supabase/Neon for managed |
| Browser | Chrome/Edge (latest 2), Firefox (latest 2), Safari 15+, Android Chrome (Android 8+), Samsung Internet **(spec)** | Voice input works best in Chrome on Android |
| Real phone | A **mid-range Android** device **(spec, R-BW-05)** | Required for the performance and offline checks |
| LLM API key | One key for your chosen provider **(spec)** | Only needed from Phase 4; use the mock provider until then |
| Accounts | Vercel or Netlify (hosting); Supabase or Neon (managed DB) **(spec)** | Optional until you deploy |

**Not required:** any NSP account, API, or credential. Wajah never logs in to NSP (R-SCOPE-13).

---

### Source: `wajah_development_setup_installation_guide.md`

##### 1. System Requirements & Prerequisites

Before setting up the Wajah development environment, ensure your local machine meets the following requirements:
* **Node.js:** Version $20.x$ LTS or higher.
* **Package Manager:** `npm` (v10+) or `pnpm` (v8+).
* **Git:** Latest stable release for version control.
* **Database (Optional for Local Core Loop):** PostgreSQL $15+$ (via Supabase, Neon, or local Docker container) for telemetry and feedback persistence.

---

---

## Part 3 — Create or Open the Project, Repository Layout and Dependencies

### Source: `setup2.md`

##### 3. Create or open the project

###### Option A --- The repository already exists

Clone the team's repository, then enter its folder:

``` bash
git clone <REPOSITORY_URL>
cd wajah
```

Replace `<REPOSITORY_URL>` with the repository address supplied by the
team. Do not include credentials in the URL.

If the project folder has a different name, use that folder name in the
`cd` command.

###### Option B --- Create the initial Next.js project

If the team has not created the application yet, scaffold a Next.js
project with TypeScript, Tailwind CSS, ESLint, App Router, and a `src/`
directory:

``` bash
npx create-next-app@latest wajah --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd wajah
```

The scaffolding tool may change prompts or defaults over time. Review
its options and select the equivalents if the command-line flags differ.

This creates the application foundation only. It does not create the
Wajah features, reviewed library, sanitiser, matcher, PWA configuration,
or API routes.

###### 3.1 Suggested repository layout

Use the following as an organisational starting point. Do not create
every folder before it is needed.

``` text
wajah/
├── public/
│   ├── icons/
│   ├── fonts/
│   └── manifest.webmanifest
├── messages/
│   ├── en.json
│   └── hi.json
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   └── api/
│   ├── components/
│   │   ├── capture/
│   │   ├── decode/
│   │   ├── cards/
│   │   ├── layout/
│   │   └── shared/
│   ├── content/
│   │   └── library/
│   ├── features/
│   │   ├── capture/
│   │   ├── matching/
│   │   ├── grievance/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── sanitisation/
│   │   ├── normalisation/
│   │   ├── matcher/
│   │   ├── reconciliation/
│   │   ├── validation/
│   │   └── feature-flags/
│   ├── server/
│   │   ├── ai/
│   │   ├── rate-limit/
│   │   └── logging/
│   └── types/
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── docs/
├── .env.example
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

Keep domain logic (sanitisation, normalisation, matching,
reconciliation, and library validation) independent from React
components and AI-provider code.

##### 4. Install dependencies

###### If you cloned an existing repository

Use the lockfile to install the exact dependency tree committed by the
team:

``` bash
npm ci
```

If the repository does not yet have a `package-lock.json`, run
`npm install` once and commit the generated lockfile.

###### If you just scaffolded the project

The scaffolding command normally installs the initial dependencies. If
it did not, run:

``` bash
npm install
```

Add feature dependencies only when the relevant implementation is ready.
The recommended stack includes:

-   `next-intl` or an equivalent reviewed approach for English/Hindi
    localisation.
-   Vitest for unit tests.
-   Playwright for end-to-end tests.
-   `axe-core` or an equivalent integration for automated accessibility
    checks.
-   A schema-validation library such as Zod, if selected by the team.
-   Tesseract.js only when on-device OCR is being implemented.
-   Workbox or compatible Next.js PWA tooling after the framework setup
    is stable.

Do not install every optional package at the beginning. Check
compatibility, maintenance, licence, bundle-size impact, and offline
implications before adding a dependency.

### Source: `setup.md`

##### 3. Create the project

###### 3.1 Scaffold (proposed)

```bash
npx create-next-app@latest wajah --typescript --tailwind --eslint --app --src-dir
cd wajah
```

Then add the dependencies the documents name. Pin exact versions in the lockfile once installed.

```bash
# runtime (proposed groupings; all named in tech-stack.md)
npm install next-intl zod xstate @xstate/react
npm install tesseract.js          # lazy-loaded only on the Scan screen
npm install recharts              # lazy-loaded; dashboard only
npm install html-to-image         # or use plain Canvas and skip this
npm install pg                    # or your Supabase/Neon client; SQLite driver for local demo

# dev / test / quality
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test @axe-core/playwright
npm install -D size-limit @size-limit/file @lhci/cli
npm install -D workbox-build      # or next-pwa-style wrapper; see §6
```

> **Budget check (spec, R-BW-06).** Every new dependency must be justified against the **150 KB first-load JS** budget. XState, Recharts, Tesseract.js and `html-to-image` must **not** land in the first-load bundle. Lazy-load them. If XState pushes you over budget, use the typed reducer alternative the docs allow.

###### 3.2 Create the repository layout (spec)

```bash
mkdir -p content/library content/lint content/glossary content/chat
mkdir -p public/audio scripts tests/{matcher,sanitise,lint,e2e,a11y}
mkdir -p src/components src/state src/mock
mkdir -p src/lib/{sanitise,matcher,ai,chat,library,grievance,audio,share,dashboard,i18n,server}
mkdir -p src/app/decode/{pick,paste,scan,choose}
mkdir -p "src/app/card/[entryId]"/{grievance,share}
mkdir -p src/app/{no-match,report,about,dashboard,chat}
mkdir -p src/app/api/{match-ai,understand,grievance-draft,ocr,chat-intent,cluster,events,feedback,miss,dashboard}
```

Target layout (from `architecture.md` §5):

```
wajah/
├─ content/
│  ├─ library/                 one JSON per entry (nsp_*.json)
│  ├─ lint/                    forbidden.json, allowed-domains.json
│  ├─ glossary/glossary.json
│  └─ chat/templates.json
├─ public/
│  ├─ mock-events.json         generated, "mock": true
│  └─ audio/                   optional pre-generated TTS fallback
├─ scripts/
│  ├─ lint-library.ts   build-library.ts   gen-mock-events.ts
│  └─ translate-build.ts   gen-audio.ts
├─ src/
│  ├─ app/                     routes + api/*/route.ts
│  ├─ components/              RibbonBanner, FaultChip, StepList, SourceBox, SayThis,
│  │                           PiiWarning, LanguageSwitch, ListenButton, ShareImage, ...
│  ├─ lib/                     sanitise, matcher, ai, chat, library, grievance, audio,
│  │                           share, dashboard, i18n, server
│  ├─ mock/                    unmatched.json, clusters.json  ("mock": true)
│  └─ state/decodeMachine.ts
└─ tests/ {matcher, sanitise, lint, e2e, a11y}
```

###### 3.3 Enforce the layering rules (spec)

Configure ESLint import boundaries so the build fails on violations:

| Layer | May import | Must NOT import |
|---|---|---|
| `components/` | `lib/*` view-model helpers, `state/` | `lib/ai` network client directly; advice string literals |
| `state/` | `lib/matcher`, `lib/sanitise`, `lib/ai` client | React / DOM |
| `lib/matcher`, `lib/sanitise` | pure utils only | network, DOM, localStorage |
| `lib/library` | JSON data, types | UI |
| `app/api/*` | `lib/server/*`, validators | client-only modules; body-logging libraries |

Also add a CI scan that fails if an advice string appears outside `content/`, locale files or fixed template files (R-LIB-01).

---

### Source: `wajah_development_setup_installation_guide.md`

##### 2. Repository Initialization & Dependencies

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ KIET-BuildForBharat/wajah.git
   cd wajah
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the template file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required keys:
   ```env
   # App configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DEMO_MODE=true
   FEATURE_AI_MATCH=true
   FEATURE_OCR=false
   FEATURE_GRIEVANCE=true
   FEATURE_DASHBOARD=true

   # Server-side AI & Database secrets
   AI_PROVIDER_KEY=your_anthropic_or_openai_api_key_here
   MATCH_MODEL=claude-haiku-5-5
   AI_DAILY_CAP=2000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wajah_dev
   ALLOWED_ORIGIN=http://localhost:3000
   ```

---

---

## Part 4 — Configuration, Environment Variables and Data Files

### Source: `setup2.md`

##### 5. Configure local environment variables

###### 5.1 Create the local environment file

Copy the example file if the repository includes one.

**Windows PowerShell:**

``` powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**

``` bash
cp .env.example .env.local
```

If `.env.example` does not exist yet, create `.env.local` in the
repository root using the template below.

###### 5.2 Starter `.env.local` template

``` dotenv
# Public app configuration — values prefixed NEXT_PUBLIC_ are browser-visible
NEXT_PUBLIC_APP_NAME="Wajah"
NEXT_PUBLIC_DEFAULT_LOCALE="en"
NEXT_PUBLIC_ENABLE_AI="false"
NEXT_PUBLIC_ENABLE_OCR="false"
NEXT_PUBLIC_ENABLE_VOICE="true"
NEXT_PUBLIC_ENABLE_DASHBOARD="false"

# Server-only AI configuration — leave empty while AI is disabled
AI_PROVIDER_API_KEY=""
AI_PROVIDER_MODEL=""
AI_DAILY_CAP=""

# Optional persistence — leave empty for the local-first MVP
DATABASE_URL=""

# Optional operational rate-limit configuration
RATE_LIMIT_WINDOW_SECONDS="600"
RATE_LIMIT_MAX_REQUESTS="20"
```

These are suggested variable names. Match them to the actual
implementation and deployment platform before relying on them.

**Important security rules:**

-   Never commit `.env.local` or any file containing real secrets.
-   Keep `.env.local` in `.gitignore`.
-   Never prefix an AI key or database password with `NEXT_PUBLIC_`;
    those variables are exposed to the browser.
-   Do not place student messages, transcripts, grievance notes, or
    other user input in environment variables.
-   Keep AI disabled until the provider, strict response schema,
    sanitisation, timeout, rate limit, and daily spend cap have been
    implemented and tested.
-   A blank optional variable must not break the local tap-list and
    matcher path.

### Source: `setup.md`

##### 4. Configuration

###### 4.1 Environment variables (spec)

Create `.env.local` (never commit it; add to `.gitignore`):

```bash
# ---- Secrets (runtime, server-only) ----
AI_PROVIDER_KEY=           # only needed from Phase 4
DATABASE_URL=              # PostgreSQL URL, or a local SQLite path for demo

# ---- Server config ----
MATCH_MODEL=claude-haiku-5-5   # starting suggestion; cheapest model that passes the match test set
AI_DAILY_CAP=2000              # default cap; at cap -> 503 ai_unavailable -> client degrades to local
ALLOWED_ORIGIN=http://localhost:3000   # CORS + origin check; use your real origin when deployed

# ---- Public flags (baked at build) ----
DEMO_MODE=true
FEATURE_AI_MATCH=false         # turn on in Phase 4
FEATURE_AI_ALWAYS=false        # on in demo; off for low-bandwidth baseline
FEATURE_OCR=false
FEATURE_OCR_SERVER=false
FEATURE_VOICE_INPUT=false
FEATURE_AI_GRIEVANCE=false
FEATURE_AI_DASHBOARD=false
FEATURE_WHY_LINE=false
FEATURE_CHAT=false
FEATURE_GRIEVANCE=true
FEATURE_DASHBOARD=true
```

Rules:
- **Public flags are baked at build time; secrets are runtime and server-only** (R-CFG-01). In Next.js, expose public flags through `NEXT_PUBLIC_*` **(proposed)** and keep secrets un-prefixed.
- **The API key must never appear in the repo or the client bundle** (R-AI-24).
- **Every flag must be independently toggleable** without breaking anything else, for example OCR off removes the Scan button and nothing else (R-CFG-02, R-FLAG-01).

###### 4.2 What each flag does

| Flag | ON | OFF |
|---|---|---|
| `DEMO_MODE` | Draft/in_review entries bundled with a Draft banner; mock dashboard | Verified entries only; dashboard disabled |
| `FEATURE_AI_MATCH` | AI endpoint + calls | Local matcher only |
| `FEATURE_AI_ALWAYS` | AI on every free-text decode | AI only for ambiguous/weak |
| `FEATURE_OCR` | Scan door + route | Scan hidden, nothing else changes |
| `FEATURE_OCR_SERVER` | Optional server/vision OCR with notice | On-device only |
| `FEATURE_VOICE_INPUT` | Mic on paste + chat | Mic hidden |
| `FEATURE_AI_GRIEVANCE` | AI fills letter slots | Fixed template only |
| `FEATURE_AI_DASHBOARD` | Cluster panel | Hidden |
| `FEATURE_WHY_LINE` | Why-line | None |
| `FEATURE_CHAT` | `/chat` + link | Hidden |
| `FEATURE_GRIEVANCE` | Grievance builder | Hidden |
| `FEATURE_DASHBOARD` | Dashboard | Hidden |

###### 4.3 Recommended starting profiles (proposed)

| Profile | Use for | Flags |
|---|---|---|
| **Core loop** (Phases 1–3) | Tap list, paste, cards, no AI | `DEMO_MODE=true`, everything else `false` except `FEATURE_GRIEVANCE`/`FEATURE_DASHBOARD` as you build them |
| **AI on** (Phase 4+) | Fallback + why-line | add `FEATURE_AI_MATCH=true`, `FEATURE_WHY_LINE=true`; `FEATURE_AI_ALWAYS` per demo choice |
| **Low-bandwidth baseline** | Testing the cheap path | `FEATURE_AI_MATCH=true`, `FEATURE_AI_ALWAYS=false` |
| **Production (future)** | Real users | `DEMO_MODE=false`; dashboard disabled until real data + access control exist |

---

##### 5. Data files to create first (spec)

These are **data, not code** (R-LIB-02). Create them before the matcher or lint scripts so those scripts have something to read.

| File | Purpose | Notes |
|---|---|---|
| `content/lint/forbidden.json` | Forbidden phrases (EN + HI) | Case-insensitive; see `rules.md` §5. A match fails the build |
| `content/lint/allowed-domains.json` | Allowed official domains | Capture from live official sites; **do not copy URLs from the spec** (R-SRC-02) |
| `content/glossary/glossary.json` | Hindi glossary terms | Follow the portal's own wording when it differs |
| `content/chat/templates.json` | Chat templates (EN + HI) | Only needed for chat |
| `src/lib/matcher/variants.json` | Hinglish/typo/Devanagari → canonical tokens + stop-words | Seed table is in PRD §11.2 |
| `src/lib/ai/situation.json` | Fixed vocabularies (status, level, input_kind, language, fault_hint) | `[NEEDS REVIEW]` against real NSP wording |
| `src/lib/ai/why-templates.json` | Why-line templates (EN + HI) | Fixed phrases only |
| `src/lib/chat/intents.json` | 13 fixed chat intents | Only needed for chat |
| `src/i18n/en.json`, `hi.json` (path **proposed**) | UI strings | No missing keys (R-LNG-01) |
| `src/mock/unmatched.json`, `clusters.json` | Synthetic data for the AI dashboard | Must carry `"mock": true` |

Seed `forbidden.json` from the table in `rules.md` §5, for example: *you will get · you will be paid · money will come · you are eligible · you are not eligible · guaranteed · sure to be approved · will be approved · we have filed · we submitted · we applied for you · official Wajah · government service · NSP team · on behalf of NSP · powered by NSP · approved by · enter your password · share your OTP · type your Aadhaar · send your account number · always · never · within 7 days · in 15 days*. Add Hindi equivalents.

---

---

## Part 5 — Scripts, Build and Tooling

### Source: `setup2.md`

##### 8. Recommended package scripts

The exact scripts depend on which test and validation tools have been
installed. A typical `package.json` may expose commands similar to
these:

``` json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Treat this as a proposed script set, not a guaranteed working
configuration. Add a script only after its tool and configuration exist.
Check the project's actual `package.json` before running a command.

Before opening a pull request, run the checks that are configured:

``` bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run the end-to-end suite when Playwright and its browser dependencies
have been installed:

``` bash
npm run test:e2e
```

Fix failures rather than bypassing checks or weakening TypeScript and
test settings to make the build pass.

### Source: `setup.md`

##### 6. Wire up the scripts and tooling

###### 6.1 `package.json` scripts

The documents name two scripts explicitly: `npm run lint:library` and `npm run test:matcher`. The rest are proposed.

```jsonc
{
  "scripts": {
    "dev": "next dev",                                   // proposed
    "build": "npm run build:library && next build",      // proposed
    "start": "next start",                               // proposed
    "lint": "eslint .",                                  // proposed
    "typecheck": "tsc --noEmit",                         // proposed

    "lint:library": "tsx scripts/lint-library.ts",       // spec name; tsx runner proposed
    "build:library": "tsx scripts/build-library.ts",     // proposed name
    "gen:mock": "tsx scripts/gen-mock-events.ts",        // proposed name
    "translate:build": "tsx scripts/translate-build.ts", // proposed name
    "gen:audio": "tsx scripts/gen-audio.ts",             // proposed name

    "test": "vitest run",                                // proposed
    "test:matcher": "vitest run tests/matcher",          // spec name; implementation proposed
    "test:e2e": "playwright test",                       // proposed
    "test:a11y": "playwright test tests/a11y",           // proposed
    "size": "size-limit",                                // proposed
    "lhci": "lhci autorun"                               // proposed
  }
}
```

###### 6.2 What each script must do (spec)

| Script | Behaviour |
|---|---|
| `scripts/lint-library.ts` | Reads `content/library/*.json`; **exits non-zero** on any rule failure (required fields, official source + `checked_on`, ≥ 2 reviewers with ≥ 1 external, ≤ 5 steps, `deadline`/`typical_wait` need `source_ref`, forbidden phrases, allowed official domains, no unsourced phone/email, no `machine_translated` on verified + Hindi present, unique triggers, reading-level warning > 25 words) |
| `scripts/build-library.ts` | Merges entries into `library.json`; emits `library-index.json` (id, label, group, display_order, one_line_description, status) and `library-version.json` (content hash). **`DEMO_MODE` selects which statuses are bundled at build time**: production physically excludes non-verified entries |
| `scripts/gen-mock-events.ts` | Seeded random (fixed seed); 12 weeks; the 14 entries; a few dominant; a few deliberately small groups; writes `public/mock-events.json` with `"mock": true` |
| `scripts/translate-build.ts` | Build-time translation of reviewed English + glossary into an extra language, flagged `machine_translated` (needs human review before an entry can be verified) |
| `scripts/gen-audio.ts` | Pre-generates fallback audio from reviewed text |

###### 6.3 Service worker (Workbox) (spec)

| Asset | Strategy |
|---|---|
| App shell, routes, CSS, core JS | Precache |
| `library-index.json` + entry JSONs | Precache; revalidate when `library-version.json` hash changes; activate on next navigation |
| Hindi font subset (≤ 120 KB) | Runtime cache on first Hindi use |
| OCR wasm + language data | Runtime cache **only after** the student taps Scan |
| Audio fallback files | Runtime cache on first Listen |
| `/api/*` | **Network-only, never cached**; failures swallowed into fallbacks |

###### 6.4 Security headers (spec)

Set in the Next.js config / hosting config:

- Strict CSP (hashed inline only), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`.
- `Permissions-Policy` limiting camera and microphone to the scan/voice screens only.
- HTTPS only with HSTS.

---

### Source: `wajah_development_setup_installation_guide.md`

##### 3. Library Linting & Build Scripts

Wajah utilizes a strict build-time linter to enforce safety invariants (e.g., verifying source attributions, checking checked dates, and blocking forbidden phrases like *"you will be paid"*).

* **Run Library Linter:**
  ```bash
  npm run lint:library
  ```
  *This script inspects all JSON files under `content/library/` and fails the build immediately if any safety rule or required field is violated.*

* **Build Bundled Library Index:**
  ```bash
  npm run build-library
  ```
  *Merges individual entry JSONs into a static `library.json` and `library-index.json` for client-side offline matching.*

---

---

## Part 6 — Running the Development Server and Verifying the Application

### Source: `setup2.md`

##### 6. Start the development server

Run:

``` bash
npm run dev
```

Open the local address printed in the terminal (the default Next.js
development address is commonly `http://localhost:3000`).

Keep the terminal running while testing. Stop the server with
`Ctrl + C`.

If the `dev` script is missing, inspect `package.json` and add the
standard Next.js development script appropriate to the selected Next.js
version.

##### 7. Verify the initial application

Before building advanced features, check the following:

-   [ ] The home page loads without a build or runtime error.
-   [ ] The permanent notice reads: **"Independent prototype. Not a
    government service."**
-   [ ] The interface does not use government seals, NSP logos, or
    official-looking branding.
-   [ ] The app can navigate to the guided tap-list route.
-   [ ] English and Hindi message files can be loaded once localisation
    is implemented.
-   [ ] A sample reviewed library entry can be loaded from bundled
    application content.
-   [ ] The local matcher can run without an AI key.
-   [ ] The no-match path is available when no reliable entry is found.
-   [ ] No raw input is printed to the browser console or server logs.
-   [ ] The layout remains usable at a narrow mobile viewport.

A running Next.js starter page is not yet a working Wajah MVP. Complete
the relevant tasks in `tasks.md` and acceptance checks in
`acceptance.md`.

### Source: `setup.md`

##### 8. First run

###### 8.1 Minimum viable first run (proposed order)

1. Create the data files in §5 (empty-but-valid JSON is fine to start).
2. Write **one** entry, for example `content/library/nsp_defective_returned.json`, using the worked example in PRD §13.2. Leave `what_the_screen_says` as a placeholder **only in `draft` status**; it must be real captured wording before `verified`.
3. Run the library tooling:

```bash
npm run lint:library      # must exit 0 (draft entries have relaxed requirements)
npm run build:library     # emits library.json, library-index.json, library-version.json
```

4. Start the dev server:

```bash
npm run dev               # http://localhost:3000
```

5. Check:
   - The independence ribbon shows on `/` and every other route.
   - `/decode/pick` lists your entry from `library-index.json` with **no code change** (R-LIB-03).
   - `/card/nsp_defective_returned` renders the full card, including a **Draft banner** (because the entry is not verified and `DEMO_MODE=true`).
   - Switching to हिन्दी re-renders strings; the portal wording stays original.
   - DevTools → Network → Offline: Home, tap list and the card still load after the first visit.

###### 8.2 Content workflow (spec)

Adding or editing an entry is an ordinary PR:

```
edit content/library/<entry>.json
  → npm run lint:library
  → npm run test:matcher            (confident-and-wrong must not rise)
  → open PR (commit message names the entry ID)
  → peer review (in_review) → external review → Hindi review
  → lead sets status: verified, records reviewed_by + last_verified_on
```

A merge changes the library hash → new `library-version.json` → clients re-cache on the next online visit. **Rollback = revert the PR.**

---

### Source: `wajah_development_setup_installation_guide.md`

##### 4. Running the Development Server

Start the Next.js development server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the Wajah application.

---

---

## Part 7 — Database Setup

### Source: `setup2.md`

##### 9. Optional database setup

**A database is not required for the core Wajah MVP.** The content
library is versioned JSON/TypeScript bundled with the application. The
tap list, local matcher, and fix cards must work without PostgreSQL or a
database connection.

Only configure PostgreSQL if the team is implementing optional anonymous
events, feedback, or no-match review.

When database persistence is approved:

1.  Select a PostgreSQL provider (the companion database specification
    lists Supabase or Neon as options).
2.  Create a separate development database.
3.  Put its connection string in the server-only `DATABASE_URL`
    variable.
4.  Review the SQL migration in `database.md`.
5.  Apply the migration using the chosen provider's documented migration
    workflow.
6.  Confirm that public clients cannot read operational tables directly.
7.  Test retention and deletion rules before accepting real feedback or
    samples.

Do not create user, profile, session, application, payment,
scholarship-document, screenshot, audio, transcript, or decode-history
tables. Never use the database to store raw user messages or grievance
drafts.

### Source: `setup.md`

##### 7. Database setup

###### 7.1 Local options

| Option | When | Notes |
|---|---|---|
| **SQLite** | Quick local/demo **(spec: acceptable for a demo)** | Adapt the check constraints; no `gen_random_uuid()` |
| **Local PostgreSQL** | Closer to production | Use the schema below |
| **Supabase / Neon** | Demo and future production **(spec)** | Set `DATABASE_URL` |

###### 7.2 Schema (spec, with ADR-05 corrections)

```sql
create table match_events (
  event_id      uuid primary key default gen_random_uuid(),
  week_start    date  not null,                         -- Monday; no finer time
  entry_id      text  not null,
  fault_label   text  not null check (fault_label in ('student','institute_officer','bank','unsure')),
  state_code    text  null check (state_code is null or length(state_code) <= 3),
  input_channel text  not null check (input_channel in ('tap','paste','voice','ocr','chat')),
  match_path    text  not null check (match_path in ('tap','local','ai','both','chosen')),
  outcome       text  not null check (outcome in ('matched','chosen','no_match'))
);
create index on match_events (week_start, entry_id);

create table feedback (
  id         uuid primary key default gen_random_uuid(),
  created_on date not null default current_date,
  entry_id   text not null,
  category   text not null check (category in
    ('wrong_meaning','wrong_step','out_of_date','hard_to_understand','translation','other')),
  note       text null check (note is null or length(note) <= 300)
);

create table miss_log (
  id          uuid primary key default gen_random_uuid(),
  created_on  date not null default current_date,
  expires_at  date not null default (current_date + 30),
  text_masked text not null check (length(text_masked) <= 200)
);
```

> The Word spec and PRD show `match_events` **without** `input_channel` and without `both` in `match_path`. Use the version above (ADR-05).

###### 7.3 Roles and retention (spec)

- **Public role: INSERT only** (ADR-11). Reads happen only through a server function that applies minimum-group-size suppression (10). No raw event export.
- **No table may hold** a user ID, IP, device ID, cookie ID, user agent or exact timestamp (R-PRIV-09).
- Retention: `match_events` weekly granularity, 12 months in demo; `feedback` 12 months; `miss_log` **30 days**, deleted nightly:

```sql
delete from miss_log where expires_at < current_date;
```

Schedule this nightly (cron / provider scheduler) and verify it runs (R-PROC-08).

---

---

## Part 8 — AI Setup

### Source: `setup2.md`

##### 10. Optional AI setup

AI is an optional interpretation layer, not a prerequisite for the core
app.

Do not enable AI merely because an API key is available. Before enabling
it, complete all of the following:

-   [ ] Select an AI provider and model after reviewing privacy,
    latency, cost, and availability.
-   [ ] Store the provider key in a server-only environment variable.
-   [ ] Implement client-side sanitisation before any request.
-   [ ] Validate request and response payloads against strict schemas.
-   [ ] Restrict model output to candidate library IDs and permitted
    structured signals.
-   [ ] Validate every returned candidate ID against the current
    reviewed library.
-   [ ] Reconcile AI candidates with local matcher results.
-   [ ] Keep reviewed library content as the only source of displayed
    scholarship advice.
-   [ ] Add rate limiting (recommended starting limit: 20 requests per
    IP per 10 minutes) and an `AI_DAILY_CAP`.
-   [ ] Implement the agreed short timeout and safe fallback. The
    companion architecture uses a strict 3-second target/cap; confirm
    this against the API contract before deployment.
-   [ ] Ensure provider errors, timeouts, and malformed output cannot
    block local results.
-   [ ] Test prompt-injection and sensitive-input cases.
-   [ ] Confirm that request bodies and raw user text are not logged or
    persisted.

Keep AI disabled in local development unless the complete safeguards
above are in place. A mock AI adapter may be used for deterministic
tests without contacting a real provider.

### Source: `setup.md`

##### 9. Running with AI (Phase 4 onward)

###### 9.1 Local, no real model (proposed, matches spec R-TEST-01)

Use a **deterministic mock provider** (fixture map from normalised text → response) so development and CI never call a real model.

```bash
# .env.local
FEATURE_AI_MATCH=true
FEATURE_WHY_LINE=true
AI_PROVIDER_KEY=            # leave empty; mock provider used in local/test
```

###### 9.2 With a real model

```bash
AI_PROVIDER_KEY=<your key>
MATCH_MODEL=claude-haiku-5-5     # or any provider's small model that passes the test set
AI_DAILY_CAP=2000                # use a low cap for previews
```

Server behaviour you are implementing (spec):

| Setting | Value |
|---|---|
| Parameters | temperature 0, `max_tokens` ≈ 150 |
| Timeouts | server → model **8 s**; client wait cap **3 s** (1 s if local is CONFIDENT) |
| Input | sanitised + normalised text ≤ 500 chars in `<input>…</input>` declared DATA |
| Entry list | owned by the **server**, keyed by `library_version`; the client never sends it |
| Rate limit | 20 requests / IP / 10 minutes (IP kept in memory only) |
| Validation | `entry_id` in sent set or `"none"`; `confidence` in [0,1]; `alternatives` ≤ 2; `situation.*` in vocabulary; any failure = "no AI result" |
| Logging | status, route, latency, counters only; **no bodies** |

###### 9.3 Quick API check (proposed)

```bash
curl -s -X POST http://localhost:3000/api/understand \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"text":"mera form dosh purn dikha raha hai","input_kind_hint":"typed","lang_hint":"hi","library_version":"<hash from library-version.json>"}'
```

Expected: a validated JSON body, or a generic error `{ "error": { "code", "message" } }` that never echoes your input. The client treats **every** AI error as "no AI result".

###### 9.4 Prove the fallback works

With `/api/*` blocked (DevTools request blocking on `/api/*`), the whole product must stay usable (R-OFF-06). Order of degradation, never skipped: **AI result → local candidates → no-match → tap list.**

---

---

## Part 9 — Optional Browser Features

### Source: `setup2.md`

##### 11. Optional browser features

###### Voice

Voice input uses the browser's Web Speech API where supported. Check
browser support at runtime, explain any browser speech-service handling
to the user, and always let the user review and edit the transcript
before decoding. Paste and tap-list alternatives must remain available.

###### OCR

OCR should use Tesseract.js on-device, loaded lazily, with English/Hindi
language data as required. Keep OCR behind a feature flag until it has
been tested on target devices. Do not upload screenshots by default.
Discard the image after text extraction and review.

###### PWA and offline behaviour

Configure the service worker using Workbox or compatible Next.js tooling
after the basic application works. Cache only the app shell, static
assets, and approved bundled library content.

Verify that after the first successful load:

-   The tap-list route opens offline.
-   Bundled fix cards and their source metadata remain available.
-   A network or AI failure does not block local decoding.
-   Sensitive user input is not placed in service-worker caches,
    `localStorage`, or persistent browser storage.

---

## Part 10 — Testing and Quality Assurance

### Source: `setup.md`

##### 10. Testing

###### 10.1 Commands

```bash
npm run lint:library
npm run test                # unit: sanitiser, normaliser, scorer, decider, reconciler, why-line, grievance template, lint rules, faultMap
npm run test:matcher        # labelled set; FAILS if confident-and-wrong rises
npm run test:e2e            # Playwright: flows A1–A12, offline, privacy, flag matrix, AIU-T1…T10
npm run test:a11y           # axe on all routes
npm run size                # size-limit budgets
npm run lhci                # Lighthouse CI, Slow 4G profile
```

###### 10.2 What to build into the test setup (spec)

| Layer | Must include |
|---|---|
| Unit (Vitest) | Sanitiser patterns with **positive and negative** samples (synthetic only); "document not clear" never masked; sanitiser runs **before** the normaliser |
| Matcher eval | ≥ **60 labelled rows**; exact wording, Hinglish/typos, **level pairs** (institute vs district/state), noise, multiple statuses, PII, prompt injection, out-of-scope. Start from PRD Appendix B |
| Contract | Zod schemas; malformed AI outputs; validation fallbacks (mock provider) |
| Component | `FixCard` × entries × locales; `FaultChip`; `StepList` ≤ 5; source box |
| E2E (Playwright) | All flows A1–A12; chat set; **offline** (load once → network off); **privacy** (typed marker string absent from share/print/audio/network except AI endpoints/logs); **flag matrix** (each flag off independently) |
| Accessibility | axe on all routes (critical = blocking); manual keyboard; NVDA/TalkBack; contrast ≥ 4.5:1 on all four fault colours |
| Performance | `size-limit` (first-load JS ≤ 150 KB, library ≤ 100 KB, Hindi font ≤ 120 KB); Lighthouse LCP ≤ 2.5 s on Slow 4G |

###### 10.3 Nightly real-model job (spec)

CI never calls a real model. Add a separate **nightly** job that runs the matcher set against the real model to measure accuracy and cost.

###### 10.4 Targets to track (spec, design choices to tune)

Top-1 accuracy ≥ 90% · confident-and-wrong ≤ 2% (aim for 0) · out-of-scope correctly rejected ≥ 90% · local match ≤ 50 ms · time to first next step ≤ 60 s on a mid-range Android.

---

### Source: `wajah_development_setup_installation_guide.md`

##### 5. Running Tests & Quality Assurance

* **Unit & Matcher Tests (Vitest):**
  ```bash
  npm test
  ```
  *Runs test suites for text normalization, variant mapping (`variants.json`), PII sanitization regexes, and the labeled matcher test set.*

* **End-to-End Tests (Playwright):**
  ```bash
  npm run test:e2e
  ```
  *Automates multi-modal capture flows, offline simulation, and state machine verification across viewports.*

* **Accessibility Audit (axe):**
  ```bash
  npm run test:a11y
  ```
  *Validates WCAG 2.1 Level AA compliance across all primary routes.*

---

## Part 11 — CI/CD, Deployment and Operations

### Source: `setup2.md`

##### 13. Preview and production deployment

Vercel, Netlify, or an HTTPS Node.js host are possible deployment
choices. Select one and document its build/runtime requirements; this
guide does not assume a provider has already been chosen.

###### Preview/demo environment

-   Use a separate deployment and separate test credentials.
-   Keep AI disabled unless all safeguards are implemented.
-   If AI is enabled, use a capped test key and daily budget.
-   Use synthetic dashboard data and label it **MOCK DATA**.
-   Do not use real student records for the demo.

###### Production/pilot checklist

-   [ ] Deploy over HTTPS.
-   [ ] Configure production environment variables in the host's secret
    manager.
-   [ ] Confirm no secret is present in client bundles or source
    control.
-   [ ] Verify every shipped library entry and source link; remove or
    label unverified content.
-   [ ] Confirm the independence notice appears on every screen.
-   [ ] Confirm no government logo or implied affiliation is present.
-   [ ] Test sanitisation, local matching, ambiguity, no-match, and AI
    failure paths.
-   [ ] Test the app on mobile and a low-bandwidth connection.
-   [ ] Verify offline tap-list and bundled fix-card behaviour.
-   [ ] Run lint, type checks, unit tests, end-to-end tests, and a
    production build.
-   [ ] Complete accessibility and Hindi-language review.
-   [ ] Confirm logging, retention, rate limits, and rollback
    procedures.
-   [ ] Keep optional features disabled if their safeguards are
    incomplete.

Do not describe a preview or hackathon demo as an official NSP service
or imply that Wajah has been endorsed by a government body.

### Source: `setup.md`

##### 11. CI/CD

###### 11.1 Pipeline (spec)

```
PR → install + audit
   → typecheck + ESLint (import-boundary rules)
   → lint:library + forbidden-phrase lint (library, UI, chat, why, AI templates)
   → unit tests (sanitiser, normaliser, scorer, reconciler, why-line)
   → test:matcher            (FAIL if confident-and-wrong rate rises)
   → component + a11y (axe)
   → build + size-limit + Lighthouse (Slow 4G)
   → Playwright: e2e A1–A12, offline, privacy (no body leaks)
   → deploy preview
   → merge → demo deploy
```

###### 11.2 Blocking release gates (spec)

1. Library lint · 2. Forbidden-phrase lint over library, UI, chat, why, AI templates · 3. Matcher confident-and-wrong must not rise · 4. Size budgets · 5. axe **critical** issues · 6. Privacy e2e · 7. Mock-banner guard test · 8. Mandatory-strings tests.

###### 11.3 Environments (spec)

| Env | `DEMO_MODE` | Library bundle | Dashboard | AI | DB |
|---|---|---|---|---|---|
| Local | true | draft+ | mock | stub / mocked provider | SQLite or local PG |
| Preview (per PR) | true | draft+ | mock | real, low cap | ephemeral |
| Demo | true | draft+ with Draft banner | mock, labelled | real, cap 2000/day | managed PG |
| Production (future) | **false** | **verified only** | disabled until real data + access control | per policy | managed PG, access-controlled |

Demo and production are **separate builds** (R-ARCH-04): the production bundle physically does not contain unverified entries.

---

##### 12. Deploying the demo

1. Create the project on **Vercel / Netlify / any Node host with HTTPS** (spec).
2. Provision a managed Postgres (**Supabase or Neon**), run the schema in §7.2, create an **insert-only** role for the public API, and schedule the nightly `miss_log` purge.
3. Set environment variables on the host: secrets (`AI_PROVIDER_KEY`, `DATABASE_URL`) as runtime server-only variables; `ALLOWED_ORIGIN` to the real origin; flags as build-time variables.
4. Deploy with `DEMO_MODE=true`, `FEATURE_AI_ALWAYS` per your demo plan, and an `AI_DAILY_CAP` appropriate for the event (default 2000).
5. Smoke-test on a real phone: first load → airplane mode → tap list and a card still work.
6. Confirm headers (CSP, nosniff, Referrer-Policy, Permissions-Policy, HSTS) with a header scanner or DevTools.
7. Confirm the **MOCK DATA** banner on every dashboard screen and that the UI refuses to render the panel without it.
8. Keep a **recorded fallback demo** in case of network failure.

**Never** go live as "production" until: entries are `verified` (two reviewers, one external, Hindi reviewed), obligations under India's **Digital Personal Data Protection Act, 2023** are checked with a qualified adviser (this guide is not legal advice), and real-data access control exists (R-PRIV-10, R-DSH-10).

---

##### 13. Operations runbook (spec, R-PROC-08)

| Situation | Action |
|---|---|
| Rotate the AI key | Update `AI_PROVIDER_KEY` in the host's runtime env; redeploy if required |
| AI cost spike | Lower `AI_DAILY_CAP`; consider `FEATURE_AI_ALWAYS=false` |
| Provider outage | Flip the relevant `FEATURE_AI_*` off; the app degrades to local matcher + tap list |
| Cap near/hit | Alert; raise or lower deliberately; students silently fall back to local-only |
| Verify `miss_log` purge | Check the nightly job deleted rows where `expires_at < current_date` |
| Library mistake | Revert the PR; the library hash changes and clients revert on next online visit |
| Stale content | Review the `last_verified_on` age report; re-check official NSP pages before any demo |
| Observability | Redacted logs only (status, route, latency, counters). Never add time-on-page, click, or per-user tracking |

---

---

## Part 12 — Troubleshooting

### Source: `setup2.md`

##### 12. Local development troubleshooting

  -----------------------------------------------------------------------
  Problem                             What to check
  ----------------------------------- -----------------------------------
  `node` or `npm` is not recognised   Install Node.js LTS, reopen the
                                      terminal, and rerun the version
                                      checks

  Dependency installation fails       Check network access, Node
                                      compatibility, and the lockfile;
                                      try `npm ci` for a clean install

  Port 3000 is already in use         Stop the other development server
                                      or use the alternate local URL
                                      printed by Next.js

  Environment changes do not appear   Stop and restart the development
                                      server after editing `.env.local`

  AI route returns unavailable        Confirm AI is intentionally
                                      enabled, server key is configured,
                                      and provider settings are valid;
                                      local matching should still work

  Database connection fails           Confirm the optional database is
                                      configured and `DATABASE_URL` is
                                      server-only; core local decoding
                                      must still work

  Hindi text looks broken             Check UTF-8 source files, the
                                      selected Devanagari-capable font,
                                      and mobile rendering

  Offline page fails                  Check service-worker registration,
                                      cache rules, and that the app was
                                      loaded successfully online first

  Build passes but a feature is       Check feature flags and the
  missing                             task/acceptance documents; a
                                      successful build does not prove
                                      feature completion
  -----------------------------------------------------------------------

Never troubleshoot by pasting real student messages, credentials, OTPs,
Aadhaar numbers, or bank details into logs, issue trackers, or public
chat.

### Source: `setup.md`

##### 14. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| New entry doesn't appear in the tap list | Not rebuilt, or status is excluded from this build mode | Run `npm run build:library`; in production only `verified` entries are bundled; in demo `draft`/`in_review` also appear |
| `lint:library` fails on a draft | A rule applies even to drafts (forbidden phrase, > 5 steps, unique triggers) | Read the printed rule; fix the entry. Verified-only rules (reviewers, official source) don't block drafts |
| Build fails on "forbidden phrase" | A string contains "always", "never", "will be approved", etc. | Rewrite. The words "always" / "never" are only allowed when sourced; don't use them for waits/dates |
| Matcher test fails after adding an entry | Confident-and-wrong rate rose, or two entries share trigger phrases | Make trigger phrases unique; make level words high-weight; re-tune on the labelled set (prefer lowering confident error) |
| Numbers vanish before matching | Normaliser N5 strips digit runs | Expected: the sanitiser must run first so leaked numbers are warned and masked. If real NSP messages hold meaningful numbers, change N5 via its flag (OQ7) |
| AI always returns "no result" | Invalid JSON, ID not in the server's library copy, cap hit, wrong origin | Check `ALLOWED_ORIGIN`, `library_version` matches the build hash, server holds that library version, and `AI_DAILY_CAP` not reached |
| `429` from `/api/*` | Rate limit 20 / IP / 10 min | Expected; the client must not retry |
| Scan button missing | `FEATURE_OCR=false` | Intended; flag off removes only the Scan button |
| Mic button missing | Browser has no SpeechRecognition, or `FEATURE_VOICE_INPUT=false` | Intended; hidden when unsupported |
| Hindi audio missing | No device Hindi voice | Pre-recorded fallback from `gen:audio`; check `public/audio/` |
| Dashboard won't render | `mock: true` with no MOCK DATA banner | Restore the banner; the render guard is deliberate (AIU-T8) |
| Stale content after deploy | Service worker not updated | It polls `library-version.json` online and activates on next navigation; do a hard refresh while testing |
| localStorage blocked | Private mode / policy | Intended fallback: notice shows every visit, consent stays off, language from browser |
| Events not arriving | Consent OFF, offline, or insert failed | Expected: events send only with consent + online; `/api/events` returns 204 even on failure |

---

---

## Part 13 — Checklists, First-Run Sequence and Completion Criteria

### Source: `setup2.md`

##### 14. First-run sequence for a new contributor

Use this order to avoid spending time configuring optional
infrastructure before the core product exists:

1.  Install Node.js LTS, npm, Git, and a code editor.
2.  Clone the repository or scaffold the Next.js App Router project.
3.  Install dependencies with the repository lockfile.
4.  Create `.env.local` from `.env.example`; leave AI and database
    disabled.
5.  Start the development server.
6.  Confirm the app shell and independence notice render.
7.  Add the English/Hindi message files and bundled reviewed library.
8.  Implement sanitisation, normalisation, local matching,
    reconciliation, and no-match behaviour.
9.  Build the tap-list and fix-card journey.
10. Add unit and end-to-end tests; verify offline behaviour.
11. Add optional AI, OCR, voice, database, feedback, or dashboard
    features only when their prerequisites and safeguards are ready.

##### 15. Setup completion criteria

The development environment is ready for core feature work when:

-   The project installs from a clean checkout using its lockfile.
-   The development server starts successfully.
-   Linting, type checking, and the configured test command run.
-   The production build completes.
-   The app shell and independence notice render.
-   AI and database configuration are not required to use the local
    application.
-   No secrets or raw user input are committed or logged.

**This checklist confirms development setup only. It does not certify
that Wajah's scholarship content, matching accuracy, privacy controls,
or production deployment are ready.** Those require their own review and
acceptance checks.

### Source: `setup.md`

##### 15. Setup checklist

**Project**
- [ ] Next.js + TypeScript + Tailwind project created; lockfile committed
- [ ] Repository layout created as in §3.2
- [ ] ESLint import-boundary rules + advice-string scan in place
- [ ] Dependencies added; first-load JS budget checked

**Config**
- [ ] `.env.local` created and git-ignored; no secrets committed
- [ ] Flags set for the current phase profile (§4.3)
- [ ] Security headers configured

**Data and tooling**
- [ ] `forbidden.json` (EN + HI), `allowed-domains.json`, `variants.json`, `situation.json`, `why-templates.json`, locale files created
- [ ] `lint:library` and `build:library` run and exit cleanly
- [ ] First entry visible in the tap list with no code change
- [ ] Service worker registered; offline test passes (load once → network off)

**Data store**
- [ ] Schema applied (with `input_channel` and `both`), insert-only public role, nightly `miss_log` purge scheduled

**Quality**
- [ ] Vitest, Playwright, axe, size-limit and Lighthouse CI configured
- [ ] Mock AI provider in place; nightly real-model matcher job planned
- [ ] CI pipeline matches §11.1; blocking gates enforced

**Honesty and safety (before any demo)**
- [ ] Independence ribbon on every screen
- [ ] No claim of government affiliation or live NSP integration anywhere
- [ ] Checked date and source on every card; Draft banner on non-verified entries
- [ ] MOCK DATA banner on every dashboard screen; say "mock data" aloud
- [ ] Phase 0 questions OQ1–OQ5 answered before any entry is marked `verified`

---

##### 16. Where to go next

| Need | File |
|---|---|
| What to build, in order | `task.md` |
| Why the system is shaped this way | `architecture.md` |
| Full stack choices and budgets | `tech-stack.md` |
| What happens screen to screen | `app-flow.md` |
| What is forbidden / required | `rules.md` |
| Product requirements and library content | `PRD.md` |

---
*End of setup. Independent prototype · Not a government service · NSP facts to be re-verified against live NSP pages before any real use.*

---

## Consolidation record

- Every section of each of the three setup files is included once, in its original internal order.
- Exact-duplicate check: no identical block or instruction sequence was found across files, so nothing was removed. A few single lines (for example `cp .env.example .env.local`, `npm run test:e2e`, `npm run lint:library` and individual `FEATURE_*` settings) occur in more than one file within differently surrounded code blocks and are retained in each place.
