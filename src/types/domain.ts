// ============================================================================
// Domain Types & System Enums
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export type MembershipRole =
  | 'super_admin'
  | 'workspace_admin'
  | 'manager'
  | 'campaign_manager'
  | 'agent'
  | 'agency_owner'
  | 'workspace_owner'
  | 'team_lead'
  | 'automation_builder'
  | 'developer'
  | 'billing_viewer'
  | 'compliance_auditor';

export interface OptInSource {
  id: string;
  tenant_id: string;
  name: string;
  type: 'website_form' | 'checkout_checkbox' | 'qr_code' | 'pos' | 'inbound_whatsapp' | 'manual';
  description?: string;
  is_active: boolean;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OptInSourceHistory {
  id: string;
  tenant_id: string;
  source_id: string;
  action: 'created' | 'activated' | 'deactivated' | 'updated';
  details_json?: Record<string, unknown>;
  performed_by_user_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata_json?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  country: string;
  timezone: string;
  status: TenantStatus;
  plan_id?: string;
  settings_json?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  auth_user_id: string;
  display_name: string;
  email: string;
  phone_e164?: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: MembershipRole;
  status: string;
}

export interface PhoneSender {
  id: string;
  tenant_id: string;
  meta_connection_id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  connection_status: 'CONNECTED' | 'DISCONNECTED' | 'RATE_LIMITED';
  messaging_limit_tier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  is_default: boolean;
}

export type MessageCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'template' | 'image' | 'document' | 'audio' | 'video' | 'interactive' | 'location';
export type MessageStatus = 'queued' | 'submitted' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppTemplate {
  id: string;
  tenant_id: string;
  waba_id: string;
  meta_template_id?: string;
  name: string;
  language: string;
  category: MessageCategory;
  status: 'APPROVED' | 'REJECTED' | 'PAUSED' | 'PENDING' | 'DELETED';
  components_json: TemplateComponent[];
  variable_count: number;
  quality_score?: string;
  synced_at: string;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  text?: string;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface Contact {
  id: string;
  tenant_id: string;
  phone_e164: string;
  name?: string;
  email?: string;
  country_code?: string;
  attributes_json: Record<string, unknown>;
  source: string;
  opt_in_source_id?: string;
  campaign_eligibility: boolean;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  archived_at?: string;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  tenant_id: string;
  contact_id: string;
  channel: 'whatsapp';
  purpose: 'marketing' | 'utility' | 'transactional' | 'customer_care';
  category: MessageCategory;
  status: 'granted' | 'withdrawn' | 'disputed' | 'expired';
  source: string;
  notice_version: string;
  evidence_uri?: string;
  captured_at: string;
  revoked_at?: string;
}

export interface SuppressionEntry {
  id: string;
  tenant_id: string;
  phone_e164: string;
  channel: 'whatsapp';
  purpose: string;
  reason: string;
  source: string;
  created_at: string;
  lifted_at?: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  phone_number_id: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_user_id?: string;
  team_id?: string;
  unread_count: number;
  service_window_expires_at?: string;
  last_message_at: string;
  last_message_preview?: string;
}

export interface CampaignPreflightResult {
  campaign_id: string;
  total_selected: number;
  eligible: number;
  excluded: {
    no_valid_consent: number;
    opted_out_suppressed: number;
    invalid_phone_format: number;
    template_ineligible: number;
  };
  estimated_cost: {
    amount: number;
    currency: string;
    is_live_estimate: boolean;
  };
  warnings: string[];
}

