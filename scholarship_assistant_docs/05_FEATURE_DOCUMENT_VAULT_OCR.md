# Feature Specification --- Document Vault, OCR and Document Checker

## 1. Purpose

Provide a secure place for students to organise scholarship documents
and run practical checks before using them in an application.

## 2. Supported document categories

Initial configurable categories may include: - Class 10
marksheet/certificate. - Class 12 marksheet/certificate. - Diploma or
degree marksheets. - Income certificate. - Caste/category certificate,
where relevant. - Domicile/residence certificate. - Bonafide/student
certificate. - Admission letter. - Fee receipt. - Bank passbook or
account proof only where required. - Disability certificate where
relevant. - Scheme-specific declarations and certificates.

The list must be configurable. Do not imply that every scheme requires
all categories.

## 3. Upload workflow

1.  Student selects document type or chooses "identify document".
2.  UI explains purpose, data use, supported formats and size limits.
3.  Student uploads a file.
4.  Backend validates MIME signature, file size and safe file structure.
5.  File is stored in private object storage.
6.  Processing job is queued.
7.  OCR extracts text and candidate fields.
8.  Validation and readability checks run.
9.  Student reviews extracted information.
10. Results are saved with provenance and processing version.

## 4. Document processing states

-   `uploaded`
-   `queued`
-   `processing`
-   `partially_processed`
-   `processed`
-   `needs_user_review`
-   `failed`
-   `deleted`

Display a human-readable explanation for every state.

## 5. Automated checks

### File checks

-   Allowed extension and actual file signature.
-   Maximum size.
-   Corrupt or password-protected file handling.
-   Page count and image dimensions.
-   Malware scanning where infrastructure supports it.

### Readability checks

-   Blur/low resolution.
-   Cropping or cut-off edges.
-   Rotation and skew.
-   Low contrast.
-   Missing/blank pages.
-   OCR confidence.

### Content checks

-   Expected document type.
-   Presence of required fields.
-   Date parseability.
-   Certificate number presence where expected.
-   Academic year/passing year extraction.
-   Expiry date only if present and relevant.

### Scheme-specific checks

-   Required file type and size.
-   Required pages or fields.
-   Certificate validity rule.
-   Whether the scheme requires a particular issuing authority or
    format.

Only run checks backed by a known rule. Show the rule/source when
applicable.

## 6. OCR requirements

-   Support relevant scripts and languages for the initial user base,
    including English and Hindi where feasible.
-   Keep original OCR text and structured field extraction separate.
-   Store field-level confidence if available.
-   Preserve page and bounding-box references where supported.
-   Allow manual correction.
-   Treat uncertain extraction as unknown.
-   Do not silently replace source text with AI-generated corrections.

## 7. Document checker result

Each check should return: - Check name. - Result: pass, warning, fail,
unknown, not_applicable. - Explanation. - Evidence (page/field/region if
available). - Rule/source reference. - Suggested next step. - Whether
user confirmation is required.

"Pass" means the configured automated check passed, not that the
document is genuine.

## 8. Security and privacy

-   Private storage only.
-   Short-lived signed download links.
-   Authorisation on every read, update and delete.
-   No public bucket URLs.
-   Encrypt data in transit and at rest.
-   Avoid storing raw OCR text in application logs.
-   Define retention and deletion.
-   Do not send full documents to external AI services by default.
-   If an external processor is used, disclose it and obtain appropriate
    consent.

## 9. Failure handling

-   OCR unavailable: retain upload and offer retry/manual entry.
-   Unsupported document: explain supported types.
-   Low confidence: ask user to review.
-   Corrupt file: ask for a new scan.
-   Timeout: show retry without duplicate uploads.
-   Provider failure: do not show fabricated extraction.

## 10. Acceptance criteria

-   Upload validation rejects unsupported and oversized files.
-   A user cannot access another user's document by changing an ID.
-   OCR uncertainty is visible.
-   Student can correct extracted fields.
-   A processing failure does not lose the original file.
-   Delete operation removes or schedules deletion of file and derived
    data according to policy.
