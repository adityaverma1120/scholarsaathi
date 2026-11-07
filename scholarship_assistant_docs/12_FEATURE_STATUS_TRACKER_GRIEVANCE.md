# Feature Specification --- Application Status Tracker and Grievance Assistant

## 1. Purpose

Help students understand what a scholarship application status means,
what action may be required and which official route to use.

## 2. Status support

Potential status categories, only where supported by the relevant
portal: - Draft / not submitted. - Submitted. - Pending at institute. -
Pending at district/state/department. - Defective / correction
required. - Rejected. - Approved/sanctioned. - Payment pending. -
Payment processed. - Unknown/unrecognised status.

Status labels differ by portal and scheme. Maintain portal-specific
status dictionaries and do not assume identical meanings across NSP and
state portals.

## 3. Input methods

-   Student selects a status manually.
-   Student pastes status text.
-   Student uploads a screenshot for OCR.
-   Official integration, only where available and authorised.

Never request portal login credentials, OTPs or passwords.

## 4. Explanation structure

For every status, show: - What the status usually means according to the
source. - Which authority/level may be responsible, if confirmed. -
Whether student action appears necessary. - What to check next. -
Relevant deadline, if verified. - Official portal/helpdesk/grievance
source. - Source verification date. - Uncertainty where status wording
is ambiguous.

Do not claim to know the live application state unless retrieved from an
authorised live source or provided by the student.

## 5. Application timeline

Record: - Scheme and academic year. - Student-provided application
reference, minimised or masked where possible. - Status value. - Date
recorded. - Source: manual, screenshot or official integration. -
Student notes. - Next action and reminder, if chosen.

## 6. Grievance assistant

-   Ask for the issue and relevant non-secret details.
-   Retrieve official grievance route and required information.
-   Generate an editable draft.
-   Avoid inventing email addresses, phone numbers or escalation
    authorities.
-   Include placeholders for missing facts.
-   Encourage the student to verify and send the draft themselves.
-   Do not submit a grievance without explicit authorisation and a
    supported official integration.

## 7. Acceptance criteria

-   Status meaning is portal-specific and source-backed.
-   Unrecognised statuses are labelled unknown.
-   No live tracking claim is made for manual/screenshot data.
-   Grievance drafts are editable and source-linked.
-   Sensitive application identifiers are masked in the UI and logs.
