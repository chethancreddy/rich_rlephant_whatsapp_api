// ============================================================================
// Campaign Service & Outbox Enqueuer
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { evaluateRecipientEligibility, type EligibilityCandidate } from '../campaign-gate.ts';
import type { CampaignPreflightResult, MessageCategory } from '../../types/domain.ts';

export interface CampaignDefinition {
  id: string;
  tenantId: string;
  name: string;
  phoneNumberId: string;
  templateName: string;
  templateCategory: MessageCategory;
  templateStatus: string;
  recipients: EligibilityCandidate[];
  pacingMessagesPerMinute: number;
}

/**
 * Executes preflight eligibility check over a candidate audience
 */
export function calculateCampaignPreflight(
  campaign: CampaignDefinition,
  destinationCountry: string = 'AE'
): CampaignPreflightResult {
  let eligibleCount = 0;
  let noConsentCount = 0;
  let suppressedCount = 0;
  let invalidPhoneCount = 0;
  let templateIneligibleCount = 0;

  for (const recipient of campaign.recipients) {
    const evalResult = evaluateRecipientEligibility(
      recipient,
      campaign.templateCategory,
      campaign.templateStatus
    );

    if (evalResult.isEligible) {
      eligibleCount++;
    } else {
      switch (evalResult.exclusionReason) {
        case 'NO_VALID_CONSENT':
          noConsentCount++;
          break;
        case 'SUPPRESSED_OPT_OUT':
          suppressedCount++;
          break;
        case 'INVALID_PHONE_FORMAT':
          invalidPhoneCount++;
          break;
        case 'TEMPLATE_NOT_APPROVED':
          templateIneligibleCount++;
          break;
      }
    }
  }

  // Versioned approximate Meta rate for estimates (e.g. $0.038 for Marketing in UAE)
  const unitRateUSD = campaign.templateCategory === 'MARKETING' ? 0.038 : 0.015;
  const estimatedAmount = Number((eligibleCount * unitRateUSD).toFixed(2));

  return {
    campaign_id: campaign.id,
    total_selected: campaign.recipients.length,
    eligible: eligibleCount,
    excluded: {
      no_valid_consent: noConsentCount,
      opted_out_suppressed: suppressedCount,
      invalid_phone_format: invalidPhoneCount,
      template_ineligible: templateIneligibleCount,
    },
    estimated_cost: {
      amount: estimatedAmount,
      currency: 'USD',
      is_live_estimate: true,
    },
    warnings:
      campaign.templateStatus !== 'APPROVED'
        ? ['Template is not currently APPROVED by Meta. Sending is blocked.']
        : [],
  };
}

/**
 * Builds durable outbox jobs for eligible recipients
 */
export function buildOutboxJobsForCampaign(
  campaign: CampaignDefinition,
  idempotencyKeyPrefix: string
) {
  const jobs = [];

  for (let i = 0; i < campaign.recipients.length; i++) {
    const recipient = campaign.recipients[i];
    const evalResult = evaluateRecipientEligibility(
      recipient,
      campaign.templateCategory,
      campaign.templateStatus
    );

    if (evalResult.isEligible) {
      jobs.push({
        id: `job_${campaign.id}_${i}`,
        tenant_id: campaign.tenantId,
        job_type: 'send_message',
        aggregate_id: campaign.id,
        idempotency_key: `${idempotencyKeyPrefix}_${recipient.contactId}`,
        payload_json: {
          messageInput: {
            phoneNumberId: campaign.phoneNumberId,
            to: evalResult.phoneE164,
            type: 'template',
            category: campaign.templateCategory,
            template: {
              name: campaign.templateName,
              language: 'en',
              components: [],
            },
          },
          hasConsent: true,
          isSuppressed: false,
          templateStatus: campaign.templateStatus,
          accessToken: 'vault_encrypted_ref',
        },
        attempts: 0,
      });
    }
  }

  return jobs;
}
