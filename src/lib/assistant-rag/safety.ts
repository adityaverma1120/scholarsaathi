import { sanitiseText } from '../sanitise/sanitiser';
import { checkForbiddenPhrases } from '../ai/forbidden';

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: 'prompt_injection' | 'pii_leak' | 'decision_request' | 'forbidden_phrase';
  sanitisedQuery: string;
  refusalEn?: string;
  refusalHi?: string;
}

const PROMPT_INJECTION_PATTERNS = [
  /\b(ignore|disregard|forget)\b.*?\b(rules|instructions|prompts)\b/i,
  /\b(system prompt|show (me )?(your )?(instructions|prompt))\b/i,
  /\b(jailbreak|dan mode|developer mode|unrestricted mode)\b/i,
  /\b(bypass (portal|safety|verification|checks))\b/i,
  /\b(pretend to be|act as an unrestricted)\b/i,
];

const PROMPT_INJECTION_PHRASES_HI = [
  'नियम अनदेखा',
  'निर्देश भूल',
  'सिस्टम प्रॉम्प्ट',
  'जेलब्रेक',
  'सुरक्षा बायपास',
];

const DECISION_REQUEST_PATTERNS = [
  /\b(will i|can i)\b.*?\b(get|receive|paid|money|scholarship)\b/i,
  /\b(am i eligible|am i not eligible)\b/i,
  /\b(guarantee|promise|guaranteed approval)\b/i,
  /\b(approve my (form|application))\b/i,
  /\b(paisa kab aayega|paisa milega|paise kab milenge)\b/i,
  /\b(pass hoga ya nahi|approve hoga)\b/i,
];

/**
 * Validates user input before RAG retrieval and generation
 * Governed by Spec 13 Section 5 and AGENTS.md Rule P2.
 */
export function validateAssistantInput(rawQuery: string): SafetyCheckResult {
  // 1. Sanitize PII
  const sanitised = sanitiseText(rawQuery || '');
  const text = sanitised.maskedText.trim();
  const lower = text.toLowerCase();

  // 2. Prompt injection check
  for (const re of PROMPT_INJECTION_PATTERNS) {
    if (re.test(lower)) {
      return {
        isSafe: false,
        reason: 'prompt_injection',
        sanitisedQuery: text,
        refusalEn: 'I can only provide guidance on official scholarship rules and application procedures. I cannot execute instructions that bypass system safety guidelines.',
        refusalHi: 'मैं केवल आधिकारिक छात्रवृत्ति नियमों और आवेदन प्रक्रियाओं पर मार्गदर्शन प्रदान कर सकता हूँ। मैं ऐसे निर्देशों का पालन नहीं कर सकता जो सुरक्षा दिशा-निर्देशों का उल्लंघन करते हैं।',
      };
    }
  }

  for (const phrase of PROMPT_INJECTION_PHRASES_HI) {
    if (text.includes(phrase)) {
      return {
        isSafe: false,
        reason: 'prompt_injection',
        sanitisedQuery: text,
        refusalEn: 'I can only provide guidance on official scholarship rules and application procedures. I cannot execute instructions that bypass system safety guidelines.',
        refusalHi: 'मैं केवल आधिकारिक छात्रवृत्ति नियमों और आवेदन प्रक्रियाओं पर मार्गदर्शन प्रदान कर सकता हूँ। मैं ऐसे निर्देशों का पालन नहीं कर सकता जो सुरक्षा दिशा-निर्देशों का उल्लंघन करते हैं।',
      };
    }
  }

  // 3. Decision / Approval request check (Rule P2)
  for (const re of DECISION_REQUEST_PATTERNS) {
    if (re.test(lower)) {
      return {
        isSafe: false,
        reason: 'decision_request',
        sanitisedQuery: text,
        refusalEn: 'ScholarSaathi explains scholarship guidelines and portal remarks; we cannot approve applications or guarantee fund disbursement. Only the official portal and verifying officers evaluate eligibility.',
        refusalHi: 'स्कॉलर साथी छात्रवृत्ति दिशा-निर्देशों और पोर्टल टिप्पणियों का अर्थ समझाती है; हम आवेदन स्वीकृत नहीं करते और न ही भुगतान की गारंटी दे सकते हैं। केवल आधिकारिक पोर्टल और सत्यापन अधिकारी पात्रता का निर्णय करते हैं।',
      };
    }
  }

  return {
    isSafe: true,
    sanitisedQuery: text,
  };
}

/**
 * Validates generated assistant output against forbidden phrase rules (Gate G2/G6)
 */
export function validateAssistantOutput(text: string): boolean {
  const result = checkForbiddenPhrases(text);
  return !result.hasForbidden;
}
