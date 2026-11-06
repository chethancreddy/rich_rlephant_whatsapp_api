-- ============================================================================
-- Migration 003: Contacts and Compliance (Consent & Suppression)
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(32) NOT NULL,
    wa_id VARCHAR(32),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    country_code VARCHAR(10),
    attributes_json JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(100) DEFAULT 'manual', -- manual, csv_import, api, webhook, form
    campaign_eligibility BOOLEAN NOT NULL DEFAULT false, -- Set true ONLY when valid consent is verified
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, phone_e164)
);

-- Table: tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#059669',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, name)
);

-- Table: contact_tags (Junction)
CREATE TABLE IF NOT EXISTS contact_tags (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (contact_id, tag_id)
);

-- Table: consent_records (Immutable audit trail of customer opt-ins)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    purpose VARCHAR(50) NOT NULL, -- marketing, utility, transactional, customer_care
    category VARCHAR(50) NOT NULL DEFAULT 'MARKETING',
    status VARCHAR(30) NOT NULL DEFAULT 'granted', -- granted, withdrawn, disputed, expired
    source VARCHAR(100) NOT NULL, -- website_checkbox, lead_form, inbound_keyword, manual_entry
    notice_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    evidence_uri TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: suppression_entries (Instant opt-out and Do-Not-Contact registry)
CREATE TABLE IF NOT EXISTS suppression_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(32) NOT NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    purpose VARCHAR(50) DEFAULT 'all', -- all, marketing, utility
    reason VARCHAR(100) NOT NULL, -- keyword_stop, user_unsubscribe, complaint, admin_block
    source VARCHAR(100) NOT NULL, -- inbound_keyword, ui_manual, api, webhook
    actor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    lifted_at TIMESTAMPTZ,
    UNIQUE(tenant_id, phone_e164, channel, purpose)
);

-- Indexes for ultra-fast lookup during preflight & campaign dispatch
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_phone ON contacts(tenant_id, phone_e164);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_eligibility ON contacts(tenant_id, campaign_eligibility);
CREATE INDEX IF NOT EXISTS idx_consent_tenant_contact ON consent_records(tenant_id, contact_id, status);
CREATE INDEX IF NOT EXISTS idx_suppression_lookup ON suppression_entries(tenant_id, phone_e164, channel);

