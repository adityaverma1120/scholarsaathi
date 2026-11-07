# Testing Strategy and Acceptance Criteria

## 1. Test layers

-   Unit tests for normalisation, rules and field validators.
-   Integration tests for APIs, database and object storage.
-   Contract tests for OCR/LLM provider adapters.
-   End-to-end tests for student journeys.
-   Security tests for ownership, uploads and deletion.
-   Accessibility tests.
-   Android device/emulator tests.
-   Human review of OCR and AI answers using authorised test documents.

## 2. Test data

Use synthetic or explicitly authorised test records. Do not use real
student documents in public demos or unprotected test environments. Keep
test fixtures separate from production data.

## 3. Eligibility tests

Test: - All mandatory rules pass. - One mandatory rule fails. - One
mandatory field is missing. - OCR field confidence is low. - Scheme rule
is unverified. - Academic year does not match. - Income period is
incompatible. - CGPA conversion rule is missing. - Institution identity
cannot be confirmed. - Conflicting profile and document values. -
Multiple-scheme restriction exists. - Scheme is closed or archived.

Expected outcomes must be explainable and repeatable.

## 4. Document tests

Test: - Valid PDF/JPEG/PNG as configured. - Wrong extension and file
signature. - Oversized file. - Corrupt/password-protected PDF. - Blurry,
rotated and cropped image. - Hindi and English documents. - Multi-page
document. - Missing field. - Low OCR confidence. - OCR provider
timeout. - Duplicate upload. - Delete and reprocess.

## 5. Cross-document tests

Test: - Exact match. - Whitespace/case variation. - Hindi/English
transliteration. - Abbreviated parent name. - Date format variation. -
Actual date mismatch. - OCR misread. - Missing value. - Different
document types with non-comparable fields. - User explanation and
correction.

## 6. Security tests

-   User A cannot read User B's document by changing IDs.
-   Expired signed URLs fail.
-   Public bucket access is disabled.
-   Upload parser is hardened.
-   Secrets do not appear in frontend bundle or logs.
-   AI prompt injection in source documents is ignored.
-   Deletion removes original and derived content per policy.
-   Admin-only routes reject student users.

## 7. AI evaluation

Create a verified question set and measure: - Source relevance. -
Citation correctness. - Unsupported claim rate. - Correct handling of
unknowns. - Rule explanation fidelity. - Hindi meaning preservation. -
Prompt injection resistance. - Provider outage behaviour.

## 8. End-to-end scenarios

### Scenario A: Student discovers scholarships

Create profile -\> discover schemes -\> evaluate rules -\> view sources
-\> compare results.

### Scenario B: Student checks documents

Upload marksheets and certificate -\> OCR -\> review extracted fields
-\> see readability checks.

### Scenario C: Cross-document discrepancy

Upload documents with differing dates of birth -\> see warning with
evidence -\> understand legitimate correction route.

### Scenario D: Application readiness

Choose scheme -\> map required documents -\> identify missing item -\>
complete checklist.

### Scenario E: Application status

Enter status or upload screenshot -\> interpret using portal-specific
source -\> receive next-step guidance.

## 9. Release acceptance checklist

-   [ ] No fabricated scholarship records or statistics.
-   [ ] Published schemes have official source and academic-year
    validity.
-   [ ] Eligibility engine uses PASS/FAIL/UNKNOWN.
-   [ ] AI cannot override eligibility result.
-   [ ] Missing fields do not pass.
-   [ ] Document access is owner-protected.
-   [ ] OCR uncertainty is visible.
-   [ ] Cross-document warnings are not labelled fraud.
-   [ ] No false authenticity claim.
-   [ ] Student reviews form values.
-   [ ] No CAPTCHA/OTP/security bypass.
-   [ ] Official links and deadlines are checked.
-   [ ] Privacy notice and deletion workflow are present.
-   [ ] Main flows work on mobile and Android.
-   [ ] Tests and build pass.
-   [ ] Known limitations are disclosed.
