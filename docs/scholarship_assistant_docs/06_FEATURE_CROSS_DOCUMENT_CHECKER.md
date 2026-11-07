# Feature Specification --- Cross-Document Information Checker

## 1. Purpose

Compare selected information extracted from a student's documents and
flag possible inconsistencies before scholarship application.

This is a consistency assistant, not a fraud detector and not an
official identity adjudication system.

## 2. Fields to compare

Initial fields, when present and relevant: - Student full name. -
Parent/guardian name. - Date of birth. - Gender only where a scheme
requires it. - Domicile state/district. - Category/subcategory where
relevant. - Academic board. - Roll number. - Passing year. - Marks,
maximum marks and grade. - Certificate number. - Issue date and validity
date.

Do not compare unrelated fields or infer that every document should
contain the same fields.

## 3. Comparison pipeline

1.  Retrieve user-authorised extracted fields.
2.  Confirm document type and extraction confidence.
3.  Normalise safe formatting differences.
4.  Compare values using field-specific comparison rules.
5.  Produce a result with source document references.
6.  Ask the student to review ambiguous cases.
7.  Record user explanation or correction request without altering
    original evidence.

## 4. Normalisation

Potential safe normalisation: - Trim leading/trailing whitespace. -
Collapse repeated spaces. - Unicode normalisation. - Case-fold Latin
text for comparison. - Normalise common punctuation. - Compare dates
only after unambiguous parsing. - Preserve original script and value.

Do not aggressively normalise names. Hindi/English transliteration can
produce legitimate variations. Fuzzy similarity is a review signal, not
proof of equality.

## 5. Result categories

-   `exact_match`: same after safe normalisation.
-   `likely_match`: minor variation, human review recommended.
-   `possible_mismatch`: values differ in a way that may matter.
-   `significant_mismatch`: clear difference in a critical field.
-   `not_comparable`: one or both values missing, unreadable or
    incompatible.
-   `user_explained`: student supplied an explanation; preserve the
    original result.

## 6. Example

  Field           Document A    Document B    Result
  --------------- ------------- ------------- ----------------------
  Student name    Rahul Kumar   Rahul Kumar   Exact match
  Parent name     Amit Kumar    Amit K.       Likely match
  Date of birth   12-05-2007    12-05-2008    Significant mismatch
  Passing year    2024          unreadable    Not comparable

This is illustrative only. Do not use fabricated examples as real
student data.

## 7. Student experience

For each warning show: - The field. - The values found. - Which
documents contain them. - OCR confidence. - Why the difference was
flagged. - Whether it may be a normal variation. - Suggested next
action, such as checking the original document or contacting the issuing
authority.

Do not tell a student to alter a government document. Direct them to the
legitimate correction process.

## 8. Safeguards

-   Never label a document fraudulent based only on mismatch.
-   Never automatically reject a student or scholarship match solely due
    to an uncertain OCR result.
-   Keep original extracted values.
-   Record changes and user explanations.
-   Restrict comparisons to documents selected or authorised by the
    student.
-   Avoid exposing sensitive values in notifications.

## 9. Acceptance criteria

-   Comparison includes source document references.
-   Low-confidence OCR does not produce a definitive mismatch.
-   Transliteration and harmless formatting differences can be marked as
    likely matches.
-   Student can explain a discrepancy.
-   No source document is modified.
-   Result wording makes clear that this is a preliminary consistency
    check.
