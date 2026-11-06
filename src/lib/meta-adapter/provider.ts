// ============================================================================
// Messaging Provider Interface Abstraction
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import type { MessageCategory, MessageType, WhatsAppTemplate } from '../../types/domain.ts';

export interface SendMessageInput {
  phoneNumberId: string;
  to: string; // E.164
  type: MessageType;
  category?: MessageCategory;
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: string;
    components: Array<{
      type: 'header' | 'body' | 'button';
      sub_type?: string;
      index?: number;
      parameters: Array<{
        type: 'text' | 'image' | 'document' | 'video' | 'payload';
        text?: string;
        image?: { link: string };
        payload?: string;
      }>;
    }>;
  };
  mediaUrl?: string;
  mediaId?: string;
  voice?: boolean; // For WhatsApp Voice Notes (audio.voice = true in Graph API v21.0+)
  idempotencyKey?: string;
}

export interface ProviderSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: {
    code: string;
    subcode?: number;
    message: string;
    retryable: boolean;
  };
}

export interface ConnectionHealth {
  connected: boolean;
  wabaId: string;
  businessName?: string;
  phoneNumbersCount: number;
  scopes: string[];
  lastCheckedAt: string;
  errorMessage?: string;
}

export interface MessagingProvider {
  sendMessage(input: SendMessageInput, accessToken: string): Promise<ProviderSendResult>;
  listTemplates(wabaId: string, accessToken: string): Promise<WhatsAppTemplate[]>;
  getPhoneNumberStatus(phoneNumberId: string, accessToken: string): Promise<{
    qualityRating: string;
    status: string;
    verifiedName: string;
  }>;
  verifyConnection(wabaId: string, accessToken: string): Promise<ConnectionHealth>;
}
