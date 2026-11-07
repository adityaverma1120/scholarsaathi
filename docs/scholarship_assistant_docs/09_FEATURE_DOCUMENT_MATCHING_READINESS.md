# Feature Specification --- Scholarship Document Matching and Application Readiness

## 1. Purpose

For each scholarship, compare its required document list and application
fields with the student's available profile and document vault.

## 2. Document requirement model

A requirement should include: - Scheme ID and academic year. - Document
category. - Mandatory/optional/conditional status. - Accepted format and
size, if officially specified. - Validity rule, if specified. -
Issuer/authority requirements. - Required pages or fields. - Source
reference. - Last verified date.

## 3. Matching outcomes

-   `AVAILABLE`: a suitable document exists.
-   `MISSING`: no document of the required type exists.
-   `NEEDS_REVIEW`: candidate exists but type, readability or content
    needs review.
-   `POTENTIAL_MISMATCH`: relevant cross-document warning exists.
-   `EXPIRED_OR_OUTDATED`: a verified validity rule indicates it may be
    out of date.
-   `UNKNOWN`: requirement or evidence cannot be evaluated.
-   `NOT_APPLICABLE`: requirement does not apply to this student's case
    under a verified rule.

## 4. Application readiness checklist

Checklist sections: 1. Eligibility conditions. 2. Required documents. 3.
Document quality and validity. 4. Cross-document consistency. 5. Profile
fields required by the application. 6. Official portal and application
window. 7. Final student review.

Do not reduce all readiness to a single percentage if critical unknowns
could be hidden. If a progress indicator is used, display its formula
and outstanding blockers.

## 5. Readiness states

-   `NOT_STARTED`
-   `IN_PROGRESS`
-   `BLOCKED`
-   `READY_FOR_STUDENT_REVIEW`
-   `STUDENT_CONFIRMED_READY`

"Ready" means the configured checklist is complete; it does not mean
official eligibility approval or guaranteed submission success.

## 6. User experience

The student opens a scholarship and sees: - Conditions
matched/unknown/failed. - Required documents with vault status. -
Potential document mismatches. - Missing application fields. - Official
deadline and source. - A clear next action for every issue.

## 7. Acceptance criteria

-   Every required item is linked to the scheme version.
-   Missing documents are not inferred to exist.
-   A document is not treated as valid solely because it is uploaded.
-   Student can replace or exclude a candidate document.
-   Readiness state is reproducible and explainable.
