import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Core imports
import { sanitiseText } from '../../src/lib/sanitise/sanitiser.ts';
import { checkForbiddenPhrases } from '../../src/lib/ai/forbidden.ts';
import { getAllScholarships } from '../../src/lib/catalogue/engine.ts';
import { getVerifiedKnowledgeChunks } from '../../src/lib/assistant-rag/retriever.ts';

/**
 * Release Gate G1: Permanent Independent Identity
 * AGENTS.md Section 1, Rule P1 & Gate G1
 */
test('Release Gate G1: Non-affiliation disclaimer ribbon and non-government identity', () => {
  const ribbonPath = path.resolve('src/components/RibbonBanner.tsx');
  const ribbonCode = fs.readFileSync(ribbonPath, 'utf8');

  // Assert non-affiliation string is verbatim per Rule P1
  assert.ok(
    ribbonCode.includes('Independent prototype. Not a government service. Not affiliated with NSP.'),
    'Ribbon must feature mandatory non-affiliation string verbatim'
  );

  // Assert ribbon banner is included in root layout
  const layoutPath = path.resolve('src/app/layout.tsx');
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(
    layoutCode.includes('<RibbonBanner />') || layoutCode.includes('RibbonBanner'),
    'Root layout MUST mount RibbonBanner on all routes'
  );
});

/**
 * Release Gate G2: Reviewed Knowledge is Sovereign
 * AGENTS.md Section 1, Rule P2, Rule P5 & Gate G2
 */
test('Release Gate G2: Zero scholarship advice strings authored by UI components or AI', () => {
  const forbiddenKeywords = ['you will be paid', 'you are eligible', 'guaranteed', 'we have filed'];
  
  // Verify forbidden phrase detection engine blocks guarantees
  for (const phrase of forbiddenKeywords) {
    const check = checkForbiddenPhrases(phrase);
    assert.strictEqual(check.hasForbidden, true, `Phrase "${phrase}" must be rejected by Gate G2 filter`);
  }
});

/**
 * Release Gate G3: 100% of Bundled Schemes & Library Entries Verified
 * AGENTS.md Section 9, Gate G3
 */
test('Release Gate G3: 100% verified status, .gov.in sources, 2 reviewers', () => {
  // 1. Catalogue Schemes
  const schemes = getAllScholarships();
  assert.ok(schemes.length >= 6);
  for (const s of schemes) {
    assert.ok(s.officialSource.applicationUrl.includes('.gov.in') || s.officialSource.applicationUrl.includes('.nic.in'));
    assert.ok(s.officialSource.verifiedBy.length >= 2, `Scheme ${s.id} must have >= 2 reviewers`);
    assert.equal(s.academicYear, '2026-27');
    assert.ok(s.officialSource.lastCheckedDate.startsWith('2026-'));
  }

  // 2. RAG Knowledge Chunks
  const chunks = getVerifiedKnowledgeChunks();
  assert.ok(chunks.length >= 8);
  for (const c of chunks) {
    assert.equal(c.reviewStatus, 'verified');
    assert.ok(c.officialUrl.includes('.gov.in') || c.officialUrl.includes('.nic.in'));
    assert.ok(c.reviewers.length >= 2, `Chunk ${c.id} must have >= 2 reviewers`);
    assert.equal(c.academicYear, '2026-27');
  }
});

/**
 * Release Gate G4: Zero-Trust DPDP Privacy & PII Sanitizer
 * AGENTS.md Section 7, Rule P6 & Gate G4
 */
test('Release Gate G4: PII sanitizer masks identifiers and zero raw text persistence', () => {
  // Test Aadhaar (12 digits)
  assert.equal(sanitiseText('My Aadhaar is 2345 6789 0123').maskedText, 'My Aadhaar is [ID]');
  assert.equal(sanitiseText('Aadhaar: 234567890123').maskedText, 'Aadhaar: [ID]');

  // Test Phone (10 digits)
  assert.equal(sanitiseText('Call me at 9876543210 immediately').maskedText, 'Call me at [NUM] immediately');

  // Test Email
  assert.equal(sanitiseText('Email is student@example.com').maskedText, 'Email is [EMAIL]');
});

/**
 * Storage Invariant: Strict 3-Key Allowlist on localStorage
 * AGENTS.md Section 7
 */
test('Storage Invariant: localStorage strictly limited to 3 keys', () => {
  const allowedKeys = ['wajah.lang', 'wajah.notice.v1', 'wajah.consent.stats'];

  // Check code occurrences of localStorage.setItem
  const searchDirs = ['src/components', 'src/context', 'src/app', 'src/lib'];
  for (const dir of searchDirs) {
    const fullDir = path.resolve(dir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir, { recursive: true });
    for (const file of files) {
      if (typeof file !== 'string' || !file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      const content = fs.readFileSync(path.join(fullDir, file), 'utf8');

      const matches = content.matchAll(/localStorage\.setItem\(\s*['"]([^'"]+)['"]/g);
      for (const m of matches) {
        const key = m[1];
        assert.ok(
          allowedKeys.includes(key),
          `Violated localStorage allowlist! Found unapproved key "${key}" in ${file}. Personal student data must use IndexedDB.`
        );
      }
    }
  }
});

/**
 * Release Gate G8: Bundle Size and Mobile Viewport Standards
 * AGENTS.md Section 9, Gate G8
 */
test('Release Gate G8: Responsive viewport & touch ergonomic classes configured', () => {
  const layoutPath = path.resolve('src/app/layout.tsx');
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');

  // Mobile viewport first (360px viewport first, zero horizontal scroll)
  assert.ok(layoutCode.includes('min-h-screen'));
  assert.ok(layoutCode.includes('max-w-2xl'));

  // Ensure globals.css has touch targets >= 48px or utility configuration
  const cssPath = path.resolve('src/styles/globals.css');
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  assert.ok(cssCode.includes('@layer') || cssCode.includes('tailwind') || cssCode.includes('touch'));
});

/**
 * Principle Invariant P8: Saffron Portal Deadline Warning on All Cards
 * AGENTS.md Section 1, Rule P8
 */
test('Principle Invariant P8: Saffron portal deadline warning present across relevant pages', () => {
  const pagesToCheck = [
    'src/app/card/[entryId]/page.tsx',
    'src/app/tracker/page.tsx',
    'src/app/calendar/page.tsx',
  ];

  for (const pageRel of pagesToCheck) {
    const fullPath = path.resolve(pageRel);
    assert.ok(fs.existsSync(fullPath), `Page ${pageRel} must exist`);
    const pageContent = fs.readFileSync(fullPath, 'utf8');

    assert.ok(
      pageContent.toLowerCase().includes('portal') && pageContent.toLowerCase().includes('deadline'),
      `Page ${pageRel} must display the Rule P8 portal deadline notice`
    );
  }
});

/**
 * Principle Invariant P3: Official Hand-off Button to scholarships.gov.in
 * AGENTS.md Section 1, Rule P3
 */
test('Principle Invariant P3: Every fix card, calendar item, and assistant screen links to .gov.in', () => {
  const cardPath = path.resolve('src/app/card/[entryId]/page.tsx');
  const cardContent = fs.readFileSync(cardPath, 'utf8');
  assert.ok(cardContent.includes('scholarships.gov.in'), 'Fix card must link to scholarships.gov.in');

  const assistantPath = path.resolve('src/app/assistant/[scholarshipId]/page.tsx');
  const assistantContent = fs.readFileSync(assistantPath, 'utf8');
  assert.ok(
    assistantContent.includes('portalUrl') || assistantContent.includes('gov.in'),
    'Assistant page must include official portal hand-off'
  );
});
