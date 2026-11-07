import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

console.log('🚀 Starting Next.js server on port 3000 for full end-to-end verification...');
const nextBin = path.resolve('node_modules/next/dist/bin/next');
const server = spawn(process.execPath, [nextBin, 'start', '-p', '3000'], { stdio: 'pipe' });

server.stdout.on('data', data => {
  const line = data.toString().trim();
  if (line.includes('Ready') || line.includes('Local:')) {
    console.log('[Server stdout]:', line);
  }
});

server.stderr.on('data', data => console.error('[Server stderr]:', data.toString().trim()));

function testRoute(urlPath) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + urlPath, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, bodyLength: data.length });
      });
    }).on('error', reject);
  });
}

function requestJson(urlPath, method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const headers = {};
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = http.request('http://localhost:3000' + urlPath, {
      method,
      headers,
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          if (body) parsed = JSON.parse(body);
        } catch {}
        resolve({ statusCode: res.statusCode, data: parsed, rawBody: body });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function verify() {
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await testRoute('/');
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    console.error('❌ Server failed to respond in time.');
    server.kill();
    process.exit(1);
  }

  console.log('\n✅ Server is ready! Verifying all UI screens & routes...\n');

  const routes = [
    '/',
    '/about',
    '/dashboard',
    '/decode/pick',
    '/decode/paste',
    '/decode/choose',
    '/card/nsp_defective_returned',
    '/card/nsp_defective_returned/grievance',
    '/discovery',
    '/no-match'
  ];

  for (const r of routes) {
    const res = await testRoute(r);
    if (res.statusCode === 200) {
      console.log(`  ✓ Route: ${r.padEnd(42)} -> HTTP ${res.statusCode} (${res.bodyLength} bytes)`);
    } else {
      console.error(`  ❌ Route failed: ${r} -> HTTP ${res.statusCode}`);
      server.kill();
      process.exit(1);
    }
  }

  console.log('\n🔍 Verifying Priority Backend API Endpoints...\n');

  // 1. POST /api/match-ai
  const matchAiRes = await requestJson('/api/match-ai', 'POST', { text: 'Application marked defective by institute' });
  if (matchAiRes.statusCode === 200 && matchAiRes.data?.id === 'nsp_defective_returned') {
    console.log(`  ✓ POST /api/match-ai (Match)          -> HTTP 200 (Matched ID: ${matchAiRes.data.id})`);
  } else {
    console.error('  ❌ POST /api/match-ai failed:', matchAiRes);
    server.kill();
    process.exit(1);
  }

  // 1b. POST /api/understand (AI Classification endpoint)
  const understandRes = await requestJson('/api/understand', 'POST', { text: 'Application marked defective by institute' });
  if (understandRes.statusCode === 200 && understandRes.data?.id === 'nsp_defective_returned') {
    console.log(`  ✓ POST /api/understand (AI Classify)  -> HTTP 200 (Matched ID: ${understandRes.data.id}, Simulated: ${understandRes.data.is_simulated})`);
  } else {
    console.error('  ❌ POST /api/understand failed:', understandRes);
    server.kill();
    process.exit(1);
  }

  // 1c. POST /api/grievance-draft (AI Draft Assistant endpoint)
  const draftRes = await requestJson('/api/grievance-draft', 'POST', {
    entry_id: 'nsp_defective_returned',
    notes: 'Principal signed form but portal shows pending',
    actions_done: ['Uploaded corrected document'],
    days_since: 12,
    language: 'en'
  });
  if (draftRes.statusCode === 200 && draftRes.data?.slots?.grievance_cause) {
    console.log(`  ✓ POST /api/grievance-draft (Assist)   -> HTTP 200 (Slots generated, Simulated: ${draftRes.data.is_simulated})`);
  } else {
    console.error('  ❌ POST /api/grievance-draft failed:', draftRes);
    server.kill();
    process.exit(1);
  }

  // 1d. POST /api/decode (Chatbot / Hybrid endpoint)
  const decodeRes = await requestJson('/api/decode', 'POST', { message: 'Application marked defective by institute' });
  if (decodeRes.statusCode === 200 && decodeRes.data?.status === 'match' && decodeRes.data?.entry?.id === 'nsp_defective_returned') {
    console.log(`  ✓ POST /api/decode (Decode match)     -> HTTP 200 (Matched ID: ${decodeRes.data.entry.id})`);
  } else {
    console.error('  ❌ POST /api/decode failed:', decodeRes);
    server.kill();
    process.exit(1);
  }

  // 1e. GET /api/decode (Chips list)
  const chipsRes = await requestJson('/api/decode', 'GET');
  if (chipsRes.statusCode === 200 && Array.isArray(chipsRes.data?.chips) && chipsRes.data.chips.length > 0) {
    console.log(`  ✓ GET /api/decode (Chips list)        -> HTTP 200 (${chipsRes.data.chips.length} chips returned)`);
  } else {
    console.error('  ❌ GET /api/decode failed:', chipsRes);
    server.kill();
    process.exit(1);
  }

  // 2. POST /api/events (with consent)
  const eventRes = await requestJson('/api/events', 'POST', {
    entry_id: 'nsp_defective_returned',
    fault_label: 'student',
    match_path: 'local',
    outcome: 'matched',
    consent: true,
  });
  if (eventRes.statusCode === 204) {
    console.log('  ✓ POST /api/events (Consent=true)      -> HTTP 204 No Content');
  } else {
    console.error('  ❌ POST /api/events failed:', eventRes);
    server.kill();
    process.exit(1);
  }

  // 3. POST /api/events schema validation (reject unknown fields)
  const invalidEventRes = await requestJson('/api/events', 'POST', {
    entry_id: 'nsp_defective_returned',
    fault_label: 'student',
    match_path: 'local',
    outcome: 'matched',
    extra_forbidden_key: 'hacker',
  });
  if (invalidEventRes.statusCode === 400) {
    console.log('  ✓ POST /api/events (Unknown keys)      -> HTTP 400 Bad Request (Strict Zod)');
  } else {
    console.error('  ❌ POST /api/events strict schema test failed:', invalidEventRes);
    server.kill();
    process.exit(1);
  }

  // 4. POST /api/feedback
  const feedbackRes = await requestJson('/api/feedback', 'POST', {
    entry_id: 'nsp_defective_returned',
    category: 'wrong_meaning',
    note: 'College told me different instructions.',
  });
  if (feedbackRes.statusCode === 204) {
    console.log('  ✓ POST /api/feedback (Valid report)    -> HTTP 204 No Content');
  } else {
    console.error('  ❌ POST /api/feedback failed:', feedbackRes);
    server.kill();
    process.exit(1);
  }

  // 5. POST /api/feedback (Invalid entry ID)
  const badFeedbackRes = await requestJson('/api/feedback', 'POST', {
    entry_id: 'nsp_fake_invalid_id',
    category: 'wrong_meaning',
  });
  if (badFeedbackRes.statusCode === 400) {
    console.log('  ✓ POST /api/feedback (Invalid entry ID)-> HTTP 400 Bad Request');
  } else {
    console.error('  ❌ POST /api/feedback invalid entry test failed:', badFeedbackRes);
    server.kill();
    process.exit(1);
  }

  // 6. POST /api/miss (with consent)
  const missRes = await requestJson('/api/miss', 'POST', {
    text_masked: 'Application pending for state committee review',
    consent: true,
  });
  if (missRes.statusCode === 204) {
    console.log('  ✓ POST /api/miss (With consent)        -> HTTP 204 No Content');
  } else {
    console.error('  ❌ POST /api/miss failed:', missRes);
    server.kill();
    process.exit(1);
  }

  // 7. POST /api/miss (without consent -> rejected)
  const badMissRes = await requestJson('/api/miss', 'POST', {
    text_masked: 'Remark without consent',
    consent: false,
  });
  if (badMissRes.statusCode === 400) {
    console.log('  ✓ POST /api/miss (Without consent)     -> HTTP 400 Bad Request');
  } else {
    console.error('  ❌ POST /api/miss consent gate failed:', badMissRes);
    server.kill();
    process.exit(1);
  }

  // 8. GET /api/dashboard
  const dashRes = await requestJson('/api/dashboard', 'GET');
  if (dashRes.statusCode === 200 && dashRes.data?.min_group_size === 10) {
    console.log(`  ✓ GET /api/dashboard                   -> HTTP 200 (Mock: ${dashRes.data.mock}, k=${dashRes.data.min_group_size})`);
  } else {
    console.error('  ❌ GET /api/dashboard failed:', dashRes);
    server.kill();
    process.exit(1);
  }

  // 9. Restricted reads test (GET on events, feedback, miss must return 405)
  const readEventsRes = await requestJson('/api/events', 'GET');
  const readFeedbackRes = await requestJson('/api/feedback', 'GET');
  const readMissRes = await requestJson('/api/miss', 'GET');
  if (readEventsRes.statusCode === 405 && readFeedbackRes.statusCode === 405 && readMissRes.statusCode === 405) {
    console.log('  ✓ Restricted Reads (GET events/feed/miss)-> HTTP 405 Method Not Allowed');
  } else {
    console.error('  ❌ Restricted reads test failed:', { readEventsRes, readFeedbackRes, readMissRes });
    server.kill();
    process.exit(1);
  }

  server.kill();
  console.log('\n🎉 ALL SCREENS, BACKEND ROUTES, DATA RETENTION & SECURITY POLICIES VERIFIED!');
  process.exit(0);
}

verify();
