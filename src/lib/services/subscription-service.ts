// ============================================================================
// Super Admin Customer Subscription & Plan Management Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { SAAS_PLANS, type PlanTier, type PlanConfig } from './billing-service.ts';

export interface PlanEntitlements {
  maxContacts: number;
  maxPhoneNumbers: number;
  maxAgents: number;
  maxCampaignsPerMonth: number;
  aiCopilotEnabled: boolean;
  visualAutomationEnabled: boolean;
  whiteLabelEnabled: boolean;
  customDomainEnabled: boolean;
  prioritySupport: boolean;
}

export interface DetailedPlanInfo extends PlanConfig {
  features: string[];
  entitlements: PlanEntitlements;
}

export const DETAILED_PLANS: Record<PlanTier, DetailedPlanInfo> = {
  free: {
    ...SAAS_PLANS.free,
    features: [
      'Up to 1,000 Monthly Active Contacts',
      '1 WhatsApp Phone Number',
      '2 Shared Inbox Agents',
      'Standard Message Templates',
      'Community Support',
    ],
    entitlements: {
      maxContacts: 1000,
      maxPhoneNumbers: 1,
      maxAgents: 2,
      maxCampaignsPerMonth: 10,
      aiCopilotEnabled: false,
      visualAutomationEnabled: false,
      whiteLabelEnabled: false,
      customDomainEnabled: false,
      prioritySupport: false,
    },
  },
  starter: {
    ...SAAS_PLANS.starter,
    features: [
      'Up to 5,000 Monthly Active Contacts',
      '2 WhatsApp Phone Numbers',
      '5 Shared Inbox Agents',
      'Basic Keyword Automations',
      'CSV Contact Importer with Consent Proof',
      'Standard Email Support',
    ],
    entitlements: {
      maxContacts: 5000,
      maxPhoneNumbers: 2,
      maxAgents: 5,
      maxCampaignsPerMonth: 50,
      aiCopilotEnabled: false,
      visualAutomationEnabled: true,
      whiteLabelEnabled: false,
      customDomainEnabled: false,
      prioritySupport: false,
    },
  },
  growth: {
    ...SAAS_PLANS.growth,
    features: [
      'Up to 25,000 Monthly Active Contacts',
      '5 WhatsApp Phone Numbers',
      '15 Shared Inbox Agents with Collision Lock',
      'Full Visual Workflow Journey Builder',
      'AI Copilot & Knowledge Base RAG Assistant',
      'Developer REST API & Outbound Webhooks',
      'Priority Support SLA (4 hours)',
    ],
    entitlements: {
      maxContacts: 25000,
      maxPhoneNumbers: 5,
      maxAgents: 15,
      maxCampaignsPerMonth: 250,
      aiCopilotEnabled: true,
      visualAutomationEnabled: true,
      whiteLabelEnabled: false,
      customDomainEnabled: false,
      prioritySupport: true,
    },
  },
  enterprise: {
    ...SAAS_PLANS.enterprise,
    features: [
      '100,000+ Monthly Active Contacts',
      'Unlimited WhatsApp Phone Numbers',
      'Unlimited Agent Seats & Departments',
      'Full White-Labeling & Custom CNAME Domain',
      'Dedicated Meta WABA System User & High-Throughput Routing',
      'AI Copilot + Fine-Tuned Custom Intent Models',
      '24/7 Dedicated Technical Account Manager',
    ],
    entitlements: {
      maxContacts: 100000,
      maxPhoneNumbers: 999,
      maxAgents: 999,
      maxCampaignsPerMonth: 9999,
      aiCopilotEnabled: true,
      visualAutomationEnabled: true,
      whiteLabelEnabled: true,
      customDomainEnabled: true,
      prioritySupport: true,
    },
  },
};

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  planCode: PlanTier;
  billingStatus: 'active' | 'past_due' | 'trialing' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceUsd: number;
  contactUsage: number;
  messageUsageCount: number;
}

export interface SubscriptionHistoryEntry {
  id: string;
  tenantId: string;
  oldPlanCode: string;
  newPlanCode: string;
  oldPriceUsd: number;
  newPriceUsd: number;
  changeType: 'upgrade' | 'downgrade' | 'renewal' | 'admin_override';
  performedBy: string;
  performerEmail: string;
  effectiveDate: string;
  notes: string;
  createdAt: string;
}

// In-memory persistent mock stores for testing & sandbox execution
export const activeSubscriptionsStore = new Map<string, SubscriptionRecord>([
  [
    'tenant_demo_1',
    {
      id: 'sub_001',
      tenantId: 'tenant_demo_1',
      planCode: 'starter',
      billingStatus: 'active',
      currentPeriodStart: '2026-11-01T00:00:00Z',
      currentPeriodEnd: '2026-11-30T23:59:59Z',
      priceUsd: 49,
      contactUsage: 3420,
      messageUsageCount: 8900,
    },
  ],
  [
    'tenant_dubai_retail',
    {
      id: 'sub_002',
      tenantId: 'tenant_dubai_retail',
      planCode: 'growth',
      billingStatus: 'active',
      currentPeriodStart: '2026-11-01T00:00:00Z',
      currentPeriodEnd: '2026-11-30T23:59:59Z',
      priceUsd: 149,
      contactUsage: 19800,
      messageUsageCount: 52400,
    },
  ],
]);

export const subscriptionHistoryStore: SubscriptionHistoryEntry[] = [
  {
    id: 'sh_001',
    tenantId: 'tenant_demo_1',
    oldPlanCode: 'free',
    newPlanCode: 'starter',
    oldPriceUsd: 0,
    newPriceUsd: 49,
    changeType: 'upgrade',
    performedBy: 'usr_super_admin',
    performerEmail: 'admin@rich-rlephant.com',
    effectiveDate: '2026-11-01T00:00:00Z',
    notes: 'Upgraded to Starter Pro with 5,000 contact capacity',
    createdAt: '2026-11-01T00:00:00Z',
  },
];

export interface UpgradePlanParams {
  tenantId: string;
  targetPlanCode: PlanTier;
  performedBy?: string;
  performerEmail?: string;
  effectiveImmediately?: boolean;
  notes?: string;
}

export interface UpgradePlanResult {
  success: boolean;
  error?: string;
  previousPlan?: DetailedPlanInfo;
  newPlan?: DetailedPlanInfo;
  subscription?: SubscriptionRecord;
  historyEntry?: SubscriptionHistoryEntry;
}

/**
 * Executes a customer subscription plan upgrade with strict audit trail
 */
export function upgradeCustomerPlan(params: UpgradePlanParams): UpgradePlanResult {
  const {
    tenantId,
    targetPlanCode,
    performedBy = 'usr_super_admin',
    performerEmail = 'admin@rich-rlephant.com',
    effectiveImmediately = true,
    notes = '',
  } = params;

  if (!tenantId) {
    return { success: false, error: 'Tenant ID is required' };
  }

  const targetPlan = DETAILED_PLANS[targetPlanCode];
  if (!targetPlan) {
    return { success: false, error: `Invalid plan code '${targetPlanCode}'. Supported: free, starter, growth, enterprise` };
  }

  let currentSub = activeSubscriptionsStore.get(tenantId);
  if (!currentSub) {
    // Initialize default if not present
    currentSub = {
      id: `sub_${Date.now()}`,
      tenantId,
      planCode: 'free',
      billingStatus: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      priceUsd: 0,
      contactUsage: 0,
      messageUsageCount: 0,
    };
  }

  const previousPlan = DETAILED_PLANS[currentSub.planCode];
  const oldPrice = currentSub.priceUsd;
  const newPrice = targetPlan.monthlyFee;
  const nowIso = new Date().toISOString();

  // 1. Update subscription record
  currentSub.planCode = targetPlanCode;
  currentSub.priceUsd = newPrice;
  if (effectiveImmediately) {
    currentSub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  }
  activeSubscriptionsStore.set(tenantId, currentSub);

  // 2. Append immutable history entry
  const historyEntry: SubscriptionHistoryEntry = {
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenantId,
    oldPlanCode: previousPlan.id,
    newPlanCode: targetPlan.id,
    oldPriceUsd: oldPrice,
    newPriceUsd: newPrice,
    changeType: newPrice >= oldPrice ? 'upgrade' : 'downgrade',
    performedBy,
    performerEmail,
    effectiveDate: nowIso,
    notes: notes || `Plan upgraded from ${previousPlan.name} to ${targetPlan.name} by Super Admin`,
    createdAt: nowIso,
  };

  subscriptionHistoryStore.unshift(historyEntry);

  return {
    success: true,
    previousPlan,
    newPlan: targetPlan,
    subscription: currentSub,
    historyEntry,
  };
}

/**
 * Returns comprehensive subscription and plan status for Super Admin inspection
 */
export function getCustomerSubscriptionOverview(tenantId: string) {
  let sub = activeSubscriptionsStore.get(tenantId);
  if (!sub) {
    sub = {
      id: `sub_${tenantId}`,
      tenantId,
      planCode: 'starter',
      billingStatus: 'active',
      currentPeriodStart: '2026-11-01T00:00:00Z',
      currentPeriodEnd: '2026-11-30T23:59:59Z',
      priceUsd: 49,
      contactUsage: 1200,
      messageUsageCount: 4500,
    };
    activeSubscriptionsStore.set(tenantId, sub);
  }

  const planInfo = DETAILED_PLANS[sub.planCode] || DETAILED_PLANS.starter;
  const history = subscriptionHistoryStore.filter((h) => h.tenantId === tenantId);

  return {
    subscription: sub,
    plan: planInfo,
    history,
    allAvailablePlans: Object.values(DETAILED_PLANS),
  };
}

