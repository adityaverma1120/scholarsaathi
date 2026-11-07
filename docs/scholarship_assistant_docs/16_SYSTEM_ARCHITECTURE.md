# Proposed System Architecture

## 1. Architecture goals

-   Extend the existing Wajah codebase rather than rebuild it.
-   Separate UI, business rules, document processing and AI
    orchestration.
-   Keep eligibility deterministic and testable.
-   Isolate external providers behind adapters.
-   Enforce student-level data access.
-   Support incremental rollout.

## 2. Logical components

### Frontend

-   Dashboard and navigation.
-   Student profile.
-   Document vault.
-   Scholarship search and details.
-   Eligibility results.
-   Readiness checklist.
-   Application guidance.
-   Status tracker and AI assistant.

### Backend API

-   Authentication/session integration, if present.
-   Profile service.
-   Document service.
-   OCR job orchestration.
-   Cross-document comparison service.
-   Scholarship catalogue service.
-   Eligibility evaluation service.
-   Application preparation service.
-   Status/grievance service.
-   Notification service.
-   Administration and audit service.

### Data layer

-   Relational database for profiles, schemes, rules, evaluations and
    metadata.
-   Private object storage for uploaded documents.
-   Search/vector index for approved knowledge content, if RAG is
    retained.
-   Job queue for OCR, notifications and indexing.

### External adapters

-   OCR provider.
-   Gemini or other approved LLM provider.
-   Official scheme source ingestion.
-   Official verification services where permitted.
-   Notification delivery provider.

## 3. Suggested request flows

### Document processing

Upload -\> validate -\> private storage -\> queue -\> OCR -\> field
extraction -\> user review -\> document checks -\> cross-document
comparison.

### Eligibility

Profile snapshot + approved scheme rule version -\> deterministic
evaluation -\> condition-level results -\> AI explanation (optional) -\>
source links.

### RAG

Question -\> intent/scheme/year filter -\> approved retrieval -\>
evidence check -\> answer generation -\> citations.

### Application assistance

Selected scheme -\> versioned field map -\> profile candidates -\>
conflict/missing check -\> student review -\> manual official portal
submission.

## 4. Architecture boundaries

-   AI service cannot write eligibility outcomes.
-   OCR service cannot authenticate a document.
-   Frontend cannot directly access private storage.
-   Catalogue publication requires an authorised reviewer.
-   External providers are called only through backend adapters.
-   No portal automation without a separately reviewed integration.

## 5. Deployment

Inspect the current deployment before choosing hosting changes.
Confirm: - Frontend origin and API base URL. - Production backend
reachability from Android. - CORS and HTTPS. - Database backup. -
Private file storage. - Background worker availability. - Secret
management. - Monitoring and error reporting.

Do not assume a local backend or localhost URL will work on a student's
phone.

## 6. Scalability

-   Use asynchronous processing for OCR and large PDFs.
-   Set per-user upload and processing quotas.
-   Cache public scheme catalogue data, not private student documents.
-   Index only reviewed public knowledge content.
-   Add observability around provider latency, failures and cost.
-   Avoid premature microservices; modular services within the existing
    backend may be sufficient initially.

## 7. Architecture decision records

Record decisions for: - Database and storage. - OCR provider. - LLM
provider. - RAG index. - Authentication. - Background jobs. - Data
retention. - Portal assistance boundaries.

Each decision should include context, options, decision, trade-offs and
review date.
