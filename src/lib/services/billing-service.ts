// ============================================================================
// SaaS Subscription & Meta Pass-Through Billing Engine
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export type PlanTier = 'free' | 'starter' | 'growth' | 'enterprise';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  monthlyFee: number;
  includedContacts: number;
  contactOverageRate: number; // per contact beyond included limit
}

export const SAAS_PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    monthlyFee: 0,
    includedContacts: 1000,
    contactOverageRate: 0.01,
  },
  starter: {
    id: 'starter',
    name: 'Starter Pro',
    monthlyFee: 49,
    includedContacts: 5000,
    contactOverageRate: 0.008,
  },
  growth: {
    id: 'growth',
    name: 'Growth Business',
    monthlyFee: 149,
    includedContacts: 25000,
    contactOverageRate: 0.005,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Scale',
    monthlyFee: 499,
    includedContacts: 100000,
    contactOverageRate: 0.003,
  },
};

export interface MetaPricingRate {
  marketing: number;
  utility: number;
  authentication: number;
  service: number;
}

// Meta WhatsApp Cloud API Pass-Through Base Rates by Country/Region
export const META_REGIONAL_RATES: Record<string, MetaPricingRate> = {
  AE: { marketing: 0.0385, utility: 0.0195, authentication: 0.0185, service: 0.005 }, // United Arab Emirates
  IN: { marketing: 0.0105, utility: 0.0042, authentication: 0.0038, service: 0.003 }, // India
  US: { marketing: 0.0250, utility: 0.0150, authentication: 0.0140, service: 0.005 }, // United States
  DEFAULT: { marketing: 0.0500, utility: 0.0300, authentication: 0.0280, service: 0.008 }, // International Rest of World
};

export interface UsageAggregationInput {
  tenantId: string;
  planTier: PlanTier;
  activeContactsCount: number;
  messageUsage: Array<{
    countryCode: string; // e.g. 'AE', 'IN', 'US', or 'OTHER'
    category: 'marketing' | 'utility' | 'authentication' | 'service';
    count: number;
  }>;
}

export interface UsageInvoiceBreakdown {
  tenantId: string;
  planName: string;
  subscriptionFee: number;
  activeContactsCount: number;
  includedContacts: number;
  billableOverageContacts: number;
  contactOverageCost: number;
  metaPassThroughCost: number;
  totalDue: number;
  currency: string;
  itemizedMetaCharges: Array<{
    countryCode: string;
    category: string;
    count: number;
    unitRate: number;
    subtotal: number;
  }>;
}

/**
 * Calculates itemized billing statement separating SaaS subscriptions from Meta pass-through costs
 */
export function calculateTenantInvoice(input: UsageAggregationInput): UsageInvoiceBreakdown {
  const plan = SAAS_PLANS[input.planTier] || SAAS_PLANS.starter;

  // 1. Calculate Contact Overages
  const billableOverageContacts = Math.max(0, input.activeContactsCount - plan.includedContacts);
  const contactOverageCost = Number((billableOverageContacts * plan.contactOverageRate).toFixed(2));

  // 2. Calculate Meta WhatsApp Cloud API Pass-Through Costs
  let totalMetaCost = 0;
  const itemizedCharges: UsageInvoiceBreakdown['itemizedMetaCharges'] = [];

  for (const usage of input.messageUsage) {
    const regionalRates = META_REGIONAL_RATES[usage.countryCode] || META_REGIONAL_RATES.DEFAULT;
    const rate = regionalRates[usage.category] ?? regionalRates.marketing;
    const subtotal = Number((usage.count * rate).toFixed(4));
    totalMetaCost += subtotal;

    itemizedCharges.push({
      countryCode: usage.countryCode,
      category: usage.category,
      count: usage.count,
      unitRate: rate,
      subtotal,
    });
  }

  const roundedMetaCost = Number(totalMetaCost.toFixed(2));
  const totalDue = Number((plan.monthlyFee + contactOverageCost + roundedMetaCost).toFixed(2));

  return {
    tenantId: input.tenantId,
    planName: plan.name,
    subscriptionFee: plan.monthlyFee,
    activeContactsCount: input.activeContactsCount,
    includedContacts: plan.includedContacts,
    billableOverageContacts,
    contactOverageCost,
    metaPassThroughCost: roundedMetaCost,
    totalDue,
    currency: 'USD',
    itemizedMetaCharges: itemizedCharges,
  };
}

