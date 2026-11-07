# System Functional Requirements

## 1. Identity, profile and consent

-   FR-001: The system shall allow a student to create and edit a
    profile.
-   FR-002: The system shall separate required, optional and
    scheme-dependent fields.
-   FR-003: The system shall explain why a sensitive or potentially
    sensitive field is requested.
-   FR-004: The system shall record consent for document processing and
    optional AI processing separately where appropriate.
-   FR-005: The system shall allow a student to withdraw optional
    consent and request data deletion.
-   FR-006: The system shall not request portal passwords, OTPs or
    unnecessary identity/bank data.

## 2. Document intake

-   FR-010: The system shall accept only configured file types and
    sizes.
-   FR-011: The system shall validate file signatures, not rely only on
    filename extensions.
-   FR-012: The system shall store uploaded files in private storage.
-   FR-013: The system shall associate each file with its owner,
    purpose, upload time and processing state.
-   FR-014: The system shall scan or safely process files before
    parsing.
-   FR-015: The system shall show processing, success, partial success
    and failure states.

## 3. OCR and extraction

-   FR-020: The system shall identify or allow the user to select a
    document type.
-   FR-021: The system shall extract text and configured structured
    fields.
-   FR-022: The system shall preserve page/region provenance where the
    OCR provider supports it.
-   FR-023: The system shall store confidence or uncertainty per
    extracted field where available.
-   FR-024: The student shall be able to correct extracted values.
-   FR-025: The system shall distinguish "not found" from "could not
    read".
-   FR-026: The system shall not infer a missing value and silently
    treat it as extracted.

## 4. Document checks

-   FR-030: The system shall check readability and completeness using
    document-specific rules.
-   FR-031: The system shall check file format and size requirements for
    a selected scheme where published.
-   FR-032: The system shall check certificate expiry only when an
    authoritative validity rule/date is known.
-   FR-033: The system shall label checks as automated checks,
    user-confirmed checks or official verification.
-   FR-034: The system shall not claim authenticity from OCR or visual
    inspection alone.

## 5. Cross-document comparison

-   FR-040: The system shall compare configured fields across
    user-selected documents.
-   FR-041: The system shall normalise whitespace, case and safe
    punctuation for comparison.
-   FR-042: The system shall preserve original extracted values and
    display normalised comparison values.
-   FR-043: The system shall distinguish exact match, likely match,
    possible mismatch, significant mismatch and not comparable.
-   FR-044: The system shall allow the student to mark a discrepancy as
    explained or requiring correction.
-   FR-045: The system shall not alter source documents or overwrite
    extracted source values without an audit trail.

## 6. Scholarship catalogue and eligibility

-   FR-050: Each published scholarship shall have a provider, academic
    year, official source and review status.
-   FR-051: Each eligibility condition shall be represented in
    structured form.
-   FR-052: The rule engine shall evaluate pass, fail and unknown
    outcomes.
-   FR-053: Any failed mandatory condition shall prevent a "potentially
    eligible" outcome.
-   FR-054: Any unknown mandatory condition shall prevent a definitive
    match.
-   FR-055: Incomplete or stale scheme data shall be labelled
    unverified.
-   FR-056: Each result shall include condition-level reasons and source
    references.
-   FR-057: The system shall distinguish eligibility matching from
    application availability and official approval.

## 7. Document matching and application preparation

-   FR-060: The system shall map required documents to available student
    documents.
-   FR-061: The system shall identify missing, unreadable, potentially
    inconsistent and expired documents.
-   FR-062: The system shall create a scheme-specific checklist.
-   FR-063: The system shall map known profile fields to application
    field guidance.
-   FR-064: The student shall review and confirm all prepared values.
-   FR-065: The system shall not submit an application without explicit
    user action and an authorised integration.

## 8. Status and AI help

-   FR-070: The system shall support manual status entry or screenshot
    interpretation where implemented.
-   FR-071: The system shall explain statuses only from verified portal
    guidance.
-   FR-072: The AI assistant shall retrieve relevant sources and show
    citations/links.
-   FR-073: The AI assistant shall state when the source library does
    not support an answer.
-   FR-074: AI output shall not override structured eligibility
    decisions.
-   FR-075: The system shall provide grievance drafts with editable
    placeholders and official routing sources.

## 9. Notifications and administration

-   FR-080: Notifications shall be based on verified dates or
    user-selected reminders.
-   FR-081: The system shall identify the academic year and source
    verification date in alerts.
-   FR-082: Scheme administrators shall create, review, approve,
    publish, archive and supersede scheme records.
-   FR-083: Scheme changes shall be auditable.
-   FR-084: Only authorised roles may publish scheme data or access
    administrative records.

## 10. Cross-cutting requirements

-   FR-090: Every document and profile endpoint shall enforce
    owner-level access.
-   FR-091: Sensitive data shall be excluded from routine application
    logs.
-   FR-092: The system shall provide a clear deletion/retention process.
-   FR-093: Errors shall be understandable and shall not expose stack
    traces or secrets.
-   FR-094: The system shall support keyboard navigation and accessible
    form validation.
