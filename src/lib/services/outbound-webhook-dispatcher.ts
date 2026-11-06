// ============================================================================
// Outbound Webhook Delivery Engine & Signature Verification
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { signOutboundPayload } from '../crypto-vault.ts';

export interface WebhookEndpoint {
  id: string;
  tenant_id: string;
  url: string;
  secret: string; // Plaintext or decrypted secret
  events: string[]; // e.g. ['message.delivered', 'message.read', 'contact.opted_out']
  status: 'active' | 'disabled' | 'failing';
  failure_count: number;
}

export interface WebhookDeliveryLog {
  id: string;
  endpoint_id: string;
  event_type: string;
  payload: Record<string, any>;
  attempt: number;
  status: 'delivered' | 'failed' | 'retrying';
  response_code?: number;
  response_body?: string;
  delivered_at?: string;
}

export interface OutboundEvent {
  tenantId: string;
  eventType: string; // 'message.sent' | 'message.delivered' | 'message.read' | 'message.failed' | 'contact.opted_out'
  data: Record<string, any>;
  timestamp?: string;
}

export type HttpSender = (
  url: string,
  options: {
    method: string;
    headers: Record<string, string>;
    body: string;
    timeoutMs?: number;
  }
) => Promise<{ status: number; body: string }>;

/**
 * Standard fetch-based HTTP sender
 */
export const defaultHttpSender: HttpSender = async (url, options) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 1000) };
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Dispatches an event to all matching registered webhook endpoints for a tenant
 */
export async function dispatchOutboundEvent(
  event: OutboundEvent,
  endpoints: WebhookEndpoint[],
  sender: HttpSender = defaultHttpSender
): Promise<WebhookDeliveryLog[]> {
  const deliveryLogs: WebhookDeliveryLog[] = [];
  const eventTimestamp = event.timestamp || new Date().toISOString();

  // Find endpoints matching this tenant and event type
  const targetEndpoints = endpoints.filter(
    ep => ep.tenant_id === event.tenantId &&
          ep.status !== 'disabled' &&
          (ep.events.includes('*') || ep.events.includes(event.eventType))
  );

  for (const ep of targetEndpoints) {
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const payloadObject = {
      event: event.eventType,
      deliveryId,
      timestamp: eventTimestamp,
      tenantId: event.tenantId,
      data: event.data,
    };

    const payloadJson = JSON.stringify(payloadObject);
    const signature = signOutboundPayload(payloadJson, ep.secret);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Rich-Rlephant-Webhook-Engine/1.0',
      'X-Platform-Signature': signature,
      'X-Platform-Event': event.eventType,
      'X-Platform-Delivery-Id': deliveryId,
      'X-Platform-Timestamp': eventTimestamp,
    };

    try {
      const response = await sender(ep.url, {
        method: 'POST',
        headers,
        body: payloadJson,
        timeoutMs: 5000,
      });

      const isSuccess = response.status >= 200 && response.status < 300;

      deliveryLogs.push({
        id: deliveryId,
        endpoint_id: ep.id,
        event_type: event.eventType,
        payload: payloadObject,
        attempt: 1,
        status: isSuccess ? 'delivered' : 'failed',
        response_code: response.status,
        response_body: response.body,
        delivered_at: isSuccess ? new Date().toISOString() : undefined,
      });

      if (!isSuccess) {
        ep.failure_count += 1;
        if (ep.failure_count >= 10) {
          ep.status = 'failing';
        }
      } else {
        ep.failure_count = 0;
      }
    } catch (err: any) {
      ep.failure_count += 1;
      if (ep.failure_count >= 10) {
        ep.status = 'failing';
      }

      deliveryLogs.push({
        id: deliveryId,
        endpoint_id: ep.id,
        event_type: event.eventType,
        payload: payloadObject,
        attempt: 1,
        status: 'failed',
        response_code: 0,
        response_body: err.message || 'Network timeout or connection refused',
      });
    }
  }

  return deliveryLogs;
}

