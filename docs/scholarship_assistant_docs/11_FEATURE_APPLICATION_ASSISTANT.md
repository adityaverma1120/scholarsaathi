# Feature Specification --- Scholarship Form-Filling and Application Assistant

## 1. Purpose

Help students understand application fields and prepare accurate
information for official scholarship forms while keeping the student in
control.

## 2. Delivery stages

### Stage A --- guided form assistant (recommended first)

-   Show the official portal link.
-   Explain each field in simple language.
-   Retrieve candidate values from the student profile.
-   Show source/provenance for each value.
-   Let the student copy values or enter them manually.
-   Explain accepted formats using official guidance.
-   Flag missing or conflicting information.

### Stage B --- form preparation workspace

-   Map profile fields to a known portal form schema.
-   Generate a reviewable draft.
-   Highlight values that are user-entered, OCR-extracted or unverified.
-   Provide a field-by-field checklist.
-   Let the student approve each value.

### Stage C --- assisted browser interaction (only if permitted)

-   Use supported, authorised interfaces or user-visible browser
    assistance.
-   Require explicit consent before interacting with a portal.
-   Stop at authentication, CAPTCHA, OTP or sensitive confirmation
    steps.
-   Never bypass access controls, bot protections or rate limits.
-   Require the student to inspect and submit the final form themselves
    unless an authorised integration explicitly supports a different
    flow.

## 3. Field mapping

A mapping record should contain: - Portal and scheme. - Academic
year/version. - Portal field identifier and label. - Student profile
source field. - Format/validation rule. - Whether field is mandatory. -
Source/instruction reference. - Mapping verification date.

Portal forms change. A mapping must be versioned and revalidated after
portal updates.

## 4. Safe form preparation

-   Do not invent missing values.
-   Do not auto-select category, institution or bank values based on
    guesses.
-   Show conflicts between profile and documents.
-   Require student confirmation of each high-impact field.
-   Never store portal passwords or OTPs.
-   Avoid retaining a full form draft longer than needed.

## 5. Final review checklist

Before the student leaves for submission: - Confirm scheme and academic
year. - Confirm student identity fields. - Confirm course and
institution. - Confirm income/category/domicile values where relevant. -
Confirm uploaded documents. - Confirm declarations and consent. -
Confirm that the student has read official instructions. - Remind
student to save official acknowledgement/receipt after submission.

## 6. Acceptance criteria

-   Every prepared value has a source or is marked missing.
-   Student can edit every suggested value.
-   Conflicts block silent autofill.
-   No portal submission occurs without explicit student action.
-   CAPTCHA/OTP/authentication are not bypassed.
-   Portal mapping is versioned and has an owner/review date.
