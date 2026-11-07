# Scholarship Assistant Platform --- Documentation Index

**Working product name:** ScholarSaathi (proposed; not final)\
**Current project name:** Wajah\
**Product category:** Student scholarship discovery, document readiness,
eligibility and application-support platform\
**Document status:** Product blueprint / implementation specification\
**Version:** 1.0\
**Date:** 5 November 2026

## 1. Purpose

This documentation describes the proposed evolution of Wajah from an NSP
status-explanation tool into a broader scholarship lifecycle assistant.
It is a planning specification, not evidence that every feature is
already implemented.

The platform should help a student: 1. Build a reusable academic and
scholarship profile. 2. Securely organise scholarship-related documents.
3. Extract document information and check readability/completeness. 4.
Compare information across documents and flag possible inconsistencies.
5. Discover scholarships from verified sources. 6. Evaluate profile
information against published eligibility rules. 7. Understand which
documents are required for each scholarship. 8. Prepare applications
with guided, student-reviewed form assistance. 9. Track application
progress and understand defects, rejections and payment issues. 10. Get
explanations and grievance-drafting help grounded in official sources.

## 2. Product principles

-   **Evidence before confidence:** Every scheme rule, deadline,
    benefit, document requirement and official link must have a source
    and verification date.
-   **Rules decide; AI explains:** Deterministic code evaluates
    structured eligibility rules. Generative AI explains outcomes and
    answers grounded questions; it must not invent or override rules.
-   **No false authentication:** OCR, visual inspection, QR detection or
    cross-document matching cannot by themselves prove that a
    certificate is genuine.
-   **Student remains in control:** No application submission, portal
    action, or disclosure of documents without informed student review
    and explicit action.
-   **Privacy by design:** Collect the minimum necessary data, protect
    it, limit retention and support deletion.
-   **Accessible by default:** Mobile-first, low-bandwidth aware,
    plain-language, Hindi and English support, keyboard and
    screen-reader support.
-   **Honest status labels:** Distinguish verified, unverified, missing,
    expired, unreadable, potentially inconsistent and officially
    authenticated.
-   **No fabricated data:** Do not ship mock scholarships, fake
    statistics, invented contacts or unverified deadlines as real data.

## 3. Documentation set

  ---------------------------------------------------------------------------------
  File                                          Purpose
  --------------------------------------------- -----------------------------------
  `01_PRODUCT_VISION.md`                        Vision, users, value proposition
                                                and product boundaries

  `02_PRD.md`                                   Product requirements and scope

  `03_FUNCTIONAL_REQUIREMENTS.md`               System-wide functional requirements

  `04_FEATURE_STUDENT_PROFILE.md`               Student profile and academic vault

  `05_FEATURE_DOCUMENT_VAULT_OCR.md`            Upload, storage, OCR and document
                                                checks

  `06_FEATURE_CROSS_DOCUMENT_CHECKER.md`        Field extraction and consistency
                                                comparison

  `07_FEATURE_SCHOLARSHIP_DISCOVERY.md`         Scholarship catalogue and discovery

  `08_FEATURE_ELIGIBILITY_ENGINE.md`            Rule model and eligibility
                                                evaluation

  `09_FEATURE_DOCUMENT_MATCHING_READINESS.md`   Scheme-specific document matching
                                                and readiness

  `10_FEATURE_VERIFICATION_ASSISTANT.md`        Authenticity and official
                                                verification boundaries

  `11_FEATURE_APPLICATION_ASSISTANT.md`         Form guidance and safe form
                                                assistance

  `12_FEATURE_STATUS_TRACKER_GRIEVANCE.md`      Application status, corrections and
                                                grievances

  `13_FEATURE_AI_ASSISTANT_RAG.md`              AI assistant and grounded retrieval

  `14_FEATURE_NOTIFICATIONS_CALENDAR.md`        Deadlines, renewals and alerts

  `15_UX_DESIGN_ACCESSIBILITY.md`               Navigation, screens, content and
                                                accessibility

  `16_SYSTEM_ARCHITECTURE.md`                   Proposed architecture and component
                                                boundaries

  `17_DATA_MODEL.md`                            Logical entities and data
                                                relationships

  `18_API_SPECIFICATION.md`                     Proposed API contracts

  `19_SECURITY_PRIVACY.md`                      Security, privacy and data
                                                governance

  `20_TECH_STACK_AND_INTEGRATIONS.md`           Technology guidance and integration
                                                boundaries

  `21_TESTING_AND_ACCEPTANCE.md`                Test strategy and acceptance
                                                criteria

  `22_ROADMAP_AND_MILESTONES.md`                Phased implementation plan

  `23_RENAMING_AND_MIGRATION.md`                Safe rebrand and Android identity
                                                considerations

  `24_BACKLOG_AND_TASKS.md`                     Implementation backlog and
                                                sequencing

  `25_KNOWN_LIMITATIONS_AND_RISKS.md`           Risks, assumptions and unresolved
                                                decisions
  ---------------------------------------------------------------------------------

## 4. How to use these files

1.  Give this folder to the coding agent together with the existing
    repository.
2.  Tell the agent to inspect the actual source code before making
    changes.
3.  Ask it to create an implementation audit mapping every requirement
    to existing code, missing work and risks.
4.  Approve the product name and first release scope before
    implementation.
5.  Implement in milestones, not as one giant code-generation task.
6.  Require tests and evidence for every claimed completion.
7.  Update these documents when implementation decisions change.

## 5. Important implementation note

The actual repository's framework, database, hosting, authentication,
storage provider, OCR provider and API routes must be discovered by
inspecting the project. The technology recommendations in these
documents are options, not claims about the current codebase. Do not
replace working infrastructure merely to match a proposed stack.

## 6. Proposed first release

A practical first release should include: - Student profile with
explicit consent. - Private document upload and OCR extraction. - Basic
readability and required-field checks. - Cross-document comparison for a
small set of common fields. - A small catalogue of genuinely verified
scholarships. - Deterministic eligibility matching with explainable
outcomes. - Scheme-specific document checklist. - Existing NSP status
explanation capability, if it is working and tested. - AI explanations
grounded in verified source records.

Automated portal form submission, universal certificate authentication,
live integrations with every state portal and nationwide coverage are
not first-release promises.
