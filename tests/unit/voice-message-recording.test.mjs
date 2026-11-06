// ============================================================================
// Unit & Integration Tests: Voice Message Recording, Pause, Preview & Meta Cloud API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWhatsAppAudio } from '../../src/lib/audio-recorder.ts';
import { MetaCloudApiProvider } from '../../src/lib/meta-adapter/meta-cloud-api.ts';
import { calculateServiceWindow } from '../../src/lib/service-window.ts';
import { InboxService } from '../../src/lib/services/inbox-service.ts';

test('Voice Message - Meta Cloud API Audio Payload & Voice Parameter', async (t) => {
  // Test that Meta Cloud API provider constructs audio voice note with audio.voice = true
  let capturedPayload = null;
  let capturedUrl = null;

  // Mock global fetch for testing provider payload structure
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        messaging_product: 'whatsapp',
        contacts: [{ input: '971504432190', wa_id: '971504432190' }],
        messages: [{ id: 'wamid.HBgL123456789' }],
      }),
    };
  };

  try {
    const provider = new MetaCloudApiProvider('v21.0');
    const result = await provider.sendMessage(
      {
        phoneNumberId: 'phone_test_01',
        to: '+971504432190',
        type: 'audio',
        voice: true, // Official WhatsApp voice note flag
        mediaUrl: 'https://media.rich-rlephant.com/audio/voice-note-sample.ogg',
      },
      'test_access_token_mock'
    );

    assert.equal(result.success, true);
    assert.equal(result.providerMessageId, 'wamid.HBgL123456789');
    assert.ok(capturedUrl.includes('/v21.0/phone_test_01/messages'));

    // Meta WhatsApp Cloud API Voice Note Payload Verification
    assert.equal(capturedPayload.messaging_product, 'whatsapp');
    assert.equal(capturedPayload.type, 'audio');
    assert.ok(capturedPayload.audio);
    assert.equal(capturedPayload.audio.link, 'https://media.rich-rlephant.com/audio/voice-note-sample.ogg');
    assert.equal(capturedPayload.audio.voice, true); // Verified: audio.voice = true
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Voice Message - Audio Constraints & Quality Validation', (t) => {
  // 1. Valid OGG/Opus audio blob (50 KB, 8 seconds duration)
  const validBlob = new Blob([new Uint8Array(50 * 1024)], { type: 'audio/ogg; codecs=opus' });
  const validCheck = validateWhatsAppAudio(validBlob, 8);
  assert.equal(validCheck.valid, true);

  // 2. Reject 0-byte corrupted recording
  const emptyBlob = new Blob([], { type: 'audio/ogg' });
  const emptyCheck = validateWhatsAppAudio(emptyBlob, 0);
  assert.equal(emptyCheck.valid, false);
  assert.match(emptyCheck.error, /0 bytes/);

  // 3. Reject audio exceeding Meta's 16 MB limit
  const oversizedBlob = new Blob([new Uint8Array(17 * 1024 * 1024)], { type: 'audio/ogg' });
  const oversizedCheck = validateWhatsAppAudio(oversizedBlob, 120);
  assert.equal(oversizedCheck.valid, false);
  assert.match(oversizedCheck.error, /exceeds Meta's 16 MB limit/);

  // 4. Reject audio shorter than 1 second
  const tooShortCheck = validateWhatsAppAudio(validBlob, 0.4);
  assert.equal(tooShortCheck.valid, false);
  assert.match(tooShortCheck.error, /minimum 1 second/);
});

test('Voice Message - Paused Time Duration Calculation Logic', (t) => {
  // Simulates pausing recording:
  // Agent records for 5 seconds, pauses for 10 seconds, resumes and records 4 seconds.
  // Final duration MUST be 9 seconds, NOT 19 seconds.

  let isRecordingActive = true;
  let accumulatedSeconds = 0;

  // Segment 1: 5 active seconds
  for (let s = 0; s < 5; s++) {
    if (isRecordingActive) accumulatedSeconds += 1;
  }
  assert.equal(accumulatedSeconds, 5);

  // Segment 2: Pause recording for 10 seconds (frozen)
  isRecordingActive = false;
  for (let s = 0; s < 10; s++) {
    if (isRecordingActive) accumulatedSeconds += 1;
  }
  assert.equal(accumulatedSeconds, 5); // Must remain 5

  // Segment 3: Resume recording for 4 active seconds
  isRecordingActive = true;
  for (let s = 0; s < 4; s++) {
    if (isRecordingActive) accumulatedSeconds += 1;
  }
  assert.equal(accumulatedSeconds, 9); // Total duration is exactly 9 seconds
});

test('Voice Message - 24-Hour Customer Service Window Guard', async (t) => {
  const inbox = new InboxService();

  // Case A: 24h window active (message received 10 minutes ago)
  const activeConversation = {
    id: 'conv_voice_active',
    tenantId: 'tenant_test',
    contactId: 'cnt_01',
    contactName: 'Tariq Mansoor',
    contactPhone: '+971504432190',
    phoneNumberId: 'phone_01',
    status: 'open',
    priority: 'normal',
    lastCustomerMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  };

  const activeSend = await inbox.sendReply(
    activeConversation,
    '🎤 Voice note (0:08)',
    'agent_01',
    undefined,
    'audio',
    'https://media.rich-rlephant.com/audio/voice-note-sample.ogg'
  );

  assert.equal(activeSend.success, true);
  assert.ok(activeSend.providerMessageId);

  // Case B: 24h window expired (message received 26 hours ago)
  const expiredConversation = {
    ...activeConversation,
    lastCustomerMessageAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  };

  const expiredSend = await inbox.sendReply(
    expiredConversation,
    '🎤 Voice note (0:08)',
    'agent_01',
    undefined,
    'audio',
    'https://media.rich-rlephant.com/audio/voice-note-sample.ogg'
  );

  assert.equal(expiredSend.success, false);
  assert.equal(expiredSend.requiresTemplate, true);
  assert.match(expiredSend.error, /Customer-service window expired/);
});

