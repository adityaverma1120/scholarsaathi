# Product Requirements Document (PRD)

## 1. Document purpose

This PRD defines the proposed scholarship lifecycle assistant. It must
be reconciled with the existing Wajah codebase before implementation.
Requirements are planned unless marked implemented by a repository
audit.

## 2. Product summary

A mobile-first web and Android-compatible platform that uses a
student-controlled profile, document intelligence, a verified
scholarship catalogue and a deterministic eligibility engine to help
students prepare scholarship applications.

## 3. Goals

-   Reduce confusion in scholarship discovery and application
    preparation.
-   Reuse profile information instead of repeated manual entry.
-   Identify missing, unreadable or potentially inconsistent documents.
-   Explain eligibility matches and failures using published rules.
-   Guide students to official application and grievance resources.
-   Preserve user control over data and portal actions.

## 4. Non-goals for initial release

-   Guaranteed eligibility or scholarship approval.
-   Automatic submission to government portals.
-   Bypassing CAPTCHA, OTP, login, access controls or rate limits.
-   Universal authenticity detection for every certificate.
-   Unverified live status integration with every portal.
-   Nationwide coverage of every public and private scholarship.
-   Financial, legal or official government determinations.

## 5. Personas and jobs-to-be-done

### Student applicant

"I want to know which scholarships may fit my circumstances and what I
need before I apply."

### Renewal applicant

"I want to know whether I satisfy renewal conditions and whether my
documents are still valid."

### Student with a document issue

"I want to identify possible mistakes across my documents before
submitting them."

### Student with an application problem

"I want to understand my status and the official next step."

### Scheme administrator/reviewer

"I need to add or update scholarship rules with sources, academic-year
validity and an auditable review process."

## 6. Main user journey

1.  Student visits the platform and sees its independent status and
    privacy explanation.
2.  Student creates or opens a profile.
3.  Student enters only relevant profile information.
4.  Student uploads selected documents and grants processing consent.
5.  System scans documents, extracts fields and displays
    confidence/uncertainty.
6.  Student reviews and corrects extracted data.
7.  System checks document readability and compares selected fields
    across documents.
8.  Student requests scholarship discovery.
9.  Catalogue filters relevant schemes and eligibility engine evaluates
    structured criteria.
10. Results show potentially eligible, needs information, not eligible
    or unverified.
11. Student opens a scheme and reviews official source, conditions,
    deadline and benefits.
12. System generates a scheme-specific document checklist.
13. Student uses guided application assistance and reviews all values.
14. Student applies on the official portal themselves.
15. Student records or imports status information where supported.
16. System explains the status and suggests verified next steps.

## 7. Functional scope

### P0 --- first usable release

-   Profile creation, edit, consent and deletion.
-   Private document upload and access control.
-   OCR for a limited set of document types.
-   Human review/correction of extracted fields.
-   Readability and file validation.
-   Basic cross-document comparison for selected fields.
-   Curated scholarship catalogue with official sources.
-   Eligibility rule engine with unknown-condition handling.
-   Scholarship-specific document checklist.
-   Clear result explanations and official links.
-   Basic administration and audit trail for scheme changes.

### P1 --- next release

-   More document types and state schemes.
-   Application readiness checklist.
-   Guided form field preparation.
-   Existing NSP status explanation integration.
-   Renewal conditions and history.
-   Hindi and additional language improvements.
-   Notifications for verified dates.

### P2 --- advanced

-   Approved official verification integrations.
-   Portal-specific assisted navigation where permitted.
-   More states and institutional/private schemes.
-   Secure integrations with document wallets or identity providers if
    formally supported.
-   Expanded analytics and institution support workflows.

## 8. Non-functional requirements

-   Responsive mobile-first interface.
-   Accessible controls, labels, focus order and error messages.
-   Secure transport and encrypted storage.
-   Server-side authorisation on every document operation.
-   Rate limits and upload size/type limits.
-   Observable failures with privacy-safe logs.
-   Graceful handling of OCR and AI provider outages.
-   No secrets in frontend bundles.
-   Data deletion and retention controls.
-   Backups and tested recovery procedures.
-   Performance targets to be established after measuring the current
    deployment and expected file sizes.

## 9. User-visible result language

Use: - "Potentially eligible based on the rules we have verified." -
"More information is needed." - "One or more published conditions do not
match." - "We could not verify this rule or document." - "Official
verification was not available."

Avoid: - "You are 100% eligible." - "Your certificate is genuine" based
only on image analysis. - "Your scholarship is guaranteed." - "Your
application is approved" unless the official source explicitly confirms
it.

## 10. Dependencies

-   Official scheme source material and a review process.
-   Secure file storage.
-   OCR service or library.
-   Database and backend APIs.
-   Existing AI provider integration, if retained.
-   Privacy notice, consent text and retention policy.
-   Test documents that are synthetic or explicitly authorised.

## 11. Release acceptance

A release is not ready merely because screens exist. It must pass the
acceptance criteria in `21_TESTING_AND_ACCEPTANCE.md`, including source
traceability, unknown eligibility conditions, file access control, user
review and no-fabrication checks.
