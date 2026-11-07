# UX, Design System and Accessibility Specification

## 1. Design objective

Make scholarship processes understandable for students with different
levels of digital literacy, using a calm, trustworthy, mobile-first
interface.

Avoid a generic AI-generated dashboard aesthetic. Prioritise clear
hierarchy, real task flows, restrained visual design and meaningful
content.

## 2. Information architecture

Primary navigation: 1. Home / Dashboard. 2. My Profile. 3. My Documents.
4. Find Scholarships. 5. Eligibility Results. 6. Application Readiness.
7. My Applications. 8. AI Help. 9. Settings and Privacy.

On small screens use a compact bottom navigation for the most frequent
tasks, with secondary sections in a menu. Avoid clipped navigation and
cramped input fields.

## 3. Dashboard

Show task-oriented cards: - Complete profile. - Add/check documents. -
Find matching scholarships. - Resolve document warnings. - Continue an
application checklist. - Review application status.

Only show counts and metrics when backed by actual database records.
Empty states should explain how to begin.

## 4. Core screens

### Onboarding

-   Explain what the platform does and does not do.
-   Explain privacy and consent.
-   Let user continue without completing every optional field.

### Profile

-   Group fields by education, domicile and scheme-specific information.
-   Use progressive questions.
-   Explain unfamiliar terms.

### Document vault

-   Clear upload instructions.
-   Document type and status.
-   OCR progress and review action.
-   Safe delete/replace controls.

### Cross-document report

-   Show field, values, source documents and reason for warning.
-   Use text labels and icons, not colour alone.
-   Allow "reviewed", "explained" and "needs correction".

### Scholarship discovery

-   Search and filters.
-   Provider and academic year.
-   Verified status and source date.
-   Clear distinction between open, upcoming, closed and unknown.

### Eligibility detail

-   Matched, failed and unknown conditions.
-   Official source links.
-   Plain-language explanation.
-   Next action.

### Application assistant

-   Field-by-field instructions.
-   Candidate value and provenance.
-   Student confirmation.
-   No hidden submission.

## 5. Content design

-   Use plain language and short sentences.
-   Explain government terms in context.
-   Keep original official terminology available.
-   Avoid overconfident labels.
-   Translate carefully; do not change rule meaning.
-   Explain why information is requested.

## 6. Accessibility

Target WCAG 2.2 AA where feasible: - Semantic headings and landmarks. -
Keyboard navigation. - Visible focus. - Labels and instructions for
every input. - Error summary and field-level errors. - Sufficient
contrast. - Text resizing and zoom. - Screen-reader announcements for
status changes. - Alternative text for meaningful images. - No reliance
on colour alone. - Touch targets appropriate for mobile. -
Reduced-motion support. - Accessible tables and document status
descriptions.

## 7. Low-bandwidth and Android considerations

-   Compress previews without altering original files.
-   Upload with progress and retry.
-   Avoid large initial bundles.
-   Preserve form progress safely.
-   Handle Android keyboard and viewport resizing.
-   Test small screens and different font scaling.
-   Provide understandable offline/connection error states.

## 8. Design tokens

Use the existing project's design tokens if present. Otherwise define: -
Colour roles: background, surface, text, muted, border, primary,
success, warning, danger. - Typography scale and line heights. - Spacing
scale. - Radius and elevation. - Focus ring. - Breakpoints. - Component
states.

Do not introduce a new component library without checking the existing
one.

## 9. Acceptance criteria

-   Main tasks are usable on narrow mobile screens.
-   Keyboard users can complete the main journey.
-   Errors are announced and understandable.
-   No fake dashboard metrics.
-   All result states have text labels.
-   Hindi content does not clip or overflow.
