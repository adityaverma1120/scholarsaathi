# Proposed Logical Data Model

This is a logical model. Adapt it to the database and ORM already used
by the repository.

## 1. Core entities

### User

-   `id`
-   authentication subject/reference
-   created/updated timestamps
-   account status

### StudentProfile

-   `id`, `user_id`
-   preferred language
-   domicile fields
-   education summary
-   scheme-dependent attributes only where needed
-   consent references
-   timestamps

### AcademicRecord

-   `id`, `profile_id`
-   level, board, institution, course
-   passing/admission year
-   marks, maximum marks, grade/CGPA
-   grading scale and conversion provenance
-   source type and source document reference

### Document

-   `id`, `user_id`
-   document category
-   private storage key
-   MIME type, size, page count
-   checksum
-   processing state
-   upload timestamp
-   retention/deletion state

### ExtractedField

-   `id`, `document_id`
-   field key
-   original value
-   normalised value
-   confidence
-   page/region
-   extraction version
-   user-confirmed value/time

### DocumentCheck

-   `id`, `document_id`
-   check type
-   result
-   explanation
-   evidence reference
-   rule/source version
-   created timestamp

### CrossDocumentComparison

-   `id`, `user_id`
-   field key
-   participating document IDs
-   compared values
-   result
-   normalisation version
-   student explanation
-   review state

### Scholarship

-   `id`
-   stable scheme code
-   name, provider, provider type
-   state/geography
-   academic year
-   description
-   official application/guideline URLs
-   lifecycle status
-   verification status
-   created/updated timestamps

### ScholarshipRuleSet

-   `id`, `scholarship_id`
-   version
-   academic year
-   effective dates
-   review state
-   approved_by
-   source references

### EligibilityCondition

-   `id`, `rule_set_id`
-   field/operator/expected value
-   mandatory flag
-   condition group
-   source reference
-   verification state

### EligibilityEvaluation

-   `id`, `user_id`, `scholarship_id`, `rule_set_id`
-   overall result
-   profile snapshot/version
-   evaluation timestamp

### EligibilityConditionResult

-   `id`, `evaluation_id`, `condition_id`
-   PASS/FAIL/UNKNOWN
-   value used
-   explanation
-   source reference

### ScholarshipDocumentRequirement

-   `id`, `rule_set_id`
-   document category
-   mandatory/conditional/optional
-   format/validity requirements
-   source reference

### ApplicationRecord

-   `id`, `user_id`, `scholarship_id`
-   academic year
-   user-entered application reference (masked/encrypted if retained)
-   status and status source
-   date recorded
-   notes

### ApplicationChecklistItem

-   `id`, `application_id` or readiness context
-   item type
-   status
-   source reference
-   student confirmation

### KnowledgeSource / KnowledgeChunk

-   source metadata, official URL, publication date, academic year,
    review status
-   chunk text, locator, language, embedding/index reference

### ConsentRecord

-   `id`, `user_id`
-   purpose
-   version of notice
-   granted/withdrawn timestamp
-   processing provider/purpose

### AuditEvent

-   actor, action, entity type/id, timestamp
-   safe metadata
-   no raw document content or secrets

## 2. Relationship overview

-   User 1:1 StudentProfile.
-   StudentProfile 1:N AcademicRecord.
-   User 1:N Document.
-   Document 1:N ExtractedField and DocumentCheck.
-   User 1:N CrossDocumentComparison.
-   Scholarship 1:N ScholarshipRuleSet.
-   ScholarshipRuleSet 1:N EligibilityCondition and
    ScholarshipDocumentRequirement.
-   User 1:N EligibilityEvaluation.
-   EligibilityEvaluation 1:N EligibilityConditionResult.
-   User 1:N ApplicationRecord.
-   KnowledgeSource 1:N KnowledgeChunk.

## 3. Data modelling rules

-   Use stable IDs; do not use names as primary keys.
-   Version scheme rules by academic year.
-   Store original extracted values and user-corrected values
    separately.
-   Keep provenance for every eligibility input.
-   Store document object keys, not public URLs.
-   Avoid storing full Aadhaar/bank numbers unless a legally reviewed
    requirement makes it essential; prefer not to store them.
-   Define deletion cascades and retention behaviour.
-   Index user-owned data by owner ID and enforce ownership at the
    service layer.
-   Use encryption for especially sensitive fields where retention is
    justified.

## 4. Data lifecycle

Upload -\> processing -\> user review -\> use in matching -\> retention
period -\> deletion request or expiry -\> delete object and derived data
-\> retain only legally necessary minimal audit record.

Exact retention periods must be decided after legal/privacy review and
disclosed to users.
