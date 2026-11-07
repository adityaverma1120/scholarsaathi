import fs from 'node:fs';
import path from 'node:path';

const LIBRARY_DIR = path.resolve('content/library');
const FORBIDDEN_FILE = path.resolve('content/lint/forbidden.json');
const ALLOWED_DOMAINS_FILE = path.resolve('content/lint/allowed-domains.json');

console.log('🔍 Running WAJAH Content Library Linter (Blocking CI Gate G2/G3)...');

if (!fs.existsSync(LIBRARY_DIR)) {
  console.error(`❌ Library directory not found: ${LIBRARY_DIR}`);
  process.exit(1);
}

const forbiddenConfig = JSON.parse(fs.readFileSync(FORBIDDEN_FILE, 'utf8'));
const allowedDomainsConfig = JSON.parse(fs.readFileSync(ALLOWED_DOMAINS_FILE, 'utf8'));

const forbiddenEn = forbiddenConfig.forbidden_en.map(p => p.toLowerCase());
const forbiddenHi = forbiddenConfig.forbidden_hi.map(p => p.toLowerCase());
const allowedDomains = allowedDomainsConfig.allowed_domains;

const files = fs.readdirSync(LIBRARY_DIR).filter(f => f.endsWith('.json'));
if (files.length === 0) {
  console.warn('⚠️ No JSON files found in content/library');
}

let errorCount = 0;
const validWhoActs = new Set(['student', 'institute', 'district_state', 'bank', 'unsure']);

function checkForbidden(text, fieldName, file) {
  if (!text || typeof text !== 'string') return;
  if (forbiddenConfig.exempt_fields && forbiddenConfig.exempt_fields.includes(fieldName)) {
    return;
  }
  const lower = text.toLowerCase();
  for (const phrase of forbiddenEn) {
    if (lower.includes(phrase)) {
      console.error(`❌ [${file}] Forbidden English phrase "${phrase}" detected in field "${fieldName}": "${text}"`);
      errorCount++;
    }
  }
  for (const phrase of forbiddenHi) {
    if (lower.includes(phrase)) {
      console.error(`❌ [${file}] Forbidden Hindi phrase "${phrase}" detected in field "${fieldName}": "${text}"`);
      errorCount++;
    }
  }
}

function traverseObject(obj, file, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      checkForbidden(value, fieldPath, file);
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'string') {
          checkForbidden(item, `${fieldPath}[${idx}]`, file);
        } else if (typeof item === 'object' && item !== null) {
          traverseObject(item, file, `${fieldPath}[${idx}]`);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      traverseObject(value, file, fieldPath);
    }
  }
}

for (const file of files) {
  const filePath = path.join(LIBRARY_DIR, file);
  let entry;
  try {
    entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ [${file}] Failed to parse JSON: ${err.message}`);
    errorCount++;
    continue;
  }

  // 1. Mandatory structural fields
  if (!entry.id || !entry.status || !entry.cause || !entry.who_acts || !entry.steps || !entry.source) {
    console.error(`❌ [${file}] Missing mandatory fields (id, status, cause, who_acts, steps, source).`);
    errorCount++;
  }

  // 2. Who acts validation
  if (!validWhoActs.has(entry.who_acts)) {
    console.error(`❌ [${file}] Invalid who_acts: "${entry.who_acts}". Must be one of: ${[...validWhoActs].join(', ')}`);
    errorCount++;
  }

  // 3. Step count limit (<= 5)
  if (Array.isArray(entry.steps) && entry.steps.length > 5) {
    console.error(`❌ [${file}] Exceeds maximum 5 steps: has ${entry.steps.length} steps.`);
    errorCount++;
  }

  // 4. Cause word count limit (<= 25 words in English)
  if (entry.cause && entry.cause.en) {
    const wordCount = entry.cause.en.trim().split(/\s+/).length;
    if (wordCount > 25) {
      console.error(`❌ [${file}] Cause explanation exceeds 25 words (${wordCount} words): "${entry.cause.en}"`);
      errorCount++;
    }
  }

  // 5. Official domain check for source
  if (entry.source && entry.source.url) {
    try {
      const parsedUrl = new URL(entry.source.url);
      const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
      if (!isAllowed) {
        console.error(`❌ [${file}] Source URL domain "${parsedUrl.hostname}" is not in allowed-domains.json.`);
        errorCount++;
      }
    } catch {
      console.error(`❌ [${file}] Invalid source URL: "${entry.source.url}".`);
      errorCount++;
    }
  }

  // 6. Verified status requirements
  if (entry.status === 'verified') {
    if (!entry.source?.checked_on) {
      console.error(`❌ [${file}] Verified entry missing source.checked_on.`);
      errorCount++;
    }
    if (!Array.isArray(entry.reviewed_by) || entry.reviewed_by.length < 2) {
      console.error(`❌ [${file}] Verified entry requires at least 2 reviewers in reviewed_by.`);
      errorCount++;
    }
    if (!entry.cause?.hi) {
      console.error(`❌ [${file}] Verified entry missing human-reviewed Hindi cause.`);
      errorCount++;
    }
  }

  // 7. Forbidden phrases traversal
  traverseObject(entry, file);
}

if (errorCount > 0) {
  console.error(`\n❌ Library Lint FAILED with ${errorCount} error(s). Blocking build.`);
  process.exit(1);
} else {
  console.log(`✅ Library Lint PASSED: ${files.length} entry/entries verified cleanly.`);
  process.exit(0);
}

