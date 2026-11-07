# Security, Privacy and Data Governance

## 1. Scope

The platform may process educational records and personal information,
including information that can be sensitive. Security and privacy are
foundational requirements, not optional later enhancements.

Obtain appropriate legal/privacy review for applicable Indian laws,
rules and platform obligations before public launch. This document is
engineering guidance, not legal advice.

## 2. Data minimisation

-   Ask only for information needed for a specific function or scheme.
-   Prefer progressive collection.
-   Do not request passwords or OTPs.
-   Avoid collecting Aadhaar, bank account numbers or identity documents
    unless necessary for a clearly explained, verified workflow.
-   Do not collect category, disability or other sensitive information
    unless a relevant scheme requires it.
-   Do not use student documents to train models unless there is a
    separately reviewed lawful basis and explicit consent.

## 3. Consent

Provide separate, understandable notices for: - Account/profile
processing. - Document storage. - OCR/extraction. - External AI
processing. - Notifications. - Optional analytics.

Record notice version, purpose, choice and timestamp. Withdrawal must
stop optional processing where technically and legally applicable.

## 4. Storage and encryption

-   HTTPS/TLS in transit.
-   Encryption at rest for database and object storage.
-   Private buckets/containers.
-   Short-lived signed access URLs.
-   Server-side ownership checks.
-   Secrets stored in backend secret manager/environment, never frontend
    code.
-   Backups encrypted and access-controlled.

## 5. Access control

-   Least privilege.
-   Student can access only their own profile and documents.
-   Admin roles separated from student roles.
-   Scheme publishers/reviewers have narrowly scoped permissions.
-   MFA for privileged admin access where supported.
-   Audit administrative changes.
-   Do not expose direct object-storage keys.

## 6. Upload security

-   Validate file signature and size.
-   Restrict file types.
-   Scan for malware where available.
-   Parse in isolated workers.
-   Protect against malformed PDFs, decompression bombs and parser
    vulnerabilities.
-   Avoid executing embedded content.
-   Rate-limit uploads.
-   Keep original file immutable after upload.

## 7. AI and third-party processing

-   Send only the minimum necessary extracted fields or excerpts.
-   Disclose external processors.
-   Do not include secrets or full identity numbers in prompts.
-   Treat documents and retrieved text as untrusted input.
-   Defend against prompt injection.
-   Ensure AI cannot call privileged tools or alter eligibility records.
-   Review provider retention, region and data-use terms.

## 8. Logging and monitoring

Never log: - Full document contents. - Full identity numbers. - Bank
account details. - Passwords or OTPs. - Authentication tokens. - Full
OCR payloads unless securely retained for a justified operational
purpose.

Use redacted identifiers and structured error codes. Restrict log access
and retention.

## 9. Retention and deletion

Define and disclose: - How long originals are stored. - How long
extracted data is retained. - What happens when an account is deleted. -
Backup deletion/expiry timelines. - Any minimal audit records that must
be retained. - How users request export or deletion.

Delete derived OCR fields, embeddings and cached copies when required by
the deletion policy.

## 10. Student safety and trust

-   No guarantee of scholarship approval.
-   No fees or payment collection unless explicitly part of a separately
    authorised model.
-   Warn about fake scholarship links and requests for money.
-   Link to official sources.
-   Avoid discriminatory profiling or ranking.
-   Do not infer protected attributes from names, photographs or
    location.

## 11. Security testing

-   Authentication and authorisation tests.
-   IDOR tests for document and profile IDs.
-   Upload abuse and parser tests.
-   Rate-limit tests.
-   Secret scanning.
-   Dependency scanning.
-   Prompt-injection tests.
-   Data deletion verification.
-   Backup restore drills.
