# Known Limitations, Risks and Open Decisions

## 1. Documented assumptions

-   The existing Wajah application is to be extended, not replaced.
-   The final product name is not yet approved.
-   The current technology stack must be discovered from the repository.
-   NSP and selected Uttar Pradesh schemes are the proposed initial
    coverage.
-   Existing Gemini/RAG functionality may be reused only after audit.
-   The availability of official APIs differs by portal and must be
    verified individually.

## 2. Key risks

### Incorrect or outdated scholarship rules

Mitigation: official source hierarchy, academic-year versioning, human
review, expiry and re-verification workflow.

### OCR errors

Mitigation: confidence-aware extraction, user review, source image
reference and unknown state.

### False cross-document warnings

Mitigation: conservative normalisation, field-specific rules, user
explanation and no fraud labels.

### False document authenticity claims

Mitigation: separate automated checks from official verification.

### Sensitive data exposure

Mitigation: minimisation, encryption, private storage, owner checks,
redacted logs, deletion and privacy review.

### AI hallucinations

Mitigation: RAG with approved sources, citations, deterministic rule
engine and abstention.

### Portal automation breakage or policy violations

Mitigation: begin with guided form assistance; use only permitted
integrations and stop at security controls.

### Incomplete nationwide coverage

Mitigation: publish explicit coverage boundaries and add schemes only
with verified source records.

### Provider outage/cost

Mitigation: adapters, quotas, retries, manual fallback and transparent
error states.

### Misleading readiness/eligibility claims

Mitigation: explain what a result means and distinguish preliminary
matching from official approval.

## 3. Open decisions

-   Final product name and logo.
-   Whether user accounts are required for first release.
-   Exact database and object storage provider.
-   OCR provider and Hindi accuracy target.
-   Gemini model/provider configuration and data handling.
-   Authentication and account recovery.
-   Data retention periods.
-   Whether to store any application identifiers.
-   Exact initial scholarship list.
-   Who reviews and approves scholarship rules.
-   Whether notifications are in first release.
-   Whether any official portal integrations are authorised.
-   Legal/privacy review requirements before public launch.

## 4. Risks that block launch

Do not launch document upload publicly until access control, private
storage, retention and deletion are implemented and tested.

Do not launch eligibility matching until the published scheme rules have
official sources, academic-year validity and review approval.

Do not advertise document verification as authentication unless an
authorised issuing-authority verification mechanism exists.

Do not advertise automatic application submission unless a permitted,
tested integration exists and explicit user approval is built in.

## 5. Honest public claims

Acceptable: - "Checks uploaded files for readability and selected
information." - "Flags possible differences across documents." -
"Matches your profile against published scholarship conditions." -
"Provides preliminary guidance and links to official sources."

Not acceptable without evidence: - "Verifies every certificate as
genuine." - "Finds every scholarship in India." - "Guarantees
eligibility." - "Automatically submits all scholarship applications." -
"Tracks every government portal live."
