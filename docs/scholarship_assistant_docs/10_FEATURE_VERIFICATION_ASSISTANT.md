# Feature Specification --- Document Verification Assistant

## 1. Purpose and terminology

Provide layered document checks while avoiding unsupported claims of
authenticity.

Use four distinct concepts: 1. **File validation:** Is the file
readable, supported and structurally safe? 2. **Content extraction:**
What text and fields can be read? 3. **Consistency checks:** Do selected
values appear consistent with other documents or known rules? 4.
**Official verification:** Has the issuing authority or an authorised
verification service confirmed the certificate?

These are not interchangeable.

## 2. Possible automated checks

-   OCR and expected field presence.
-   QR code/barcode detection.
-   Digital signature presence/validation where supported.
-   Certificate number format checks against a documented specification.
-   Date and expiry checks.
-   Document template/version checks only where reliable official
    templates exist.
-   Image quality and possible tampering indicators as non-conclusive
    warnings.

## 3. Official verification

Only claim official verification when: - An issuer-provided public
verification service or authorised API exists. - The integration is
permitted and documented. - The response is securely retrieved and
traceable. - The result and time are recorded. - The system handles
unavailable or ambiguous responses.

If no official verification mechanism exists, say so.

## 4. Result labels

-   File valid.
-   Text extracted.
-   Required fields detected.
-   Potential issue detected.
-   Official verification available / unavailable.
-   Official verification successful / unsuccessful / inconclusive, only
    when returned by the authorised source.

Avoid "100% genuine", "fake certificate" or "fraud confirmed" based on
AI image analysis.

## 5. Human review and escalation

If a concern appears: - Explain the specific signal. - Show the relevant
field/region if possible. - Ask the student to compare against the
original. - Link to the issuing authority's official
correction/verification route. - Provide a safe way to report a false
positive.

## 6. Acceptance criteria

-   Automated and official verification labels are separate.
-   No AI-only authenticity claim is displayed.
-   Verification result includes authority, timestamp and reference
    where permitted.
-   Inconclusive responses remain inconclusive.
-   Students are not automatically disqualified based on a heuristic.
