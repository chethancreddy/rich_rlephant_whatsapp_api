// ============================================================================
// High-Fidelity Mock Messaging Provider (Test & Sandbox)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import type {
  MessagingProvider,
  SendMessageInput,
  ProviderSendResult,
  ConnectionHealth,
} from './provider.ts';
import type { WhatsAppTemplate } from '../../types/domain.ts';

export class MockMessagingProvider implements MessagingProvider {
  public sentMessages: SendMessageInput[] = [];
  public shouldSimulateRateLimit: boolean = false;
  public shouldSimulateFailure: boolean = false;

  async sendMessage(input: SendMessageInput, _accessToken: string): Promise<ProviderSendResult> {
    if (this.shouldSimulateRateLimit) {
      return {
        success: false,
        error: {
          code: '130429',
          message: 'Rate limit hit - Cloud API throughput exceeded',
          retryable: true,
        },
      };
    }

    if (this.shouldSimulateFailure) {
      return {
        success: false,
        error: {
          code: '100',
          message: 'Invalid parameter or template not found',
          retryable: false,
        },
      };
    }

    this.sentMessages.push(input);
    const mockId = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

    return {
      success: true,
      providerMessageId: mockId,
    };
  }

  async listTemplates(_wabaId: string, _accessToken: string): Promise<WhatsAppTemplate[]> {
    return [
      {
        id: 'tmpl_order_confirmation',
        tenant_id: 'test_tenant',
        waba_id: 'waba_mock_001',
        name: 'order_confirmation',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        components_json: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Order Confirmed: {{1}}',
          },
          {
            type: 'BODY',
            text: 'Hello {{1}}, your order #{{2}} of {{3}} is confirmed and being prepared.',
          },
          {
            type: 'FOOTER',
            text: 'Thank you for choosing Rich Rlephant',
          },
        ],
        variable_count: 3,
        quality_score: 'HIGH',
        synced_at: new Date().toISOString(),
      },
    ];
  }

  async getPhoneNumberStatus(_phoneNumberId: string, _accessToken: string) {
    return {
      qualityRating: 'GREEN',
      status: 'CONNECTED',
      verifiedName: 'Rich Rlephant Support',
    };
  }

  async verifyConnection(wabaId: string, _accessToken: string): Promise<ConnectionHealth> {
    return {
      connected: true,
      wabaId,
      businessName: 'Rich Rlephant Enterprise Sandbox',
      phoneNumbersCount: 1,
      scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
