// ============================================================================
// Rich Rlephant Marketing Whatsapp API - Master Test Suite Runner
// ============================================================================

import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDir = path.resolve(__dirname, '../tests/unit');
const securityDir = path.resolve(__dirname, '../tests/security');
const e2eDir = path.resolve(__dirname, '../tests/e2e');

const files = [
  path.join(testDir, 'phone-normalizer.test.mjs'),
  path.join(testDir, 'crypto-vault.test.mjs'),
  path.join(testDir, 'service-window.test.mjs'),
  path.join(testDir, 'campaign-gate.test.mjs'),
  path.join(testDir, 'outbox-worker.test.mjs'),
  path.join(testDir, 'csv-importer.test.mjs'),
  path.join(testDir, 'webhook-processor.test.mjs'),
  path.join(testDir, 'campaign-lifecycle.test.mjs'),
  path.join(testDir, 'inbox-collision.test.mjs'),
  path.join(testDir, 'automation-engine.test.mjs'),
  path.join(testDir, 'api-auth-and-webhooks.test.mjs'),
  path.join(testDir, 'ai-copilot.test.mjs'),
  path.join(testDir, 'billing-and-agency.test.mjs'),
  path.join(testDir, 'super-admin-management.test.mjs'),
  path.join(testDir, 'voice-message-recording.test.mjs'),
  path.join(testDir, 'phase-01-permissions-and-ownership.test.mjs'),
  path.join(testDir, 'phase-02-contacts-and-opt-in.test.mjs'),
  path.join(testDir, 'phase-03-template-management.test.mjs'),
  path.join(securityDir, 'rls-tenant-isolation.test.mjs'),
  path.join(e2eDir, 'e2e-scenarios.test.mjs'),
  path.join(e2eDir, 'performance-and-load.test.mjs'),
];

console.log('🐘 Starting Rich Rlephant Test Suite...\n');

run({ files })
  .compose(spec)
  .pipe(process.stdout);
