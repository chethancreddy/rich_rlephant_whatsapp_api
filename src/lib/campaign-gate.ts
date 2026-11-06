// ============================================================================
// Campaign Preflight & Eligibility Gate
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { normalizePhoneE164 } from './phone-normalizer.ts';

export interface EligibilityCandidate {
  contactId: string;
  phoneRaw: string;
  hasGrantedConsent: boolean;
  consentPurpose?: string;
  isSuppressed: boolean;
  suppressionReason?: string;
}

export interface EligibilityEvaluation {
  isEligible: boolean;
  phoneE164: string;
  exclusionReason?: 'NO_VALID_CONSENT' | 'SUPPRESSED_OPT_OUT' | 'INVALID_PHONE_FORMAT' | 'TEMPLATE_NOT_APPROVED';
  details?: string;
}

/**
 * Deterministic preflight check for every candidate recipient before campaign launch
 * This check is executed both at audience selection AND immediately prior to worker dispatch
 */
export function evaluateRecipientEligibility(
  candidate: EligibilityCandidate,
  targetCategory: string = 'MARKETING',
  templateStatus: string = 'APPROVED'
): EligibilityEvaluation {
  // 1. Phone number format validation
  const phoneResult = normalizePhoneE164(candidate.phoneRaw);
  if (!phoneResult.isValid) {
    return {
      isEligible: false,
      phoneE164: phoneResult.e164 || candidate.phoneRaw,
      exclusionReason: 'INVALID_PHONE_FORMAT',
      details: phoneResult.errorMessage || 'Invalid phone format',
    };
  }

  // 2. Suppression barrier (Highest precedence - immediate block)
  if (candidate.isSuppressed) {
    return {
      isEligible: false,
      phoneE164: phoneResult.e164,
      exclusionReason: 'SUPPRESSED_OPT_OUT',
      details: candidate.suppressionReason || 'Contact has opted out or is in do-not-contact registry',
    };
  }

  // 3. Template status barrier
  if (templateStatus !== 'APPROVED') {
    return {
      isEligible: false,
      phoneE164: phoneResult.e164,
      exclusionReason: 'TEMPLATE_NOT_APPROVED',
      details: `Template status is ${templateStatus}. Only APPROVED templates can be sent outside service window`,
    };
  }

  // 4. Consent evidence barrier
  if (!candidate.hasGrantedConsent) {
    return {
      isEligible: false,
      phoneE164: phoneResult.e164,
      exclusionReason: 'NO_VALID_CONSENT',
      details: `No active granted consent record found for category ${targetCategory}`,
    };
  }

  return {
    isEligible: true,
    phoneE164: phoneResult.e164,
  };
}
