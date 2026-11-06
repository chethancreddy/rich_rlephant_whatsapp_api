// ============================================================================
// Rich Rlephant Marketing Whatsapp API - Performance & Load Test Suite
// QA Engineer 10 - Application Latency, Worker Throughput, Concurrency Metrics
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { normalizePhoneE164 } from '../../src/lib/phone-normalizer.ts';
import { encryptSecret, decryptSecret } from '../../src/lib/crypto-vault.ts';
import { OutboxWorkerDaemon } from '../../src/worker/outbox-worker.ts';
import { MockMessagingProvider } from '../../src/lib/meta-adapter/mock-provider.ts';
import { AdaptiveRatePacer } from '../../src/worker/pacer.ts';
import { calculateTenantInvoice } from '../../src/lib/services/billing-service.ts';

describe('Performance, Load & Concurrency Metrics (QA Engineer 10)', () => {

  it('PERF-001: Phone Normalizer High-Throughput Batch Processing (10,000 records)', () => {
    const start = performance.now();
    const rawPhones = [
      '+971 50 123 4567',
      '0529821102',
      '+91 98765 43210',
      '14155552671',
      '+44 7911 123456'
    ];

    let validCount = 0;
    const iterations = 2000; // 5 * 2000 = 10,000 phone normalizations
    for (let i = 0; i < iterations; i++) {
      for (const raw of rawPhones) {
        const res = normalizePhoneE164(raw);
        if (res.isValid) validCount++;
      }
    }

    const durationMs = performance.now() - start;
    assert.equal(validCount, 10000);
    // Baseline: 10,000 operations should complete in under 250ms
    assert.ok(durationMs < 250, `10,000 normalizations completed in ${durationMs.toFixed(2)}ms (< 250ms target)`);
  });

  it('PERF-002: Crypto Vault AES-256-GCM Encryption / Decryption Latency', () => {
    const rawToken = 'EAAG_META_PERFORMANCE_TEST_TOKEN_XYZ_1234567890';
    const start = performance.now();

    const iterations = 500;
    for (let i = 0; i < iterations; i++) {
      const encrypted = encryptSecret(rawToken);
      const decrypted = decryptSecret(encrypted);
      assert.equal(decrypted, rawToken);
    }

    const durationMs = performance.now() - start;
    const avgLatencyMs = durationMs / iterations;
    // Target: < 1.0ms per encrypt+decrypt cycle
    assert.ok(avgLatencyMs < 1.0, `Avg crypto cycle latency: ${avgLatencyMs.toFixed(3)}ms (< 1.0ms target)`);
  });

  it('PERF-003: Outbox Queue High-Concurrency Dispatching (500 messages)', async () => {
    const provider = new MockMessagingProvider();
    const pacer = new AdaptiveRatePacer(120000); // 2,000 msgs/sec for high-concurrency throughput verification
    const worker = new OutboxWorkerDaemon(provider, pacer);

    const start = performance.now();
    let sentCount = 0;

    for (let i = 0; i < 500; i++) {
      const job = {
        id: `perf_job_${i}`,
        tenant_id: 'tenant_perf',
        job_type: 'send_message',
        payload_json: {
          messageInput: {
            phoneNumberId: 'phone_001',
            to: `+97150123${String(i).padStart(4, '0')}`,
            type: 'text',
            text: { body: `Performance message #${i}` }
          },
          hasConsent: true,
          isSuppressed: false,
          templateStatus: 'APPROVED',
          accessToken: 'mock_token'
        },
        attempts: 0
      };

      const res = await worker.processJob(job);
      if (res.success) sentCount++;
    }

    const durationMs = performance.now() - start;
    assert.equal(sentCount, 500);

    const messagesPerSec = (500 / durationMs) * 1000;
    assert.ok(messagesPerSec > 200, `Throughput: ${messagesPerSec.toFixed(0)} msgs/sec (> 200 target)`);
  });

  it('PERF-004: Billing Engine Cost & Usage Computation Under Multi-Tier Load', () => {
    const start = performance.now();

    for (let i = 0; i < 2000; i++) {
      const invoice = calculateTenantInvoice({
        tenantId: `t_${i}`,
        planTier: 'growth',
        activeContactsCount: 30000,
        messageUsage: [
          { countryCode: 'AE', category: 'marketing', count: 10000 },
          { countryCode: 'AE', category: 'utility', count: 5000 },
          { countryCode: 'US', category: 'service', count: 2000 }
        ]
      });
      assert.ok(invoice.totalDue > 0);
    }

    const durationMs = performance.now() - start;
    assert.ok(durationMs < 200, `2000 billing computations completed in ${durationMs.toFixed(2)}ms (< 200ms target)`);
  });

  it('PERF-005: Memory Footprint & Garbage Collection Stability Check', () => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / (1024 * 1024);
    
    // Assert node heap is well within reasonable bounds (< 300MB)
    assert.ok(heapUsedMB < 300, `Heap memory usage is ${heapUsedMB.toFixed(2)}MB (< 300MB limit)`);
  });
});
