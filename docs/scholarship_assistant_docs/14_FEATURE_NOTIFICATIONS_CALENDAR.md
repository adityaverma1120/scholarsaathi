# Feature Specification --- Notifications, Deadlines and Scholarship Calendar

## 1. Purpose

Help students remember relevant scholarship application, renewal and
document-related dates without sending misleading or excessive
notifications.

## 2. Notification types

-   Application opening.
-   Application deadline.
-   Correction window.
-   Renewal deadline.
-   Certificate expiry/renewal reminder.
-   Student-selected follow-up.
-   Application status reminder, where status is manually tracked or
    integrated.

## 3. Source and date requirements

Every scheme deadline must include: - Scheme and academic year. -
Official source URL. - Date/time and timezone if published. - Last
verified date. - Whether the date is provisional, extended or
confirmed. - Review status.

If an official date is not available, do not invent one. Allow the
student to set a personal reminder instead.

## 4. User controls

-   Opt in by notification category.
-   Choose reminder timing.
-   Pause or disable reminders.
-   Manage language and delivery channel.
-   Avoid revealing sensitive scholarship details in lock-screen
    notifications.

## 5. Scheduling

-   Use backend scheduled jobs, not client-only timers, for reliable
    reminders.
-   Make jobs idempotent.
-   Re-check scheme status before sending deadline reminders.
-   Cancel or update alerts when official dates change.
-   Prevent duplicate notifications.
-   Respect quiet hours and user timezone.

## 6. Calendar

Show: - Upcoming verified deadlines. - Personal reminders. - Renewal
dates. - Correction windows. - Closed/expired schemes separately.

## 7. Acceptance criteria

-   Every official deadline reminder shows its source and last
    verification date.
-   Unknown dates are not guessed.
-   Students can opt out.
-   Changed or withdrawn dates update pending reminders.
-   Notifications do not expose sensitive personal details.
