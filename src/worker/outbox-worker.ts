// ============================================================================
// Durable Transactional Outbox Worker Daemon
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { AdaptiveRatePacer } from './pacer.ts';
import type { MessagingProvider, SendMessageInput } from '../lib/meta-adapter/provider.ts';
import { MockMessagingProvider } from '../lib/meta-adapter/mock-provider.ts';
import { evaluateRecipientEligibility } from '../lib/campaign-gate.ts';

export interface OutboxJob {
  id: string;
  tenant_id: string;
  job_type: 'send_message' | 'process_campaign';
  payload_json: {
    messageInput: SendMessageInput;
    hasConsent: boolean;
    isSuppressed: boolean;
    templateStatus: string;
    accessToken: string;
  };
  attempts: number;
}

export class OutboxWorkerDaemon {
  private isRunning: boolean = false;
  private pacer: AdaptiveRatePacer;
  private provider: MessagingProvider;

  constructor(provider?: MessagingProvider, pacer?: AdaptiveRatePacer) {
    this.provider = provider || new MockMessagingProvider();
    this.pacer = pacer || new AdaptiveRatePacer(60);
  }

  /**
   * Processes an individual send_message job with immediate pre-check barrier
   */
  async processJob(job: OutboxJob): Promise<{ success: boolean; reason?: string; providerId?: string }> {
    const { messageInput, hasConsent, isSuppressed, templateStatus, accessToken } = job.payload_json;

    // 1. Re-verify recipient eligibility immediately prior to provider submission
    const preCheck = evaluateRecipientEligibility(
      {
        contactId: 'contact_id',
        phoneRaw: messageInput.to,
        hasGrantedConsent: hasConsent,
        isSuppressed: isSuppressed,
      },
      messageInput.category || 'MARKETING',
      templateStatus || 'APPROVED'
    );

    if (!preCheck.isEligible) {
      console.warn(`[Worker Pre-Check Block] Job ${job.id} blocked: ${preCheck.exclusionReason}`);
      return {
        success: false,
        reason: preCheck.exclusionReason,
      };
    }

    // 2. Comply with configured adaptive pacing
    await this.pacer.waitBeforeNextSend();

    // 3. Dispatch to Meta Cloud API via MessagingProvider
    const result = await this.provider.sendMessage(messageInput, accessToken);

    if (!result.success) {
      if (result.error?.retryable) {
        this.pacer.throttleBackoff();
      }
      return {
        success: false,
        reason: result.error?.message || 'Meta submission failed',
      };
    }

    return {
      success: true,
      providerId: result.providerMessageId,
    };
  }
}
