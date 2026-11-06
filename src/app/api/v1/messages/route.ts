// ============================================================================
// Public Developer REST API: Outbound Message Dispatcher (v1)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/services/api-auth';
import { normalizePhoneNumber } from '@/lib/phone-normalizer';
import { calculateServiceWindow } from '@/lib/service-window';
import { MockMessagingProvider } from '@/lib/meta-adapter/mock-provider';

// In-memory idempotency cache for deduplication
const idempotencyStore = new Map<string, { status: number; body: any; timestamp: number }>();

export async function POST(req: NextRequest) {
  // 1. Authenticate API Key with 'messages:send' scope
  const auth = await authenticateApiRequest(req, 'messages:send');
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: 'AUTH_FAILED' },
      { status: auth.statusCode || 401 }
    );
  }

  // 2. Check Idempotency-Key
  const idempotencyKey = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key');
  if (idempotencyKey) {
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.status });
    }
  }

  // 3. Parse and validate payload
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body', code: 'INVALID_PAYLOAD' },
      { status: 400 }
    );
  }

  const { to, type, text, template, contextMessageTimestamp } = body;

  if (!to || typeof to !== 'string') {
    return NextResponse.json(
      { error: "Field 'to' (recipient phone number) is required", code: 'MISSING_RECIPIENT' },
      { status: 422 }
    );
  }

  const phoneRes = normalizePhoneNumber(to);
  if (!phoneRes.isValid) {
    return NextResponse.json(
      { error: `Invalid recipient phone number format: ${phoneRes.error}`, code: 'INVALID_PHONE' },
      { status: 422 }
    );
  }

  if (!type || !['text', 'template'].includes(type)) {
    return NextResponse.json(
      { error: "Field 'type' must be either 'text' or 'template'", code: 'INVALID_MESSAGE_TYPE' },
      { status: 422 }
    );
  }

  // 4. Policy & 24-Hour Service Window Enforcement
  if (type === 'text') {
    if (!text || !text.body || typeof text.body !== 'string' || !text.body.trim()) {
      return NextResponse.json(
        { error: "Field 'text.body' is required for free-form text messages", code: 'MISSING_TEXT_BODY' },
        { status: 422 }
      );
    }

    // Determine 24-hour service window
    const lastCustomerInbound = contextMessageTimestamp
      ? new Date(contextMessageTimestamp)
      : null;

    const window = calculateServiceWindow(lastCustomerInbound);
    if (!window.isActive) {
      return NextResponse.json(
        {
          error: 'CUSTOMER_SERVICE_WINDOW_EXPIRED: Meta policy prohibits free-form text messages outside the 24-hour customer care window. Send an approved template message to re-engage.',
          code: 'SERVICE_WINDOW_EXPIRED',
          serviceWindow: window,
        },
        { status: 403 }
      );
    }
  }

  if (type === 'template') {
    if (!template || !template.name) {
      return NextResponse.json(
        { error: "Field 'template.name' is required for template messages", code: 'MISSING_TEMPLATE_NAME' },
        { status: 422 }
      );
    }
  }

  // 5. Send message via provider
  const provider = new MockMessagingProvider();
  const sendRes = await provider.sendMessage(
    {
      phoneNumberId: 'phone_demo_01',
      to: phoneRes.e164,
      type: type === 'text' ? 'text' : 'template',
      text: type === 'text' && text?.body ? { body: text.body } : undefined,
      template: type === 'template' && template?.name ? {
        name: template.name,
        language: template.language?.code || 'en_US',
        components: template.components || [],
      } : undefined,
    },
    'mock_access_token_demo'
  );

  const responseBody = {
    success: sendRes.success,
    messageId: sendRes.providerMessageId || `wamid_${Date.now()}`,
    status: sendRes.success ? 'accepted' : 'failed',
    recipient: phoneRes.e164,
    type,
    tenantId: auth.tenantId,
    createdAt: new Date().toISOString(),
  };

  // Cache idempotency if key was provided
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, {
      status: 201,
      body: responseBody,
      timestamp: Date.now(),
    });
  }

  return NextResponse.json(responseBody, { status: 201 });
}
