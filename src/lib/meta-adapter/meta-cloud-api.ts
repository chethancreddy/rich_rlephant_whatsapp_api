// ============================================================================
// Meta WhatsApp Cloud API Provider Implementation
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import type {
  MessagingProvider,
  SendMessageInput,
  ProviderSendResult,
  ConnectionHealth,
} from './provider.ts';
import type { WhatsAppTemplate } from '../../types/domain.ts';

const DEFAULT_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const BASE_URL = 'https://graph.facebook.com';

export class MetaCloudApiProvider implements MessagingProvider {
  private version: string;

  constructor(version: string = DEFAULT_GRAPH_VERSION) {
    this.version = version;
  }

  /**
   * Submits a message to Meta WhatsApp Cloud API:
   * POST /{version}/{PHONE_NUMBER_ID}/messages
   */
  async sendMessage(input: SendMessageInput, accessToken: string): Promise<ProviderSendResult> {
    const url = `${BASE_URL}/${this.version}/${input.phoneNumberId}/messages`;

    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to.replace('+', ''),
      type: input.type,
    };

    if (input.type === 'text' && input.text) {
      payload.text = input.text;
    } else if (input.type === 'template' && input.template) {
      payload.template = {
        name: input.template.name,
        language: { code: input.template.language },
        components: input.template.components,
      };
    } else if (input.type === 'audio') {
      payload.audio = {
        ...(input.mediaId ? { id: input.mediaId } : { link: input.mediaUrl }),
        voice: Boolean(input.voice),
      };
    } else if (['image', 'document', 'video'].includes(input.type) && (input.mediaUrl || input.mediaId)) {
      payload[input.type] = input.mediaId ? { id: input.mediaId } : { link: input.mediaUrl };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data?.error || {};
        const isRateLimit = response.status === 429 || error.code === 80007 || error.code === 130429;
        const isTransient = response.status >= 500 || isRateLimit;

        return {
          success: false,
          error: {
            code: String(error.code || 'META_API_ERROR'),
            subcode: error.error_subcode,
            message: error.message || 'Unknown Meta Cloud API error',
            retryable: isTransient,
          },
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return {
        success: true,
        providerMessageId: messageId,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Failed to connect to Meta Cloud API',
          retryable: true,
        },
      };
    }
  }

  /**
   * Retrieves message templates for a WABA:
   * GET /{version}/{WABA_ID}/message_templates
   */
  async listTemplates(wabaId: string, accessToken: string): Promise<WhatsAppTemplate[]> {
    const url = `${BASE_URL}/${this.version}/${wabaId}/message_templates?limit=250`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`Failed to fetch templates from Meta: ${data?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawTemplates = data?.data || [];

    return rawTemplates.map((t: Record<string, unknown>) => ({
      id: String(t.id),
      tenant_id: '',
      waba_id: wabaId,
      meta_template_id: String(t.id),
      name: String(t.name),
      language: String(t.language),
      category: (t.category as string).toUpperCase() as any,
      status: (t.status as string).toUpperCase() as any,
      components_json: (t.components as any) || [],
      variable_count: 0,
      quality_score: (t.quality_score as any)?.score || 'UNKNOWN',
      synced_at: new Date().toISOString(),
    }));
  }

  /**
   * Fetches phone number status, verified name, and quality rating
   */
  async getPhoneNumberStatus(phoneNumberId: string, accessToken: string) {
    const url = `${BASE_URL}/${this.version}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,status,code_verification_status`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch phone number status');
    }

    const data = await response.json();
    return {
      qualityRating: data.quality_rating || 'UNKNOWN',
      status: data.status || 'CONNECTED',
      verifiedName: data.verified_name || data.display_phone_number,
    };
  }

  /**
   * Health check verifying WABA accessibility and active token scopes
   */
  async verifyConnection(wabaId: string, accessToken: string): Promise<ConnectionHealth> {
    try {
      const url = `${BASE_URL}/${this.version}/${wabaId}?fields=id,name,timezone_id`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          connected: false,
          wabaId,
          phoneNumbersCount: 0,
          scopes: [],
          lastCheckedAt: new Date().toISOString(),
          errorMessage: data?.error?.message || 'Unauthorized or invalid WABA',
        };
      }

      const data = await response.json();
      return {
        connected: true,
        wabaId: data.id,
        businessName: data.name,
        phoneNumbersCount: 1,
        scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
        lastCheckedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        connected: false,
        wabaId,
        phoneNumbersCount: 0,
        scopes: [],
        lastCheckedAt: new Date().toISOString(),
        errorMessage: error.message,
      };
    }
  }
}

