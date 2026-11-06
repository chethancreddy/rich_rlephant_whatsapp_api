// ============================================================================
// Unit Tests: AI Copilot, Knowledge Retrieval & Guardrails
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectMessageIntent,
  retrieveTenantKnowledge,
  generateReplySuggestion,
  summarizeConversation,
} from '../../src/lib/services/ai-copilot.ts';

test('AI Copilot - Intent Detection', (t) => {
  assert.equal(detectMessageIntent('STOP'), 'opt_out');
  assert.equal(detectMessageIntent('Please unsubscribe me'), 'opt_out');
  assert.equal(detectMessageIntent('I need to speak to a human representative'), 'human_handover');
  assert.equal(detectMessageIntent('How much does the growth plan cost?'), 'pricing');
  assert.equal(detectMessageIntent('The system has an error and is not working'), 'support');
  assert.equal(detectMessageIntent('Hello good morning!'), 'greeting');
  assert.equal(detectMessageIntent('What is your refund policy?'), 'faq');
});

test('AI Copilot - Strict Tenant Isolation & Knowledge Retrieval', (t) => {
  const multiTenantKnowledge = [
    {
      id: 'kb_t1_1',
      tenant_id: 'tenant_company_alpha',
      source_title: 'Alpha Secret Pricing',
      content: 'Alpha secret VIP rate is $500 per month.',
      keywords: ['pricing', 'rate', 'vip'],
    },
    {
      id: 'kb_t2_1',
      tenant_id: 'tenant_company_beta',
      source_title: 'Beta Product Catalog',
      content: 'Beta sells organic tea at $20 a tin.',
      keywords: ['tea', 'organic', 'pricing'],
    },
  ];

  // Beta queries pricing: must NEVER see Alpha's confidential pricing
  const betaResults = retrieveTenantKnowledge('tenant_company_beta', 'What is the pricing?', multiTenantKnowledge);
  assert.equal(betaResults.length, 1);
  assert.equal(betaResults[0].tenant_id, 'tenant_company_beta');
  assert.match(betaResults[0].content, /organic tea/);
  assert.ok(!betaResults.some(c => c.tenant_id === 'tenant_company_alpha'));

  // Alpha queries pricing: gets Alpha's data only
  const alphaResults = retrieveTenantKnowledge('tenant_company_alpha', 'What is the pricing?', multiTenantKnowledge);
  assert.equal(alphaResults.length, 1);
  assert.equal(alphaResults[0].tenant_id, 'tenant_company_alpha');
  assert.match(alphaResults[0].content, /Alpha secret VIP/);
});

test('AI Copilot - Reply Suggestion Guardrails & 24h Window', (t) => {
  const knowledgeBase = [
    {
      id: 'kb_1',
      tenant_id: 'tenant_uae',
      source_title: 'Office Location',
      content: 'Our Dubai headquarters is at Business Bay, Tower 1.',
      keywords: ['location', 'office', 'dubai'],
    },
  ];

  // Case A: 24h Window is ACTIVE
  const activeSuggestion = generateReplySuggestion({
    tenantId: 'tenant_uae',
    customerName: 'Rashid',
    lastCustomerMessage: 'Where is your office located in Dubai?',
    lastCustomerInboundAt: new Date().toISOString(),
    conversationHistory: [],
    knowledgeBase,
  });

  assert.equal(activeSuggestion.canSendFreeform, true);
  assert.equal(activeSuggestion.requiresTemplate, false);
  assert.match(activeSuggestion.suggestedReply, /Business Bay/);
  assert.equal(activeSuggestion.policyNotes.length, 0);

  // Case B: 24h Window is EXPIRED
  const expiredInbound = new Date(Date.now() - 30 * 3600 * 1000).toISOString();
  const expiredSuggestion = generateReplySuggestion({
    tenantId: 'tenant_uae',
    customerName: 'Rashid',
    lastCustomerMessage: 'Where is your office located in Dubai?',
    lastCustomerInboundAt: expiredInbound,
    conversationHistory: [],
    knowledgeBase,
  });

  assert.equal(expiredSuggestion.canSendFreeform, false);
  assert.equal(expiredSuggestion.requiresTemplate, true);
  assert.ok(expiredSuggestion.policyNotes.some(note => note.includes('ALERT: 24-hour service window is closed')));

  // Case C: Opt-out request
  const optOutSuggestion = generateReplySuggestion({
    tenantId: 'tenant_uae',
    customerName: 'Rashid',
    lastCustomerMessage: 'STOP',
    lastCustomerInboundAt: new Date().toISOString(),
    conversationHistory: [],
    knowledgeBase,
  });

  assert.equal(optOutSuggestion.detectedIntent, 'opt_out');
  assert.ok(optOutSuggestion.policyNotes.some(note => note.includes('COMPLIANCE NOTE')));
  assert.match(optOutSuggestion.suggestedReply, /unsubscribed/);
});

test('AI Copilot - Conversation Summarization', (t) => {
  const messages = [
    { id: '1', sender: 'customer', body: 'Hi, I need help with an issue', createdAt: '2026-11-06T10:00:00Z' },
    { id: '2', sender: 'agent', body: 'Sure, what is happening?', createdAt: '2026-11-06T10:01:00Z' },
    { id: '3', sender: 'customer', body: 'Can you please connect me with a human agent?', createdAt: '2026-11-06T10:02:00Z' },
  ];

  const summary = summarizeConversation('conv_test_100', messages);
  assert.equal(summary.conversationId, 'conv_test_100');
  assert.equal(summary.resolutionStatus, 'requires_human_attention');
  assert.match(summary.recommendedNextAction, /senior support agent/);
});

