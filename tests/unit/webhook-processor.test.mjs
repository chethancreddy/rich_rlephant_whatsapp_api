import test from 'node:test';
import assert from 'node:assert/strict';

import { processMetaWebhookEvent } from '../../src/lib/services/inbound-webhook-processor.ts';

test('Inbound Webhook Processor & Suppression Detector', async (t) => {
  await t.test('Detects inbound standard customer message', () => {
    const entry = {
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            messages: [
              {
                from: '971501234567',
                id: 'wamid.HBgL001',
                timestamp: '1793959320',
                type: 'text',
                text: { body: 'Hello, when is my order arriving?' },
              },
            ],
          },
        },
      ],
    };

    const results = processMetaWebhookEvent(entry);
    assert.equal(results.length, 1);
    assert.equal(results[0].eventType, 'inbound_message');
    assert.equal(results[0].contactPhone, '+971501234567');
    assert.equal(results[0].isOptOut, false);
  });

  await t.test('Detects STOP keyword and flags instant opt-out suppression', () => {
    const entry = {
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            messages: [
              {
                from: '971509998888',
                id: 'wamid.HBgL002',
                timestamp: '1793959325',
                type: 'text',
                text: { body: 'STOP' },
              },
            ],
          },
        },
      ],
    };

    const results = processMetaWebhookEvent(entry);
    assert.equal(results.length, 1);
    assert.equal(results[0].eventType, 'opt_out_suppression');
    assert.equal(results[0].isOptOut, true);
    assert.equal(results[0].contactPhone, '+971509998888');
  });

  await t.test('Processes outbound message delivery and read receipts', () => {
    const entry = {
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            statuses: [
              {
                id: 'wamid.HBgL003',
                status: 'delivered',
                timestamp: '1793959330',
                recipient_id: '971501234567',
              },
              {
                id: 'wamid.HBgL003',
                status: 'read',
                timestamp: '1793959345',
                recipient_id: '971501234567',
              },
            ],
          },
        },
      ],
    };

    const results = processMetaWebhookEvent(entry);
    assert.equal(results.length, 2);
    assert.equal(results[0].newStatus, 'delivered');
    assert.equal(results[1].newStatus, 'read');
  });
});

