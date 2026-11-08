// ============================================================================
// Inbound Webhook Event Processor
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { normalizePhoneE164 } from '../phone-normalizer.ts';

export interface MetaWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  button?: { text: string; payload: string };
  interactive?: { button_reply?: { id: string; title: string } };
}

export interface MetaWebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message: string }>;
}

export interface ProcessedEventResult {
  eventType: 'inbound_message' | 'message_status' | 'opt_out_suppression' | 'unhandled';
  success: boolean;
  messageId?: string;
  contactPhone?: string;
  newStatus?: string;
  isOptOut?: boolean;
  textBody?: string;
  contactName?: string;
  phoneNumberId?: string;
  wabaId?: string;
  errorCode?: string;
  errorMessage?: string;
}

const OPT_OUT_KEYWORDS = new Set(['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPT OUT', 'END', 'QUIT']);

/**
 * Parses and processes raw Meta Cloud API webhook events
 */
export function processMetaWebhookEvent(entry: any): ProcessedEventResult[] {
  const results: ProcessedEventResult[] = [];

  if (!entry?.changes || !Array.isArray(entry.changes)) {
    return results;
  }

  const wabaId = entry.id;

  for (const change of entry.changes) {
    const value = change.value;
    if (!value || value.messaging_product !== 'whatsapp') {
      continue;
    }

    const phoneNumberId = value.metadata?.phone_number_id;
    const contactProfileName = value.contacts?.[0]?.profile?.name;

    // 1. Process Inbound Messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const msg of value.messages as MetaWebhookMessage[]) {
        const phoneResult = normalizePhoneE164(msg.from);
        const textBody = msg.text?.body?.trim() || msg.button?.text?.trim() || '';
        const isOptOut = OPT_OUT_KEYWORDS.has(textBody.toUpperCase());

        results.push({
          eventType: isOptOut ? 'opt_out_suppression' : 'inbound_message',
          success: true,
          messageId: msg.id,
          contactPhone: phoneResult.e164 || `+${msg.from}`,
          isOptOut,
          textBody,
          contactName: contactProfileName || 'WhatsApp Customer',
          phoneNumberId,
          wabaId,
        });
      }
    }

    // 2. Process Outbound Message Delivery Status Updates
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const st of value.statuses as MetaWebhookStatus[]) {
        const firstError = st.errors?.[0];
        results.push({
          eventType: 'message_status',
          success: true,
          messageId: st.id,
          newStatus: st.status,
          errorCode: firstError?.code ? String(firstError.code) : undefined,
          errorMessage: firstError ? `${firstError.title}: ${firstError.message}` : undefined,
        });
      }
    }
  }

  return results;
}

