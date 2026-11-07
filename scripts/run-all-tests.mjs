import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

console.log('🚀 Running ScholarSaathi Full Test Suite (Unit, Matcher, Profile, DB & API Modules)...\n');

const testFiles = [
  'tests/sanitise/sanitiser.test.mjs',
  'tests/matcher/normaliser.test.mjs',
  'tests/matcher/scorer.test.mjs',
  'tests/matcher/confidence.test.mjs',
  'tests/ai/why.test.mjs',
  'tests/ai/reconcile.test.mjs',
  'tests/ai/gateway.test.mjs',
  'tests/ai/forbidden.test.mjs',
  'tests/profile/profile.test.mjs',
  'tests/vault/vault.test.mjs',
  'tests/checker/checker.test.mjs',
  'tests/catalogue/catalogue.test.mjs',
  'tests/eligibility/eligibility.test.mjs',
  'tests/readiness/readiness.test.mjs',
  'tests/assistant/assistant.test.mjs',
  'tests/tracker/tracker.test.mjs',
  'tests/assistant-rag/rag.test.mjs',
  'tests/calendar/calendar.test.mjs',
  'tests/api/api-modules.test.mjs',
  'tests/e2e/e2e-scenarios.test.mjs',
  'tests/e2e/release-acceptance.test.mjs',
  'scripts/eval-matcher.mjs'
];

let failed = false;

const loaderUrl = pathToFileURL(path.resolve('scripts/ts-resolver.mjs')).href;

for (const file of testFiles) {
  const fullPath = path.resolve(file);
  console.log(`▶ Executing: ${file}`);
  const result = spawnSync(process.execPath, ['--loader', loaderUrl, fullPath], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`❌ Test failed: ${file}`);
    failed = true;
    break;
  }
  console.log('');
}

if (failed) {
  console.error('💥 Test suite FAILED.');
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (Gate G4 & Gate G5 Verified)');
  process.exit(0);
}
