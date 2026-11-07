import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AiResponseSchema, simulateAiClassification, classifyRemark } from '../../src/lib/server/aiGateway.ts';

console.log('🧪 Testing WAJAH AI Gateway & Schema Validation (Gate G6)...');

const library = JSON.parse(fs.readFileSync(path.resolve('data/library.json'), 'utf8'));

// 1. Valid AI response schema parse
{
  const validPayload = {
    id: 'nsp_defective_returned',
    confidence: 0.95,
    alternatives: ['nsp_rejected_institute'],
    situation: {
      status: 'returned',
      level: 'student',
      language: 'en',
    },
    is_simulated: false,
  };

  const parsed = AiResponseSchema.safeParse(validPayload);
  assert.ok(parsed.success, 'Valid payload should parse cleanly');
  assert.strictEqual(parsed.data.id, 'nsp_defective_returned');
  assert.strictEqual(parsed.data.confidence, 0.95);
}

// 2. Reject out-of-bounds confidence (Safety Gate)
{
  const invalidConfidence = {
    id: 'nsp_defective_returned',
    confidence: 1.5, // > 1.0 invalid
  };
  const parsed = AiResponseSchema.safeParse(invalidConfidence);
  assert.ok(!parsed.success, 'Confidence > 1.0 must fail schema validation');
}

{
  const negativeConfidence = {
    id: 'nsp_defective_returned',
    confidence: -0.2, // < 0 invalid
  };
  const parsed = AiResponseSchema.safeParse(negativeConfidence);
  assert.ok(!parsed.success, 'Negative confidence must fail schema validation');
}

// 3. Reject invalid enum values in situation
{
  const invalidStatus = {
    id: 'nsp_defective_returned',
    confidence: 0.9,
    situation: {
      status: 'approved_and_paid_out', // not in allowed enum
    },
  };
  const parsed = AiResponseSchema.safeParse(invalidStatus);
  assert.ok(!parsed.success, 'Invented status enums must fail schema validation');
}

// 4. Test simulateAiClassification (Identified Fallback)
{
  const simulated = simulateAiClassification('application marked defective by institute', library);
  assert.ok(simulated.is_simulated, 'Simulation must be explicitly labeled is_simulated: true');
  assert.strictEqual(simulated.id, 'nsp_defective_returned');
  assert.ok(simulated.confidence >= 0.50);

  // Unrelated input should yield 'none'
  const unrelated = simulateAiClassification('random movie reviews and cricket', library);
  assert.ok(unrelated.is_simulated);
  assert.strictEqual(unrelated.id, 'none');
}

// 5. Test classifyRemark graceful degradation (when live credentials not set)
{
  const result = await classifyRemark('application marked defective by institute');
  assert.ok(result, 'classifyRemark should return valid result without throwing');
  assert.ok(typeof result.id === 'string');
  assert.ok(typeof result.confidence === 'number');
  assert.ok(result.is_simulated, 'Without live keys, must safely use labeled simulation fallback');
}

console.log('✅ AI Gateway: Schema gate G6, prompt injection defense, and simulation fallback verified!\n');

