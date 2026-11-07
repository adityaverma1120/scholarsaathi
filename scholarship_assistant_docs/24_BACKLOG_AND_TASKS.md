# Implementation Backlog and Tasks

## 1. Working agreement for coding agents

Before coding: - Inspect the repository. - Read all current project
instructions and docs. - Identify implemented, partial, broken, planned
and unknown features. - Do not rebuild the application. - Do not replace
existing infrastructure without a documented reason. - Do not fabricate
data or claim tests passed without running them.

## 2. Epic A --- Audit and product decisions

-   [ ] Inventory current frontend routes/components.
-   [ ] Inventory backend routes/services.
-   [ ] Inventory database and migrations.
-   [ ] Inventory current OCR and AI integrations.
-   [ ] Audit authentication and document security.
-   [ ] Audit Capacitor Android setup.
-   [ ] Create requirements traceability matrix.
-   [ ] Approve product name and scope.

## 3. Epic B --- Student profile

-   [ ] Define profile schema.
-   [ ] Build progressive profile form.
-   [ ] Add academic record management.
-   [ ] Add field provenance.
-   [ ] Add consent management.
-   [ ] Add export/delete workflow.
-   [ ] Add validation and tests.

## 4. Epic C --- Document vault

-   [ ] Define document categories.
-   [ ] Implement secure upload validation.
-   [ ] Configure private storage.
-   [ ] Add processing job state.
-   [ ] Integrate OCR adapter.
-   [ ] Add field extraction.
-   [ ] Add student review/correction.
-   [ ] Add readability checks.
-   [ ] Add deletion of derived data.
-   [ ] Add ownership and upload security tests.

## 5. Epic D --- Cross-document checker

-   [ ] Define comparable field dictionary.
-   [ ] Implement safe normalisation.
-   [ ] Implement field-specific comparison.
-   [ ] Add confidence-aware results.
-   [ ] Add evidence display.
-   [ ] Add student explanation/review.
-   [ ] Add multilingual comparison tests.

## 6. Epic E --- Scholarship catalogue

-   [ ] Define scheme and rule-set schema.
-   [ ] Build admin create/edit/review/publish workflow.
-   [ ] Define source verification checklist.
-   [ ] Add initial verified NSP records.
-   [ ] Add selected verified UP records.
-   [ ] Add academic-year lifecycle.
-   [ ] Add source and deadline audit.
-   [ ] Add catalogue search/filter UI.

## 7. Epic F --- Eligibility engine

-   [ ] Define constrained condition schema.
-   [ ] Implement PASS/FAIL/UNKNOWN evaluator.
-   [ ] Implement overall result precedence.
-   [ ] Add academic-year handling.
-   [ ] Add institution and marks-scale handling.
-   [ ] Add source/rule version output.
-   [ ] Add comprehensive unit tests.
-   [ ] Ensure AI cannot modify result.

## 8. Epic G --- Readiness and form assistant

-   [ ] Map scholarship requirements to documents.
-   [ ] Build document matching.
-   [ ] Build readiness checklist.
-   [ ] Define form-field mapping model.
-   [ ] Build field guidance UI.
-   [ ] Add candidate values with provenance.
-   [ ] Add student review and copy workflow.
-   [ ] Add final submission checklist.
-   [ ] Confirm no unauthorised submission.

## 9. Epic H --- Status, AI and notifications

-   [ ] Audit existing NSP status explainer.
-   [ ] Add portal-specific status dictionaries.
-   [ ] Improve screenshot/OCR error handling.
-   [ ] Build source-grounded RAG evaluation set.
-   [ ] Add citations and unknown fallback.
-   [ ] Add grievance draft workflow.
-   [ ] Add verified deadline reminders.
-   [ ] Add renewal reminders.

## 10. Epic I --- Quality and launch

-   [ ] Accessibility audit.
-   [ ] Android small-screen audit.
-   [ ] Security review.
-   [ ] Privacy and retention review.
-   [ ] End-to-end tests.
-   [ ] Production environment check.
-   [ ] Remove all fake/demo metrics and records.
-   [ ] Update docs and release notes.
-   [ ] Build and test APK.
-   [ ] Verify deployment and backend connectivity.

## 11. Definition of done

A task is done only when: - Code is implemented in the existing
architecture. - Relevant tests pass. - Error/loading/empty states
exist. - Mobile layout is checked. - Security/privacy impact is
reviewed. - Documentation is updated. - No unsupported claim or mock
data is introduced. - The implementation status is reported honestly.
