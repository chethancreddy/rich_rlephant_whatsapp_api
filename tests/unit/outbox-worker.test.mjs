import test from 'node:test';
import assert from 'node:assert/strict';

import { OutboxWorkerDaemon } from '../../src/worker/outbox-worker.ts';
import { MockMessagingProvider } from '../../src/lib/meta-adapter/mock-provider.ts';
import { AdaptiveRatePacer } from '../../src/worker/pacer.ts';

test('Outbox Worker Daemon & Messaging Dispatch', async (t) => {
  await t.test('Successfully dispatches eligible job to messaging provider', async () => {
    const mockProvider = new MockMessagingProvider();
    const pacer = new AdaptiveRatePacer(600); // fast for test
    const worker = new OutboxWorkerDaemon(mockProvider, pacer);

    const job = {
      id: 'job_001',
      tenant_id: 't_001',
      job_type: 'send_message',
      payload_json: {
        messageInput: {
          phoneNumberId: 'phone_001',
          to: '+971501234567',
          type: 'text',
          text: { body: 'Hello from Rich Rlephant test' },
        },
        hasConsent: true,
        isSuppressed: false,
        templateStatus: 'APPROVED',
        accessToken: 'mock_token',
      },
      attempts: 0,
    };

    const res = await worker.processJob(job);
    assert.equal(res.success, true);
    assert.ok(res.providerId?.startsWith('wamid.HBgL'));
    assert.equal(mockProvider.sentMessages.length, 1);
  });

  await t.test('Worker immediately rejects unconsented job before touching provider', async () => {
    const mockProvider = new MockMessagingProvider();
    const worker = new OutboxWorkerDaemon(mockProvider);

    const job = {
      id: 'job_002',
      tenant_id: 't_001',
      job_type: 'send_message',
      payload_json: {
        messageInput: {
          phoneNumberId: 'phone_001',
          to: '+971501234567',
          type: 'text',
        },
        hasConsent: false, // NO CONSENT
        isSuppressed: false,
        templateStatus: 'APPROVED',
        accessToken: 'mock_token',
      },
      attempts: 0,
    };

    const res = await worker.processJob(job);
    assert.equal(res.success, false);
    assert.equal(res.reason, 'NO_VALID_CONSENT');
    assert.equal(mockProvider.sentMessages.length, 0); // Zero messages dispatched
  });
});

