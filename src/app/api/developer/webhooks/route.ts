// ============================================================================
// Developer Portal: Webhook Subscriptions Management API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'disabled' | 'failing';
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

// In-memory tenant webhooks store
let webhooksStore: WebhookSubscription[] = [
  {
    id: 'wh_001',
    tenantId: 'tenant_default',
    name: 'Customer CRM Sync (HubSpot)',
    url: 'https://api.acmeretail.com/webhooks/rich-rlephant',
    secret: 'whsec_8f2a91b4c3e7d56012',
    events: ['message.delivered', 'message.read', 'customer.inbound_reply'],
    status: 'active',
    createdAt: '12 Oct 2026',
    lastTriggered: '10 mins ago',
    failureCount: 0,
  },
  {
    id: 'wh_002',
    tenantId: 'tenant_default',
    name: 'Compliance & Opt-Out Stream',
    url: 'https://compliance.acmeretail.com/webhooks/opt-out',
    secret: 'whsec_99a8b7c6d5e4f3a2b1',
    events: ['contact.opted_out'],
    status: 'active',
    createdAt: '20 Oct 2026',
    lastTriggered: '2 hours ago',
    failureCount: 0,
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    total: webhooksStore.length,
    webhooks: webhooksStore,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const { name, url, events } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: "Field 'name' is required" }, { status: 422 });
  }

  if (!url || typeof url !== 'string' || (!url.startsWith('https://') && !url.startsWith('http://localhost'))) {
    return NextResponse.json(
      { error: "Field 'url' must be a valid secure HTTPS destination URL" },
      { status: 422 }
    );
  }

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: 'At least one event subscription topic must be selected' },
      { status: 422 }
    );
  }

  // Generate random webhook secret
  const chars = '0123456789abcdef';
  let secretHex = '';
  for (let i = 0; i < 24; i++) {
    secretHex += chars[Math.floor(Math.random() * chars.length)];
  }
  const secret = `whsec_${secretHex}`;

  const newWebhook: WebhookSubscription = {
    id: `wh_${Date.now()}`,
    tenantId: 'tenant_default',
    name: name.trim(),
    url: url.trim(),
    secret,
    events: [...events],
    status: 'active',
    createdAt: 'Today',
    lastTriggered: 'Never triggered',
    failureCount: 0,
  };

  webhooksStore.unshift(newWebhook);

  return NextResponse.json(
    {
      success: true,
      message: 'Webhook subscription registered successfully',
      webhook: newWebhook,
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Webhook subscription ID is required' }, { status: 400 });
  }

  const initialCount = webhooksStore.length;
  webhooksStore = webhooksStore.filter((w) => w.id !== id);

  if (webhooksStore.length === initialCount) {
    return NextResponse.json({ error: 'Webhook endpoint not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Webhook subscription deleted successfully',
  });
}

