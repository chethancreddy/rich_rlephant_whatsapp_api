-- ============================================================================
-- Migration 009: Row Level Security (RLS) Policies
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Ensure auth schema, roles, and helper functions exist (Neon & Supabase compatible)
CREATE SCHEMA IF NOT EXISTS auth;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
    SELECT COALESCE(current_setting('request.jwt.claim.role', true), 'anon');
$$ LANGUAGE sql STABLE;

-- Helper function: Get user_id from auth.uid()
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS UUID AS $$
    SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if current user is member of tenant
CREATE OR REPLACE FUNCTION is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM tenant_memberships tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.tenant_id = p_tenant_id
        AND u.auth_user_id = auth.uid()
        AND tm.status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if current user has a specific role in tenant
CREATE OR REPLACE FUNCTION has_tenant_role(p_tenant_id UUID, p_roles membership_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM tenant_memberships tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.tenant_id = p_tenant_id
        AND u.auth_user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.role = ANY(p_roles)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS across all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants Policies
CREATE POLICY tenant_select ON tenants
    FOR SELECT TO authenticated
    USING (is_tenant_member(id));

CREATE POLICY tenant_update ON tenants
    FOR UPDATE TO authenticated
    USING (has_tenant_role(id, ARRAY['super_admin', 'workspace_owner']::membership_role[]));

-- Memberships Policies
CREATE POLICY membership_select ON tenant_memberships
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY membership_insert_update ON tenant_memberships
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin']::membership_role[]));

-- Meta Connections Policies (Sensitive credentials protected)
CREATE POLICY meta_conn_select ON meta_connections
    FOR SELECT TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin', 'developer']::membership_role[]));

CREATE POLICY meta_conn_manage ON meta_connections
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner']::membership_role[]));

-- Contacts Policies
CREATE POLICY contacts_select ON contacts
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY contacts_modify ON contacts
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin', 'campaign_manager', 'agent']::membership_role[]));

-- Consent & Suppression Policies
CREATE POLICY consent_select ON consent_records
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY consent_modify ON consent_records
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin', 'compliance_auditor']::membership_role[]));

CREATE POLICY suppression_select ON suppression_entries
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY suppression_modify ON suppression_entries
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin', 'compliance_auditor']::membership_role[]));

-- Campaigns Policies
CREATE POLICY campaigns_select ON campaigns
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY campaigns_modify ON campaigns
    FOR ALL TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'workspace_admin', 'campaign_manager']::membership_role[]));

-- Conversations & Messages Policies
CREATE POLICY conversations_select ON conversations
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY conversations_modify ON conversations
    FOR ALL TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY messages_select ON messages
    FOR SELECT TO authenticated
    USING (is_tenant_member(tenant_id));

CREATE POLICY messages_modify ON messages
    FOR ALL TO authenticated
    USING (is_tenant_member(tenant_id));

-- Audit Logs Policy (Append-only & read-only for auditors/owners)
CREATE POLICY audit_logs_select ON audit_logs
    FOR SELECT TO authenticated
    USING (has_tenant_role(tenant_id, ARRAY['super_admin', 'workspace_owner', 'compliance_auditor']::membership_role[]));

CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (is_tenant_member(tenant_id));

