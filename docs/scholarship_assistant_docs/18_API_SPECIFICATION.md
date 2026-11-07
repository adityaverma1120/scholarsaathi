# Proposed API Specification

API paths and payloads are proposals. Inspect existing routes and
conventions before implementation. Do not create duplicate endpoints.

## 1. General conventions

-   HTTPS only in production.
-   JSON request/response except multipart document upload.
-   Authenticated routes require user identity.
-   Authorise ownership on every resource.
-   Use pagination for lists.
-   Use consistent error envelopes.
-   Validate all input server-side.
-   Never accept arbitrary storage paths or executable eligibility
    expressions from clients.

Example error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields need attention.",
    "details": [{"field": "educationLevel", "reason": "Required"}]
  }
}
```

## 2. Profile

-   `GET /api/profile`
-   `PUT /api/profile`
-   `PATCH /api/profile`
-   `DELETE /api/profile` (deletion workflow)

The API should support partial profile completion and field provenance.

## 3. Documents

-   `POST /api/documents` --- multipart upload.
-   `GET /api/documents`
-   `GET /api/documents/{documentId}`
-   `POST /api/documents/{documentId}/process`
-   `GET /api/documents/{documentId}/processing-status`
-   `PATCH /api/documents/{documentId}/extracted-fields`
-   `DELETE /api/documents/{documentId}`

Upload response should return document ID and processing state, not a
public object-storage URL.

## 4. Cross-document comparison

-   `POST /api/document-comparisons`
-   `GET /api/document-comparisons`
-   `GET /api/document-comparisons/{comparisonId}`
-   `PATCH /api/document-comparisons/{comparisonId}`

Request identifies authorised document IDs and fields to compare.
Response includes comparison state, values, source references and
confidence.

## 5. Scholarship catalogue

-   `GET /api/scholarships`
-   `GET /api/scholarships/{scholarshipId}`
-   `GET /api/scholarships/{scholarshipId}/sources`
-   `GET /api/scholarships/{scholarshipId}/requirements`

Filters may include state, education level, course, provider type,
academic year and lifecycle state.

## 6. Eligibility

-   `POST /api/eligibility/evaluate`
-   `GET /api/eligibility/evaluations`
-   `GET /api/eligibility/evaluations/{evaluationId}`

Request:

``` json
{
  "profileId": "profile-id",
  "scholarshipIds": ["scheme-id"],
  "academicYear": "2026-27"
}
```

Response should include overall outcome, rule-set version, condition
results, unknowns, failed conditions and source references. Do not
accept client-supplied rule outcomes.

## 7. Readiness

-   `POST /api/scholarships/{scholarshipId}/readiness`
-   `GET /api/readiness/{readinessId}`
-   `PATCH /api/readiness/{readinessId}/items/{itemId}`

## 8. Application assistance

-   `GET /api/scholarships/{scholarshipId}/form-guide`
-   `POST /api/application-preparation`
-   `GET /api/application-preparation/{id}`
-   `PATCH /api/application-preparation/{id}`

The service returns field guidance and candidate values with provenance.
It must not submit the official application.

## 9. Status and grievance

-   `POST /api/applications`
-   `GET /api/applications`
-   `PATCH /api/applications/{applicationId}/status`
-   `POST /api/grievance-drafts`

Do not imply live status lookup unless a real authorised integration
exists.

## 10. AI assistant

-   `POST /api/assistant/messages`

The backend should retrieve approved sources, apply privacy filters and
return an answer with citations and uncertainty. Never trust
client-supplied claims that a source is official.

## 11. Administration

-   `POST /api/admin/scholarships`
-   `PATCH /api/admin/scholarships/{id}`
-   `POST /api/admin/scholarships/{id}/submit-review`
-   `POST /api/admin/scholarships/{id}/publish`
-   `POST /api/admin/scholarships/{id}/archive`

Every administrative action must be role-checked and audited.

## 12. Operational requirements

-   Rate-limit uploads and AI requests.
-   Use idempotency for retryable processing jobs.
-   Return job IDs for asynchronous OCR.
-   Do not return internal errors, secrets or raw provider responses.
-   Add API contract tests and ownership tests.
