-- ============================================================================
-- Migration 011: User Ownership, Role Permissions & Opt-In Sources Foundation
-- Product: Rich Rlephant Marketing Whatsapp API
-- Phase 1 Foundation
-- ============================================================================

-- 1. Add User Ownership to Core Entities
DO $$ 
BEGIN
    -- contacts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE contacts ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'updated_by_user_id') THEN
        ALTER TABLE contacts ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- campaigns table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE campaigns ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'updated_by_user_id') THEN
        ALTER TABLE campaigns ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- templates table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE templates ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'updated_by_user_id') THEN
        ALTER TABLE templates ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- automation_flows table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_flows' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE automation_flows ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_flows' AND column_name = 'updated_by_user_id') THEN
        ALTER TABLE automation_flows ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- api_keys table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE api_keys ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Opt-In Sources Entity for Verifiable Consent Tracking
CREATE TABLE IF NOT EXISTS opt_in_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'website_form', -- website_form, checkout_checkbox, qr_code, pos, inbound_whatsapp, manual
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS opt_in_source_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES opt_in_sources(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- created, activated, deactivated, updated
    details_json JSONB DEFAULT '{}'::jsonb,
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Link opt_in_source_id into contacts table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'opt_in_source_id') THEN
        ALTER TABLE contacts ADD COLUMN opt_in_source_id UUID REFERENCES opt_in_sources(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Comprehensive Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    metadata_json JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_opt_in_source ON contacts(opt_in_source_id);
CREATE INDEX IF NOT EXISTS idx_opt_in_sources_tenant ON opt_in_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opt_in_history_source ON opt_in_source_history(source_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- 5. Row Level Security Policies for Opt-In Sources & Audit Logs
ALTER TABLE opt_in_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_in_source_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_opt_in_sources_policy" ON opt_in_sources
    FOR ALL
    USING (is_tenant_member(tenant_id))
    WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "tenant_opt_in_source_history_policy" ON opt_in_source_history
    FOR ALL
    USING (is_tenant_member(tenant_id))
    WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "tenant_audit_logs_policy" ON audit_logs
    FOR SELECT
    USING (is_tenant_member(tenant_id));

