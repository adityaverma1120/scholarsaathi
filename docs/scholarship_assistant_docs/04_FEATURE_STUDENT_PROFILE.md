# Feature Specification --- Student Profile and Academic Vault

## 1. Purpose

Create one reusable, student-controlled profile that supplies
information to scholarship discovery, eligibility, document comparison
and application preparation.

## 2. Design principles

-   Ask only for fields that are needed.
-   Explain why a field is requested.
-   Use progressive profiling: collect additional details only when a
    selected scheme needs them.
-   Let the student review and correct data.
-   Record source and provenance: student-entered, extracted from a
    document, or verified through an authorised source.
-   Do not treat profile information as officially verified merely
    because it was entered.

## 3. Profile sections

### Basic profile

-   Display name.
-   Date of birth, only if required for age criteria.
-   Domicile state and district.
-   Contact information only if needed for account or notifications.
-   Preferred language.

### Academic profile

-   Current education level.
-   Current course, stream and year.
-   Institution name, location, type and recognised identifiers if
    available.
-   Class 10 board, passing year, marks/percentage and grading scale.
-   Class 12 board, passing year, marks/percentage and grading scale.
-   Diploma/undergraduate/postgraduate history as relevant.
-   Admission year and fresh/renewal status.

### Scheme-dependent profile

-   Family income and income period.
-   Category/subcategory.
-   Minority status, where a scheme lawfully requires it.
-   Disability-related information, where relevant and voluntarily
    provided.
-   Hosteller/day scholar.
-   Other conditions expressly specified by a scheme.

Avoid collecting sensitive attributes globally when they are not needed.
The user should be able to see which scholarship triggered a request for
additional information.

## 4. Academic marks representation

Store: - Original marks as shown on source. - Total marks or maximum
score. - Percentage only when calculated from a valid denominator. -
Grade/CGPA and conversion method, if applicable. - Board and grading
scheme. - Passing year. - Source document and extraction confidence.

Do not convert CGPA to percentage unless the relevant
board/institution's official conversion rule is known. Do not compare
different grading systems as if directly equivalent.

## 5. Data provenance

Each important field should include: - `value` - `source_type`:
user_input, document_extraction, official_verification,
administrator_entry - `source_document_id`, if applicable -
`confidence`, if applicable - `verified_at`, if applicable -
`updated_at` - `user_confirmed_at`

A user-confirmed OCR value is still not necessarily an officially
authenticated fact.

## 6. User experience

1.  Show profile completion by section, not a misleading eligibility
    percentage.
2.  Let the student skip optional sections.
3.  Ask scheme-specific follow-up questions at the point they are
    needed.
4.  Show a summary before using the profile for matching.
5.  Allow the student to exclude a document or field from a particular
    analysis.
6.  Provide edit, export and deletion controls.

## 7. Validation

-   Validate dates and numeric ranges.
-   Preserve board-specific marks formats.
-   Validate state/district selections against maintained reference
    data.
-   Avoid forcing a category selection when it is not required.
-   Allow "I don't know" or "not applicable" where appropriate.
-   Never silently coerce malformed data into a valid value.

## 8. Acceptance criteria

-   A student can save a partial profile.
-   The system distinguishes missing, optional and not-applicable
    fields.
-   Every scheme-dependent field is linked to a reason.
-   OCR-derived values show provenance and can be corrected.
-   Profile updates are reflected in future eligibility runs.
-   A student can request deletion of their profile and associated data
    under the retention policy.
