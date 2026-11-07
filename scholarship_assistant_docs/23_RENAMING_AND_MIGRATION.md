# Product Renaming and Migration Plan

## 1. Purpose

Safely change the product's public name from Wajah to an approved new
name without accidentally breaking deployment, Android installation, API
configuration or stored data.

## 2. Name decision

ScholarSaathi is a proposed working name, not an approved final name.
Before committing: - Check domain availability. - Check Play
Store/app-store naming conflicts. - Check trademark databases and obtain
legal advice if launching commercially. - Check social handles and
repository naming. - Confirm pronunciation and meaning in target
languages. - Confirm that the name is not misleadingly official or
government-affiliated.

## 3. Branding inventory

Search repository for: - Wajah / WAJAH / wajah. - App title and browser
metadata. - Favicon and logos. - Splash screen and Android resources. -
Capacitor app name/config. - Package scripts and build labels. - README
and documentation. - Environment variables. - API URLs and CORS
allowlists. - Deployment project settings. - Email templates and
notification copy. - Analytics event names. - GitHub repository
references.

Classify each match as user-visible branding, technical identifier,
historical reference or data identifier. Do not blindly replace all
occurrences.

## 4. Android package ID warning

Changing the Android application ID/package ID can cause Android to
treat the new build as a different app. Existing users may not receive
an in-place update, and app data may not carry over.

If the app is already distributed or installed for testing: - Decide
whether continuity is required. - Keep the package ID if possible and
change only the visible app label. - If changing the ID is necessary,
plan a new installation/migration and communicate data implications. -
Review signing keys and release channels.

## 5. Git and deployment

-   Rename repository only if desired and update remotes.
-   Check Vercel or other frontend project links.
-   Update backend/frontend environment variables carefully.
-   Update allowed origins and callback URLs.
-   Confirm Android production API base URL.
-   Rebuild and test APK after changes.
-   Do not place secrets in source control.

## 6. Migration sequence

1.  Approve final name and visual identity.
2.  Create a branch and backup/tag.
3.  Inventory every occurrence.
4.  Update user-visible branding.
5.  Update Android label/splash assets.
6.  Decide package ID strategy.
7.  Update docs and deployment settings.
8.  Run web build and tests.
9.  Run `npm run build` and `npx cap sync android` if those
    scripts/configurations apply.
10. Build debug APK and test installation/update behaviour.
11. Push and verify deployment.
12. Update public links and communication.

## 7. Acceptance criteria

-   New name appears consistently in user-visible surfaces.
-   No broken assets or links.
-   API URLs and environment variables still work.
-   Android app launches and reaches the production backend.
-   Package ID decision is documented.
-   Existing user data is preserved or migration impact is disclosed.
