// ============================================================================
// Phase 4: Bulk Campaign Wizard & Operations Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import type { MessageCategory } from '../../types/domain.ts';
import { calculateCampaignPreflight, type CampaignDefinition } from './campaign-service.ts';
import type { EligibilityCandidate } from '../campaign-gate.ts';

export type CampaignStatus = 'DRAFT' | 'QUEUED' | 'SENDING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface VariableMappingItem {
  variableNumber: number; // e.g. 1 for {{1}}
  sourceField: 'name' | 'phone' | 'email' | 'custom_tag' | 'static_value';
  staticValue?: string;
  fallbackValue: string;
}

export interface CampaignRecord {
  id: string;
  tenantId: string;
  name: string;
  category: MessageCategory;
  senderPhone: string;
  templateId: string;
  templateName: string;
  language: string;
  variableMappings: VariableMappingItem[];
  audienceFilter: {
    optInSourceId?: string;
    tag?: string;
    minConsentDate?: string;
  };
  totalRecipients: number;
  eligibleRecipients: number;
  excludedCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  pacingMessagesPerMinute: number;
  estimatedCostUSD: number;
  status: CampaignStatus;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// In-memory campaign store per tenant
const tenantCampaignsMap: Record<string, CampaignRecord[]> = {
  tenant_default: [
    {
      id: 'cmp_001',
      tenantId: 'tenant_default',
      name: 'UAE National Day VIP Broadcast',
      category: 'MARKETING',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_uae_day',
      templateName: 'uae_national_day_promo',
      language: 'en',
      variableMappings: [
        { variableNumber: 1, sourceField: 'name', fallbackValue: 'Valued Customer' },
        { variableNumber: 2, sourceField: 'static_value', staticValue: 'UAE52', fallbackValue: 'VIP20' },
      ],
      audienceFilter: { tag: 'VIP' },
      totalRecipients: 10000,
      eligibleRecipients: 9620,
      excludedCount: 380,
      sentCount: 4820,
      deliveredCount: 4710,
      readCount: 3890,
      failedCount: 12,
      pacingMessagesPerMinute: 80,
      estimatedCostUSD: 84.50,
      status: 'SENDING',
      createdAt: '2026-11-06T10:00:00Z',
      updatedAt: '2026-11-06T12:30:00Z',
      createdBy: 'Chethan Reddy',
    },
    {
      id: 'cmp_002',
      tenantId: 'tenant_default',
      name: 'Order Confirmation Digest',
      category: 'UTILITY',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_order_conf',
      templateName: 'order_confirmation',
      language: 'en',
      variableMappings: [
        { variableNumber: 1, sourceField: 'name', fallbackValue: 'Customer' },
        { variableNumber: 2, sourceField: 'static_value', staticValue: 'ORD-9827', fallbackValue: 'N/A' },
      ],
      audienceFilter: {},
      totalRecipients: 1250,
      eligibleRecipients: 1250,
      excludedCount: 0,
      sentCount: 1250,
      deliveredCount: 1248,
      readCount: 1190,
      failedCount: 2,
      pacingMessagesPerMinute: 60,
      estimatedCostUSD: 18.75,
      status: 'COMPLETED',
      createdAt: '2026-11-05T08:00:00Z',
      updatedAt: '2026-11-05T08:25:00Z',
      createdBy: 'System Worker',
    },
  ],
};

/**
 * Calculates Meta conversation rate estimate based on category and recipient region
 */
export function calculateCampaignCostUSD(eligibleCount: number, category: MessageCategory, country: string = 'AE'): number {
  // Approximate standard Meta Cloud API conversation charges:
  // UAE: Marketing ~$0.038 / AED 0.14, Utility ~$0.015 / AED 0.055
  const rate = category === 'MARKETING' ? 0.038 : category === 'UTILITY' ? 0.015 : 0.020;
  return Number((eligibleCount * rate).toFixed(2));
}

/**
 * Retrieves all campaigns for a tenant
 */
export function getCampaigns(tenantId: string): CampaignRecord[] {
  return tenantCampaignsMap[tenantId] || tenantCampaignsMap['tenant_default'] || [];
}

/**
 * Creates and queues a new campaign from the Multi-Step Wizard
 */
export function createCampaign(draft: {
  tenantId: string;
  name: string;
  category: MessageCategory;
  senderPhone: string;
  templateId: string;
  templateName: string;
  language: string;
  variableMappings: VariableMappingItem[];
  audienceFilter: { optInSourceId?: string; tag?: string };
  pacingMessagesPerMinute?: number;
  scheduledAt?: string;
  createdBy: string;
  sampleRecipients?: EligibilityCandidate[];
}): { success: boolean; campaign?: CampaignRecord; error?: string } {
  if (!draft.name?.trim()) {
    return { success: false, error: 'Campaign name is required.' };
  }
  if (!draft.templateName) {
    return { success: false, error: 'Meta-approved message template must be selected.' };
  }

  // Preflight calculations over recipients
  const recipients: EligibilityCandidate[] = draft.sampleRecipients || [
    { contactId: 'c1', phoneRaw: '+971501234567', hasGrantedConsent: true, isSuppressed: false },
    { contactId: 'c2', phoneRaw: '+971529821102', hasGrantedConsent: true, isSuppressed: false },
    { contactId: 'c3', phoneRaw: '+971550000001', hasGrantedConsent: false, isSuppressed: false },
    { contactId: 'c4', phoneRaw: '+971527104433', hasGrantedConsent: true, isSuppressed: true, suppressionReason: 'STOP keyword' },
  ];

  const campaignDef: CampaignDefinition = {
    id: `cmp_${Date.now()}`,
    tenantId: draft.tenantId,
    name: draft.name,
    phoneNumberId: 'phone_001',
    templateName: draft.templateName,
    templateCategory: draft.category,
    templateStatus: 'APPROVED',
    recipients,
    pacingMessagesPerMinute: draft.pacingMessagesPerMinute || 60,
  };

  const preflight = calculateCampaignPreflight(campaignDef);
  const cost = calculateCampaignCostUSD(preflight.eligible, draft.category);

  const newRecord: CampaignRecord = {
    id: campaignDef.id,
    tenantId: draft.tenantId,
    name: draft.name.trim(),
    category: draft.category,
    senderPhone: draft.senderPhone || '+971 50 123 4567',
    templateId: draft.templateId,
    templateName: draft.templateName,
    language: draft.language || 'en',
    variableMappings: draft.variableMappings || [],
    audienceFilter: draft.audienceFilter || {},
    totalRecipients: preflight.total_selected,
    eligibleRecipients: preflight.eligible,
    excludedCount: preflight.total_selected - preflight.eligible,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    pacingMessagesPerMinute: draft.pacingMessagesPerMinute || 60,
    estimatedCostUSD: cost,
    status: draft.scheduledAt ? 'QUEUED' : 'SENDING',
    scheduledAt: draft.scheduledAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: draft.createdBy,
  };

  if (!tenantCampaignsMap[draft.tenantId]) {
    tenantCampaignsMap[draft.tenantId] = [];
  }
  tenantCampaignsMap[draft.tenantId].unshift(newRecord);

  return { success: true, campaign: newRecord };
}

/**
 * Pauses an active sending campaign
 */
export function pauseCampaign(tenantId: string, campaignId: string): { success: boolean; campaign?: CampaignRecord; error?: string } {
  const list = getCampaigns(tenantId);
  const target = list.find((c) => c.id === campaignId);
  if (!target) {
    return { success: false, error: 'Campaign not found' };
  }
  if (target.status !== 'SENDING') {
    return { success: false, error: `Cannot pause campaign with status ${target.status}` };
  }

  target.status = 'PAUSED';
  target.updatedAt = new Date().toISOString();
  return { success: true, campaign: target };
}

/**
 * Resumes a paused campaign
 */
export function resumeCampaign(tenantId: string, campaignId: string): { success: boolean; campaign?: CampaignRecord; error?: string } {
  const list = getCampaigns(tenantId);
  const target = list.find((c) => c.id === campaignId);
  if (!target) {
    return { success: false, error: 'Campaign not found' };
  }
  if (target.status !== 'PAUSED') {
    return { success: false, error: `Cannot resume campaign with status ${target.status}` };
  }

  target.status = 'SENDING';
  target.updatedAt = new Date().toISOString();
  return { success: true, campaign: target };
}

/**
 * Cancels a queued or paused campaign
 */
export function cancelCampaign(tenantId: string, campaignId: string): { success: boolean; campaign?: CampaignRecord; error?: string } {
  const list = getCampaigns(tenantId);
  const target = list.find((c) => c.id === campaignId);
  if (!target) {
    return { success: false, error: 'Campaign not found' };
  }
  if (target.status === 'COMPLETED') {
    return { success: false, error: 'Cannot cancel a completed campaign' };
  }

  target.status = 'CANCELLED';
  target.updatedAt = new Date().toISOString();
  return { success: true, campaign: target };
}
