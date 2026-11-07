import assert from 'node:assert/strict';
import { checkForbiddenPhrases, validateSlot } from '../../src/lib/ai/forbidden.ts';

console.log('🧪 Testing WAJAH Forbidden-Phrase Detection (Gate G2/G6 AI Safety)...');

// 1. English forbidden phrases detection
{
  const p1 = checkForbiddenPhrases('Do not worry, you will be paid next week.');
  assert.ok(p1.hasForbidden, 'Must detect "you will be paid"');
  assert.ok(p1.matchedPhrases.includes('you will be paid'));

  const p2 = checkForbiddenPhrases('You are eligible for the scholarship amount.');
  assert.ok(p2.hasForbidden, 'Must detect "you are eligible"');

  const p3 = checkForbiddenPhrases('This is a guaranteed resolution from the team.');
  assert.ok(p3.hasForbidden, 'Must detect "guaranteed"');

  const p4 = checkForbiddenPhrases('We have filed the correction on your behalf.');
  assert.ok(p4.hasForbidden, 'Must detect "we have filed"');

  const p5 = checkForbiddenPhrases('Welcome to official Wajah portal service.');
  assert.ok(p5.hasForbidden, 'Must detect "official wajah"');

  const p6 = checkForbiddenPhrases('Please enter your password to continue.');
  assert.ok(p6.hasForbidden, 'Must detect "enter your password"');

  const p7 = checkForbiddenPhrases('Kindly share your OTP for verification.');
  assert.ok(p7.hasForbidden, 'Must detect "share your otp"');
}

// 2. Case-insensitivity
{
  const upper = checkForbiddenPhrases('YOU WILL GET the scholarship money.');
  assert.ok(upper.hasForbidden, 'Must be case-insensitive');
  assert.ok(upper.matchedPhrases.includes('you will get'));
}

// 3. Hindi forbidden phrases detection
{
  const h1 = checkForbiddenPhrases('चिंता न करें, आपको पैसे मिलेंगे।');
  assert.ok(h1.hasForbidden, 'Must detect Hindi "आपको पैसे मिलेंगे"');

  const h2 = checkForbiddenPhrases('आप पात्र हैं इस योजना के लिए।');
  assert.ok(h2.hasForbidden, 'Must detect Hindi "आप पात्र हैं"');

  const h3 = checkForbiddenPhrases('यह एक सरकारी सेवा है।');
  assert.ok(h3.hasForbidden, 'Must detect Hindi "सरकारी सेवा"');
}

// 4. Safe legitimate text passes cleanly
{
  const safeEn = checkForbiddenPhrases('I submitted the revised income certificate to my college desk.');
  assert.strictEqual(safeEn.hasForbidden, false);
  assert.strictEqual(safeEn.matchedPhrases.length, 0);

  const safeHi = checkForbiddenPhrases('मैंने संशोधित प्रमाण पत्र अपने कॉलेज में जमा कर दिया है।');
  assert.strictEqual(safeHi.hasForbidden, false);
  assert.strictEqual(safeHi.matchedPhrases.length, 0);
}

// 5. validateSlot enforcement for AI-derived text
{
  const fallback = 'I have submitted my documents for verification.';

  // A. Slot with forbidden phrase -> must swap with fallback
  const dirtySlot = 'Wajah has guaranteed that you are eligible for this grant.';
  const res1 = validateSlot(dirtySlot, fallback);
  assert.strictEqual(res1, fallback, 'Forbidden phrase must trigger immediate fallback swap');

  // B. Slot with Aadhaar run -> must swap with fallback
  const idSlot = 'My number is 123456789012 for your records.';
  const res2 = validateSlot(idSlot, fallback);
  assert.strictEqual(res2, fallback, 'Identifier run must trigger immediate fallback swap');

  // C. Slot exceeding length limit -> must swap with fallback
  const longSlot = 'a'.repeat(350);
  const res3 = validateSlot(longSlot, fallback, 300);
  assert.strictEqual(res3, fallback, 'Over-length slot must trigger fallback swap');

  // D. Safe slot passes unchanged
  const safeSlot = 'I met the nodal officer and handed over the re-scanned bonafide certificate.';
  const res4 = validateSlot(safeSlot, fallback);
  assert.strictEqual(res4, safeSlot, 'Safe slot must be preserved unchanged');
}

console.log('✅ Forbidden-Phrase Detection: All English, Hindi, and runtime slot gates verified!\n');

