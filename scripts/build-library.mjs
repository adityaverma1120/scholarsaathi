import fs from 'node:fs';
import path from 'node:path';

const LIBRARY_DIR = path.resolve('content/library');
const OUTPUT_DIR = path.resolve('data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'library.json');

console.log('📦 Bundling WAJAH Content Library...');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = fs.readdirSync(LIBRARY_DIR).filter(f => f.endsWith('.json'));
const isDemoMode = process.env.DEMO_MODE !== 'false';

const bundledEntries = [];

for (const file of files) {
  const filePath = path.join(LIBRARY_DIR, file);
  const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (entry.status === 'retired') {
    continue;
  }

  // In production builds, physically exclude non-verified entries (R-LIFE-01)
  if (!isDemoMode && entry.status !== 'verified') {
    continue;
  }

  bundledEntries.push(entry);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bundledEntries, null, 2), 'utf8');
console.log(`✅ Bundled ${bundledEntries.length} entries into ${OUTPUT_FILE} (DEMO_MODE=${isDemoMode})`);

