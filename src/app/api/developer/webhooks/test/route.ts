// ============================================================================
// Developer Portal: Webhook Test Dispatcher
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { signOutboundPayload } from '@/lib/crypto-vault';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url, secret, eventType } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: "Field 'url' is required" }, { status: 422 });
  }

  const selectedEvent = eventType || 'message.delivered';
  const testPayload = {
    event: selectedEvent,
    deliveryId: `del_test_${Date.now()}`,
    timestamp: new Date().toISOString(),
    tenantId: 'tenant_default',
    data: {
      messageId: 'wamid_test_demo_998877',
      recipientPhone: '+971501234567',
      status: 'delivered',
      priceUSD: 0.033,
      simulated: true,
    },
  };

  const payloadJson = JSON.stringify(testPayload);
  const signature = signOutboundPayload(payloadJson, secret || 'whsec_test_secret_12345');

  // Attempt real HTTP dispatch with 4-second timeout if valid URL, or simulate for mock destinations
  const isMockUrl = url.includes('acmeretail.com') || url.includes('example.com');
  
  if (isMockUrl) {
    return NextResponse.json({
      success: true,
      delivered: true,
      statusCode: 200,
      latencyMs: 124,
      payload: testPayload,
      headersSent: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'User-Agent': 'Rich-Rlephant-Webhook-Engine/1.0',
      },
      responseBody: '{"received":true,"status":"accepted"}',
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const startTime = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'User-Agent': 'Rich-Rlephant-Webhook-Engine/1.0',
      },
      body: payloadJson,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;
    const responseText = await res.text();

    return NextResponse.json({
      success: res.ok,
      delivered: true,
      statusCode: res.status,
      latencyMs,
      payload: testPayload,
      headersSent: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'User-Agent': 'Rich-Rlephant-Webhook-Engine/1.0',
      },
      responseBody: responseText.slice(0, 500),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      delivered: false,
      statusCode: 504,
      error: err.message || 'Connection timeout or connection refused',
      payload: testPayload,
      headersSent: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
      },
    }, { status: 200 }); // Return 200 envelope with failure details for UI inspector
  }
}

