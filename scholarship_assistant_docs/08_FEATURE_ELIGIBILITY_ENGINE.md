# Feature Specification --- Deterministic Scholarship Eligibility Engine

## 1. Purpose

Evaluate a student profile against structured scholarship rules and
return transparent, explainable outcomes.

## 2. Core principle

The rule engine determines whether recorded conditions pass, fail or
remain unknown. Generative AI may explain the result but must not make
or override the decision.

## 3. Condition model

Each condition should contain: - Stable condition ID. - Field or
expression being evaluated. - Operator. - Expected value or allowed
values. - Mandatory/optional flag. - Effective academic year. - Source
reference and source excerpt/locator. - Rule verification status. -
Evaluation notes.

Supported operators may include: - equals / not equals. - in / not in. -
greater than / greater than or equal. - less than / less than or
equal. - between. - date before/after. - institution/course
membership. - compound AND/OR groups. - scheme-specific reviewed
predicates.

Avoid evaluating arbitrary executable code stored in database records.
Use a constrained rule schema.

## 4. Three-valued evaluation

Every condition returns: - `PASS` - `FAIL` - `UNKNOWN`

Unknown applies when: - Student value is missing. - OCR confidence is
insufficient. - Scheme rule is unclear. - Source is stale or not
verified. - Institution/course identity cannot be resolved. - Rule is
not applicable or interpretation needs review.

A missing value is never automatically a pass.

## 5. Overall result

Suggested outcomes: - `POTENTIALLY_ELIGIBLE`: all verified mandatory
conditions pass and no mandatory condition is unknown. - `NOT_ELIGIBLE`:
at least one verified mandatory condition fails. - `NEEDS_INFORMATION`:
no mandatory condition fails, but one or more mandatory conditions are
unknown due to missing student information. - `UNVERIFIED`: scheme rules
are incomplete, stale or not approved for matching.

If a rule is unverified, do not return a positive result based on it.
Define precedence carefully: a confirmed failure may still be shown as a
failed condition, while the overall record can remain unverified if the
scheme itself is not safe to evaluate.

## 6. Evaluation output

Return: - Scheme ID and academic year. - Overall outcome. -
Condition-by-condition result. - Student value used. - Expected rule. -
Source reference. - Missing information. - Failed conditions. - Warnings
and assumptions. - Evaluation timestamp. - Rule-set version.

Do not expose more personal information than necessary in the response.

## 7. Special cases

### Marks and grading

-   Compare only compatible scales.
-   Use official conversion rules when supplied.
-   Do not convert CGPA without the relevant board/institution formula.
-   Respect rounding rules from the official scheme.

### Income

-   Record currency, period and income definition.
-   Distinguish family income from individual income.
-   Do not assume gross/net or financial-year definitions.

### Age

-   Use the scheme's specified reference date.
-   Calculate from a valid date of birth only when required.

### Institution

-   Check institution and course identifiers against an authoritative
    list where available.
-   If unavailable, return unknown, not pass.

### Category and domicile

-   Apply only scheme-specific rules.
-   Do not infer a student's category or domicile from name, address or
    appearance.

### Multiple scholarships

-   Evaluate each scheme independently.
-   Separately identify published restrictions on receiving multiple
    scholarships.
-   Do not assume that applying for multiple schemes is prohibited or
    permitted without a source.

## 8. Explainability

Every result should answer: - Which conditions matched? - Which
failed? - What information is missing? - Which official source supports
the rule? - What should the student do next?

## 9. Versioning and audit

-   Version rule sets.
-   Keep previous evaluations linked to the version used.
-   Re-evaluate when student profile or rule version changes.
-   Record administrator who approved rule changes.
-   Do not silently rewrite historical outcomes.

## 10. Acceptance criteria

-   Unit tests cover every operator and unknown case.
-   Missing values never pass.
-   Stale/unverified rules cannot create a confirmed positive match.
-   Each result can be traced to source and rule version.
-   AI output cannot modify the structured result.
