# Technology Stack and Integration Guidance

## 1. Guiding rule

Preserve working technology in the existing Wajah repository. First
inspect package files, backend entry points, database configuration,
deployment and Capacitor setup. This document describes suitable
responsibilities and options, not a mandate to replace the current
stack.

## 2. Frontend and mobile

-   Keep the existing React/UI stack if stable.
-   Reuse existing design system and components.
-   Keep Capacitor for Android if already configured.
-   Ensure API base URL points to a reachable HTTPS backend in
    production.
-   Test keyboard, viewport, upload and navigation behaviour on real
    Android devices.

## 3. Backend

Use the existing backend framework where possible. Keep separate
modules/services for: - Profile. - Document metadata and storage. - OCR
jobs. - Comparison. - Scholarship catalogue. - Eligibility. -
Readiness. - Applications/status. - AI/RAG. - Notifications. -
Administration.

## 4. Database

A relational database such as PostgreSQL is appropriate for structured
profiles, scheme rules, evaluations, requirements and application
records. Use migrations and versioned rule data. Do not introduce a new
database until the existing data model is audited.

## 5. Document storage

Use private object storage compatible with the deployment environment.
Requirements: - Private by default. - Encryption. - Short-lived signed
URLs. - Lifecycle/deletion controls. - Size limits. - Access audit. -
Separate original documents from generated previews.

## 6. OCR options

Potential options include: - PaddleOCR or another
self-hosted/open-source OCR service. - A managed OCR/document processing
provider.

Choose after evaluating Hindi/English accuracy, supported scripts, PDF
handling, cost, latency, privacy terms and deployment complexity. OCR
output must be reviewable.

## 7. AI and RAG

Use the existing Gemini integration if it is stable and configured
securely. Keep provider calls on the backend. Put model access behind an
adapter so the provider can be changed later.

RAG should use reviewed official content, academic-year metadata, source
locators and stale-source handling. AI should explain, not decide
eligibility.

## 8. Background jobs

Use the current platform's job/queue capability for: - OCR. - PDF
processing. - Knowledge indexing. - Deadline checks. - Notifications. -
Reprocessing after parser/model changes.

Jobs must be retry-safe and idempotent.

## 9. Official integrations

Do not assume a public portal has an API because it has a website. For
every integration verify: - Official documentation. -
Permission/terms. - Authentication requirements. - Rate limits. - Data
fields. - Availability and support. - Security and privacy implications.

If no authorised API exists, use official links and student-guided
workflows rather than scraping or automating protected pages.

## 10. Deployment checklist

-   Production API URL configured.
-   HTTPS and CORS configured.
-   Secrets only on server.
-   Database migrations applied.
-   Private object storage configured.
-   OCR worker reachable.
-   Queue and scheduled jobs running.
-   Monitoring and backups configured.
-   Android build uses production API URL.
-   No localhost dependency in production app.

## 11. Cost and fallback

Measure OCR pages, LLM tokens, storage, bandwidth and notification
costs. Add quotas and user-facing errors. When a provider limit is
reached, explain the issue and offer manual guidance; do not fabricate
success.
