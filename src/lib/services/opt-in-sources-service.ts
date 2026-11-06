// ============================================================================
// Opt-In Sources & Consent Management Service
// Product: Rich Rlephant Marketing Whatsapp API
// Phase 2 Implementation
// ============================================================================

import type { OptInSource, OptInSourceHistory, ConsentRecord } from '../../types/domain.ts';

// In-memory store for development/testing and API execution
export const optInSourcesStore = new Map<string, OptInSource[]>([
  [
    'tenant_default',
    [
      {
        id: 'src_checkout_1',
        tenant_id: 'tenant_default',
        name: 'Website Checkout Checkbox',
        type: 'checkout_checkbox',
        description: 'Mandatory affirmative checkbox on cart checkout page with v1.2 Privacy Notice.',
        is_active: true,
        created_by_user_id: 'usr_admin_1',
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-01T10:00:00Z',
      },
      {
        id: 'src_qr_2',
        tenant_id: 'tenant_default',
        name: 'Retail Store QR Code Opt-In',
        type: 'qr_code',
        description: 'Printed QR code on retail billing desk initiating WhatsApp keyword START.',
        is_active: true,
        created_by_user_id: 'usr_admin_1',
        created_at: '2026-10-15T14:30:00Z',
        updated_at: '2026-10-15T14:30:00Z',
      },
      {
        id: 'src_inbound_3',
        tenant_id: 'tenant_default',
        name: 'Customer Support Inbound Request',
        type: 'inbound_whatsapp',
        description: 'Direct inbound customer message requesting order update or technical support.',
        is_active: true,
        created_by_user_id: 'usr_manager_1',
        created_at: '2026-10-20T09:15:00Z',
        updated_at: '2026-10-20T09:15:00Z',
      },
      {
        id: 'src_legacy_form',
        tenant_id: 'tenant_default',
        name: 'Legacy 2025 Newsletter Form',
        type: 'website_form',
        description: 'Old lead generation form. Deactivated due to obsolete notice version.',
        is_active: false,
        created_by_user_id: 'usr_admin_1',
        created_at: '2025-06-01T08:00:00Z',
        updated_at: '2026-01-10T11:00:00Z',
      },
    ],
  ],
]);

export const optInSourceHistoryStore: OptInSourceHistory[] = [
  {
    id: 'hist_1',
    tenant_id: 'tenant_default',
    source_id: 'src_checkout_1',
    action: 'created',
    details_json: { noticeVersion: 'v1.2' },
    performed_by_user_id: 'usr_admin_1',
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'hist_2',
    tenant_id: 'tenant_default',
    source_id: 'src_legacy_form',
    action: 'deactivated',
    details_json: { reason: 'Notice version v0.9 sunset' },
    performed_by_user_id: 'usr_admin_1',
    created_at: '2026-01-10T11:00:00Z',
  },
];

export interface CreateOptInSourceInput {
  tenantId: string;
  name: string;
  type: OptInSource['type'];
  description?: string;
  createdByUser: string;
}

export function createOptInSource(input: CreateOptInSourceInput): { success: boolean; source?: OptInSource; error?: string } {
  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Source name must be at least 3 characters long.' };
  }

  const existing = optInSourcesStore.get(input.tenantId) || [];
  if (existing.some((s) => s.name.toLowerCase() === input.name.trim().toLowerCase())) {
    return { success: false, error: `An opt-in source named '${input.name}' already exists in this workspace.` };
  }

  const now = new Date().toISOString();
  const newSource: OptInSource = {
    id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tenant_id: input.tenantId,
    name: input.name.trim(),
    type: input.type,
    description: input.description?.trim(),
    is_active: true,
    created_by_user_id: input.createdByUser,
    updated_by_user_id: input.createdByUser,
    created_at: now,
    updated_at: now,
  };

  existing.push(newSource);
  optInSourcesStore.set(input.tenantId, existing);

  // Append immutable history log
  optInSourceHistoryStore.unshift({
    id: `hist_${Date.now()}`,
    tenant_id: input.tenantId,
    source_id: newSource.id,
    action: 'created',
    details_json: { name: newSource.name, type: newSource.type },
    performed_by_user_id: input.createdByUser,
    created_at: now,
  });

  return { success: true, source: newSource };
}

export function toggleOptInSourceActive(params: {
  tenantId: string;
  sourceId: string;
  isActive: boolean;
  performedByUser: string;
  reason?: string;
}): { success: boolean; source?: OptInSource; error?: string } {
  const sources = optInSourcesStore.get(params.tenantId) || [];
  const source = sources.find((s) => s.id === params.sourceId);

  if (!source) {
    return { success: false, error: 'Opt-in source not found.' };
  }

  source.is_active = params.isActive;
  source.updated_at = new Date().toISOString();
  source.updated_by_user_id = params.performedByUser;

  optInSourceHistoryStore.unshift({
    id: `hist_${Date.now()}`,
    tenant_id: params.tenantId,
    source_id: source.id,
    action: params.isActive ? 'activated' : 'deactivated',
    details_json: { reason: params.reason || 'User status change' },
    performed_by_user_id: params.performedByUser,
    created_at: new Date().toISOString(),
  });

  return { success: true, source };
}

export function getOptInSources(tenantId: string): OptInSource[] {
  return optInSourcesStore.get(tenantId) || optInSourcesStore.get('tenant_default') || [];
}

export function getOptInSourceHistory(sourceId: string): OptInSourceHistory[] {
  return optInSourceHistoryStore.filter((h) => h.source_id === sourceId);
}

