import test from 'node:test';
import assert from 'node:assert/strict';

import { AutomationEngine } from '../../src/lib/services/automation-engine.ts';

test('Visual Automation Journey Engine', async (t) => {
  const engine = new AutomationEngine();

  const mockFlow = {
    id: 'flow_support',
    tenantId: 't1',
    name: 'Customer Greeting Flow',
    status: 'published',
    triggerKeywords: ['hi', 'hello', 'support'],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        title: 'Keyword Trigger',
        config: {},
        nextStepId: 'node_2',
      },
      {
        id: 'node_2',
        type: 'condition',
        title: 'Window Check',
        config: { checkType: 'is_service_window_active' },
        conditionBranches: {
          trueNextStepId: 'node_3',
          falseNextStepId: 'node_4',
        },
      },
      {
        id: 'node_3',
        type: 'action_send_message',
        title: 'Send Free Text Menu',
        config: { text: 'Welcome! How can we help you?' },
        nextStepId: 'node_5',
      },
      {
        id: 'node_4',
        type: 'action_send_message',
        title: 'Send Re-engagement Template',
        config: { templateName: 'customer_reengagement' },
        nextStepId: 'node_5',
      },
      {
        id: 'node_5',
        type: 'handover',
        title: 'Agent Handover',
        config: { reason: 'User reached support desk' },
      },
    ],
  };

  await t.test('Matches keywords case-insensitively', () => {
    assert.equal(engine.matchesTrigger(mockFlow, 'Hello there'), true);
    assert.equal(engine.matchesTrigger(mockFlow, 'HI'), true);
    assert.equal(engine.matchesTrigger(mockFlow, 'unrelated message'), false);
  });

  await t.test('Executes true branch when 24h service window is active and triggers handover', () => {
    const context = {
      flowId: 'flow_support',
      contactId: 'c1',
      contactPhone: '+971501234567',
      contactTags: [],
      lastCustomerMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
      inboundText: 'hello',
      logs: [],
    };

    const res = engine.executeFlow(mockFlow, context);
    assert.equal(res.status, 'handed_over');
    assert.equal(res.finalStepId, 'node_5');
    assert.equal(res.handoverReason, 'User reached support desk');
    assert.ok(res.logs.some((l) => l.includes('Service window check: Active')));
  });

  await t.test('Executes false branch when 24h service window is expired', () => {
    const context = {
      flowId: 'flow_support',
      contactId: 'c2',
      contactPhone: '+971559821102',
      contactTags: [],
      lastCustomerMessageAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30h ago
      inboundText: 'hello',
      logs: [],
    };

    const res = engine.executeFlow(mockFlow, context);
    assert.equal(res.status, 'handed_over');
    assert.ok(res.logs.some((l) => l.includes('Service window check: Expired')));
  });
});

