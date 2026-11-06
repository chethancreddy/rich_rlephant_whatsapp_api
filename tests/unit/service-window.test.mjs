import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateServiceWindow } from '../../src/lib/service-window.ts';

test('WhatsApp 24-Hour Customer-Service Window', async (t) => {
  await t.test('Active when inbound message arrived within 24 hours', () => {
    // 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const status = calculateServiceWindow(twoHoursAgo);

    assert.equal(status.isActive, true);
    assert.equal(status.requiresTemplate, false);
    assert.ok(status.remainingMinutes > 1300); // ~22 hours
  });

  await t.test('Expired when inbound message arrived 25 hours ago', () => {
    // 25 hours ago
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    const status = calculateServiceWindow(twentyFiveHoursAgo);

    assert.equal(status.isActive, false);
    assert.equal(status.requiresTemplate, true);
    assert.equal(status.remainingMinutes, 0);
  });

  await t.test('Expired when no inbound message has ever been received', () => {
    const status = calculateServiceWindow(null);
    assert.equal(status.isActive, false);
    assert.equal(status.requiresTemplate, true);
  });
});

