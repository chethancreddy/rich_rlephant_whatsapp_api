import test from 'node:test';
import assert from 'node:assert/strict';

import { InboxService } from '../../src/lib/services/inbox-service.ts';
import { MockMessagingProvider } from '../../src/lib/meta-adapter/mock-provider.ts';

test('Shared Team Inbox & Agent Collision Control', async (t) => {
  const service = new InboxService(new MockMessagingProvider());

  await t.test('Agent 1 acquires exclusive collision lock on conversation', () => {
    const res = service.acquireLock('conv_101', 'agent_1', 'Sarah Jenkins');
    assert.equal(res.acquired, true);
    assert.ok(res.expiresInSeconds > 100);
  });

  await t.test('Agent 2 is blocked from acquiring lock when Agent 1 holds it', () => {
    const res = service.acquireLock('conv_101', 'agent_2', 'Chethan Reddy');
    assert.equal(res.acquired, false);
    assert.equal(res.lockedBy, 'Sarah Jenkins');
  });

  await t.test('Agent 2 successfully acquires lock after Agent 1 releases it', () => {
    service.releaseLock('conv_101', 'agent_1');
    const res = service.acquireLock('conv_101', 'agent_2', 'Chethan Reddy');
    assert.equal(res.acquired, true);
  });

  await t.test('Allows free-form message reply when 24h service window is active', async () => {
    const activeConversation = {
      id: 'conv_102',
      tenantId: 't1',
      contactId: 'c1',
      contactName: 'Tariq',
      contactPhone: '+971501234567',
      phoneNumberId: 'phone_01',
      status: 'open',
      priority: 'normal',
      lastCustomerMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
    };

    const res = await service.sendReply(activeConversation, 'Hello, delivery on way!', 'agent_2');
    assert.equal(res.success, true);
    assert.ok(res.providerMessageId?.startsWith('wamid.HBgL'));
  });

  await t.test('Blocks free-form message when 24h service window has expired', async () => {
    const expiredConversation = {
      id: 'conv_103',
      tenantId: 't1',
      contactId: 'c2',
      contactName: 'Fatima',
      contactPhone: '+971559821102',
      phoneNumberId: 'phone_01',
      status: 'open',
      priority: 'normal',
      lastCustomerMessageAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h ago
    };

    const res = await service.sendReply(expiredConversation, 'Hello Fatima!', 'agent_2');
    assert.equal(res.success, false);
    assert.equal(res.requiresTemplate, true);
  });

  await t.test('Allows approved template reply even when 24h service window has expired', async () => {
    const expiredConversation = {
      id: 'conv_104',
      tenantId: 't1',
      contactId: 'c2',
      contactName: 'Fatima',
      contactPhone: '+971559821102',
      phoneNumberId: 'phone_01',
      status: 'open',
      priority: 'normal',
      lastCustomerMessageAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h ago
    };

    const res = await service.sendReply(
      expiredConversation,
      '',
      'agent_2',
      'order_confirmation' // Approved template
    );
    assert.equal(res.success, true);
    assert.ok(res.providerMessageId?.startsWith('wamid.HBgL'));
  });
});

