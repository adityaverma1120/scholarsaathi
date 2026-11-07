# Wajah to ScholarSaathi — Project Renaming and Migration Plan

**Document type:** Implementation specification  
**Current project name:** Wajah  
**Target product name:** ScholarSaathi  
**Status:** Proposed rename  
**Primary instruction:** Rename the existing application in place. Do not rebuild, replace, or redesign the application as part of this task.

---

## 1. Purpose

This document defines how to rename the existing Wajah scholarship-support application to **ScholarSaathi** across its user interface, source code, documentation, configuration, deployment setup, and Android application.

ScholarSaathi is intended to be an overall scholarship helper for students. It should help students discover relevant scholarships, understand eligibility, prepare and check documents, identify inconsistencies across documents, understand application requirements, and get guided support through scholarship-related processes.

The rename must preserve the existing application's working features, data, integrations, architecture, and deployment configuration unless a specific change is required for the new product name.

## 2. Non-negotiable implementation rules

1. **Modify the existing project in place.** Do not create a new project or replace the current application.
2. **Do not rebuild from scratch.** Preserve the current frontend, backend, database, API contracts, authentication, AI/RAG pipeline, OCR implementation, and Capacitor setup.
3. **Do not remove working features.** Existing Wajah functionality must continue to work after the rename.
4. **Do not invent functionality.** A rename task is not permission to implement unbuilt features or display fake functionality.
5. **Do not add demo data, mock statistics, fake verification results, or placeholder scholarship records.**
6. **Do not change secrets or expose environment variables.** Preserve API keys and credentials in their existing secure configuration.
7. **Do not change production URLs, database identifiers, package identifiers, or external resource names without checking dependencies first.**
8. **Keep backward compatibility where needed.** Existing API routes, database tables, stored records, and deployment resources may continue to use the old internal name if changing them creates risk.
9. **Keep the current design language.** Update visible brand references consistently, but do not use the rename as an excuse for an unsolicited redesign.
10. **Test the web application and Android build** after making changes.

## 3. Product identity

Use these brand details consistently unless the project owner supplies updated brand assets.

| Item | Required value |
|---|---|
| Product name | ScholarSaathi |
| Previous name | Wajah |
| Short description | Your all-in-one scholarship assistant |
| Product category | Student scholarship discovery and assistance platform |
| Primary audience | Students applying for government and other scholarships in India |
| Tone | Clear, supportive, trustworthy, accessible, student-friendly |
| Language | Simple English, with existing Hindi support retained |

### Suggested tagline

**Every scholarship. Every document. One trusted companion.**

Alternative short description:

**Find scholarships, check eligibility, prepare documents, and get step-by-step application guidance.**

Do not add claims such as “government approved,” “official partner,” “100% accurate,” or “guaranteed scholarship” unless independently authorized and substantiated.

## 4. Scope of the rename

Audit and update all relevant occurrences of the old product name, including:

### 4.1 User-facing interface

- Application title and browser tab title.
- Header, navigation, sidebar, footer, and dashboard branding.
- Welcome screens, onboarding, login, registration, and profile screens.
- Empty states, loading states, error messages, and success messages.
- Chatbot greeting, assistant identity, and suggested prompts.
- About, Help, FAQ, Contact, and Privacy pages.
- Install prompt and Progressive Web App (PWA) metadata, if present.
- Any user-facing notification, email template, or generated document.
- Image alt text and accessibility labels where they contain the old name.

Replace visible **Wajah** branding with **ScholarSaathi**. Do not blindly replace every occurrence of the word in technical identifiers or historical records.

### 4.2 Frontend source code

Inspect:

- `package.json` and package metadata.
- `index.html` and page metadata.
- App layout and navigation components.
- Constants, configuration files, and branding components.
- Component labels and hard-coded text.
- PWA manifest and service-worker metadata, if present.
- SEO metadata, Open Graph metadata, and social preview text.
- Test fixtures and snapshots that assert the visible product name.

Update user-facing references and safe internal names. Avoid broad global search-and-replace without reviewing each match.

### 4.3 Backend and AI assistant

Inspect:

- Backend application metadata and service names.
- API response messages that identify the application.
- AI system prompts and assistant introduction.
- RAG prompt templates and knowledge-base instructions.
- OCR and document-analysis messages.
- Logging labels and health-check descriptions.
- Email, notification, and report templates.

The AI assistant should introduce itself as ScholarSaathi where appropriate. Preserve the existing grounded-answer rules, source citations, uncertainty handling, and privacy protections. Do not change model providers, prompts unrelated to branding, retrieval logic, or business rules merely because the product name changes.

### 4.4 Documentation

Update the project documentation where appropriate, including:

- `README.md`
- `AGENTS.md`
- Product requirements and feature specifications.
- Architecture and system design documents.
- API and database documentation.
- UX/design documentation.
- Security and privacy documentation.
- Deployment and environment documentation.
- Testing, acceptance criteria, roadmap, and task files.
- Any existing Wajah handbook or master project document.

If a document describes historical decisions, retain the historical context and add a note that Wajah was renamed to ScholarSaathi. Do not rewrite history as if the new name had always been used.

### 4.5 Android / Capacitor application

Inspect the Capacitor Android project and update the visible application name:

- Android app label in `android/app/src/main/AndroidManifest.xml`, resource strings, or the location used by the current project.
- Capacitor application name in `capacitor.config.*`, if configured there.
- Launcher label and relevant user-visible metadata.
- Splash-screen branding and app icons only if the current assets visibly contain the Wajah name.
- Any notification title or Android-specific text containing Wajah.

**Important:** Do not change the Android application ID / package ID automatically. Changing it can make Android treat the renamed app as a different application, prevent normal in-place updates, and affect signing, deep links, Firebase, OAuth, and other integrations. Keep the current application ID unless the project owner explicitly approves a separate package-ID migration after reviewing its consequences.

### 4.6 Hosting, deployment, and external services

Inspect, but do not automatically rename:

- GitHub repository name and remote URL.
- Vercel project name and deployment configuration.
- Backend hosting service/project name.
- Environment variable names.
- API base URLs and custom domains.
- OAuth callback URLs and allowed origins.
- Firebase or other third-party project identifiers.
- Database names, buckets, storage paths, and webhook URLs.

Some of these identifiers may be coupled to external services. Keep them unchanged unless a safe, explicit migration plan is available. A visible brand rename does not require changing the repository name, domain, API URL, or database name.

## 5. Safe replacement policy

Use the following policy when searching for the old name.

| Occurrence | Action |
|---|---|
| Visible product heading “Wajah” | Replace with “ScholarSaathi” |
| Browser title and app label | Replace with “ScholarSaathi” |
| User-facing chatbot identity | Replace with “ScholarSaathi” |
| Documentation describing the current product | Update to “ScholarSaathi” |
| Historical statement about the old product | Retain “Wajah” and explain the rename |
| Git history and commit messages | Do not rewrite |
| Existing database records | Do not mass-update without a migration requirement |
| API route or schema containing `wajah` | Preserve unless a versioned compatibility migration is designed |
| Android application ID | Preserve by default |
| Environment variable names | Preserve unless a controlled migration is necessary |
| Repository and hosting identifiers | Inspect; do not change automatically |
| Internal folder names | Change only if safe and useful; update every reference if changed |

Before editing, run a case-insensitive search for `wajah`, `Wajah`, and related branding strings. Review each result and classify it as user-facing, documentation, internal identifier, historical reference, or external dependency.

## 6. Suggested user-facing brand copy

Use consistent copy rather than inventing different descriptions on every screen.

**Application name:** ScholarSaathi

**Dashboard welcome:**
> Welcome to ScholarSaathi

**Dashboard subtitle:**
> Your companion for discovering scholarships, checking eligibility, and getting your documents ready.

**Assistant greeting:**
> Hi! I'm the ScholarSaathi assistant. I can help you understand scholarship requirements, check your eligibility, review document information, and find the next steps.

**About description:**
> ScholarSaathi helps students navigate scholarship opportunities and application requirements through clear guidance, document assistance, and eligibility information.

**Trust disclaimer:**
> ScholarSaathi is an independent student-support platform. It is not an official government website and is not affiliated with the National Scholarship Portal or any government department. Always confirm final requirements and submit applications through the relevant official portal.

Use the disclaimer in an appropriate location, such as About, footer, or onboarding. Do not imply that ScholarSaathi can officially approve, authenticate, or verify a document.

## 7. Relationship between the rename and new features

This document covers the rename only. The broader ScholarSaathi feature roadmap should be implemented separately using the relevant feature specifications.

The intended product direction may include:

1. Student profile and academic information.
2. Scholarship discovery and matching.
3. Eligibility assessment.
4. Document vault and OCR extraction.
5. Required-document checklist.
6. Cross-document consistency checking.
7. Document quality and completeness checks.
8. Application guidance and form-filling assistance.
9. Scholarship application status guidance.
10. AI scholarship assistant with official-source-grounded answers.
11. Deadline reminders and application calendar.
12. Grievance and support guidance.

Do not display these features as available merely because they are listed here. For each feature, inspect the existing code and classify it as **implemented**, **partially implemented**, **planned**, or **not implemented**. Build them only under a separately approved implementation plan.

## 8. Implementation workflow

### Phase 1 — Audit and baseline

Before editing:

1. Inspect the repository structure and identify frontend, backend, database, AI, OCR, and Android modules.
2. Read the current project instructions and documentation.
3. Identify every occurrence of Wajah and classify it using Section 5.
4. Record the current application ID, API routes, deployment URLs, environment variable names, and external integrations.
5. Run the existing test suite and production build, if available.
6. Record pre-existing failures separately so they are not incorrectly attributed to the rename.

**Deliverable:** A concise rename audit listing files to change, files to preserve, and risks.

### Phase 2 — Rename visible branding

1. Update the application name and visible branding.
2. Update browser and PWA metadata.
3. Update user-facing chatbot identity and messages.
4. Update Android app label and visible Android metadata.
5. Update existing brand assets only where the old name is visibly embedded.
6. Preserve existing layout, functionality, and design system.

### Phase 3 — Update documentation

1. Update current product references to ScholarSaathi.
2. Preserve historical references to Wajah where meaningful.
3. Add a short rename note to the main README or project history.
4. Do not change technical specifications that are unrelated to branding.

### Phase 4 — Validate integrations

1. Confirm frontend-to-backend requests still work.
2. Confirm API routes and CORS configuration remain unchanged.
3. Confirm AI assistant and RAG responses still work.
4. Confirm OCR upload and extraction still work.
5. Confirm authentication and database access still work, if present.
6. Confirm deployment configuration and environment variables are unchanged.
7. Confirm Android Capacitor configuration still builds and launches.

### Phase 5 — Build and test

Run the commands appropriate to the existing project. Do not assume scripts that are not present in `package.json`.

For a typical Vite/Capacitor project, the commands may be:

```powershell
npm install
npm run build
npx cap sync android
```

Then build the Android debug APK using the existing Gradle wrapper:

```powershell
cd android
.\gradlew.bat assembleDebug
```

If the project uses a different build process, follow its actual configuration instead.

### Phase 6 — Report

Provide a completion report containing:

- Files changed.
- Visible branding locations updated.
- Android app label result.
- Whether the application ID was preserved.
- Tests and builds actually run.
- Test failures, including pre-existing failures.
- Integrations checked.
- Any remaining Wajah references and why they were retained.
- Manual actions still required in GitHub, Vercel, hosting providers, app stores, or other external dashboards.

Do not claim a test passed unless it was actually run and passed.

## 9. Acceptance criteria

The rename is complete only when all applicable criteria pass:

- [ ] The application consistently displays “ScholarSaathi” as its product name.
- [ ] No unintended Wajah branding remains in user-facing screens.
- [ ] Browser tab title and metadata use ScholarSaathi.
- [ ] PWA metadata uses ScholarSaathi, if the project has a PWA manifest.
- [ ] Chatbot identity and user-facing messages use ScholarSaathi.
- [ ] Android launcher label uses ScholarSaathi.
- [ ] Existing Android application ID is preserved unless explicitly approved otherwise.
- [ ] Existing routes, database structures, and environment variable names remain compatible.
- [ ] Existing login and profile flows still work, if present.
- [ ] Existing AI/RAG functionality still works.
- [ ] Existing OCR/document upload flow still works.
- [ ] Existing scholarship/status features still work.
- [ ] Mobile layout remains usable.
- [ ] No fake features, demo statistics, or unsupported official claims were introduced.
- [ ] Documentation accurately describes the renamed product and its actual implementation status.
- [ ] Production frontend build succeeds, or any failure is clearly reported.
- [ ] Android debug build succeeds, or any failure is clearly reported.

## 10. Rollback plan

Before changes:

1. Confirm the working tree is clean, or safely preserve existing uncommitted work.
2. Create a Git branch such as `rename/wajah-to-scholarsaathi`.
3. Record the current commit hash.
4. Do not delete old assets or configuration until the new build is verified.

If the rename causes a regression:

1. Identify the specific changed file or configuration.
2. Revert only the unsafe change where possible.
3. Restore the previous branding/configuration from Git if necessary.
4. Re-run the relevant tests.
5. Do not reset or discard unrelated user work.

## 11. Ready-to-use instruction for Antigravity

Use this instruction when asking Antigravity to perform the rename:

> Read this entire `RENAMING_WAJAH_TO_SCHOLARSAATHI.md` document before making changes.
>
> Rename the existing Wajah application to ScholarSaathi in place. First audit the repository and report the files and external dependencies that contain the old name. Then implement the safe user-facing and documentation changes described in this document.
>
> Do not rebuild the application from scratch, create a second project, replace the current architecture, or redesign the UI. Preserve all existing working functionality, backend APIs, database structures, authentication, AI/RAG pipeline, OCR flow, environment variables, deployment configuration, and Capacitor setup.
>
> Do not automatically change the Android application ID, API routes, database identifiers, repository URL, hosting project identifiers, custom domains, or secrets. Flag any external changes that require my approval.
>
> Do not implement the future features listed in Section 7 as part of this rename. Do not add mock data or claim that planned features already exist.
>
> After editing, run the available tests and builds, inspect the web and Android branding, search again for remaining Wajah references, and provide the completion report required by Phase 6. Be transparent about anything you could not test.
