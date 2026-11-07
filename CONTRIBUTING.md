# Contributing to ScholarSaathi

Welcome to **ScholarSaathi**! This project is maintained by **Visionary Bytes**.  
To ensure code quality, privacy compliance, and architectural boundaries, all team members are required to follow this collaboration workflow.

---

## 👥 Team & Roles

- **Project Owner:** Aditya Verma (@adityaverma1120)
- **Collaborator:** Yatin Kumar (@yatinkumar2512006-code)
- **Contributors:** Pooja Mehra, Yashika Shrivastav

> **Note:** Task assignments, feature approvals, and production releases are coordinated directly by the Project Owner. Do not self-assign new architectural tasks or merge pull requests without review.

---

## 🌿 Branching Strategy

We follow a structured Git branching strategy:

- **`main`**: The protected production branch. Always contains stable, tested, and deployable code. Never commit directly to `main`.
- **`feature/<feature-name>`**: Dedicated branch for new features (e.g., `feature/scheme-search-filters`).
- **`fix/<bug-description>`**: Dedicated branch for bug fixes (e.g., `fix/date-formatting-issue`).
- **`chore/<task-name>`**: Maintenance, dependencies, or documentation updates (e.g., `chore/update-readme`).

---

## 🔄 Step-by-Step Contribution Workflow

### 1. Clone the Repository
```bash
git clone https://github.com/adityaverma1120/scholarsaathi.git
cd scholarsaathi
```

### 2. Configure Your Git Identity
Ensure your commits reflect your correct name and email:
```bash
git config user.name "Your Full Name"
git config user.email "your-email@example.com"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create a Working Branch
Always branch off the latest `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### 5. Make Changes & Adhere to Core Rules
When developing, strictly respect the core architectural boundaries:
- **Rule P1 (Independence):** Never remove or hide the disclaimer ribbon (`C-RIBBON`). Never use government emblems.
- **Rule P2 (Advisory Only):** ScholarSaathi explains remarks and eligibility; never author guarantees or promise disbursement.
- **Rule P3 (Official Portal Hand-off):** All action loops end with an external link to `scholarships.gov.in`.
- **Rule P4 (Zero Raw Text Persistence / DPDP):** Never store raw student text, Aadhaar numbers, phone numbers, or passwords in localStorage, server logs, or databases.
- **Rule P8 (Portal Deadlines Only):** Always show the saffron warning box reminding students that deadlines fluctuate.
- **Prohibition #8:** NEVER modify or delete files inside the `/docs` directory.

### 6. Run Quality Checks Locally
Before committing, ensure all tests, linting, and typechecks pass:
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Automated test suite (all 22 suites must pass)
npm test

# 3. Production build verification
npm run build
```

### 7. Commit Your Changes
Use clear, semantic commit messages:
```bash
git add <files-you-changed>
git commit -m "feat: add category filter to scholarship discovery"
# or
git commit -m "fix: resolve date-of-birth validation mismatch"
```
*Never stage `.env`, `.env.local`, `node_modules`, or files containing private credentials.*

### 8. Push Your Branch
```bash
git push -u origin feature/your-feature-name
```

### 9. Open a Pull Request (PR)
1. Go to the GitHub repository: `https://github.com/adityaverma1120/scholarsaathi`
2. Click **Compare & pull request**.
3. Set the base branch to `main` and compare branch to your feature branch.
4. Fill in the PR description:
   - Summary of changes.
   - Related issue or task.
   - Verification steps performed (test results).
5. Request a review from the Project Owner (`@adityaverma1120`).

### 10. Code Review & Merge
- Address any review comments or requested revisions.
- Once approved and all CI checks pass, the Project Owner will merge the pull request into `main`.

---

## 🔒 Security & Privacy Reminders

- **Zero Secrets in Code:** Never commit API keys, database credentials, access tokens, or personal passwords.
- **Client Storage Allowlist:** `localStorage` is restricted strictly to 3 keys:
  1. `wajah.lang`
  2. `wajah.notice.v1`
  3. `wajah.consent.stats`
- If you accidentally commit sensitive data, notify the Project Owner immediately so the credentials can be rotated and Git history sanitized.
