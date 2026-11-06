-- ============================================================================
-- Migration 004: Templates and Campaigns
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: templates (Synced Meta message templates)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    waba_id VARCHAR(100) NOT NULL,
    meta_template_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    category VARCHAR(50) NOT NULL, -- MARKETING, UTILITY, AUTHENTICATION
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- APPROVED, REJECTED, PAUSED, PENDING, DELETED
    components_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    variable_count INT NOT NULL DEFAULT 0,
    quality_score VARCHAR(50) DEFAULT 'UNKNOWN',
    rejection_reason TEXT,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, waba_id, name, language)
);

-- Enum for Campaign Status
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'scheduled',
    'queued',
    'sending',
    'paused',
    'completed',
    'cancelled',
    'failed'
);

-- Table: campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone_number_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE RESTRICT,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    status campaign_status NOT NULL DEFAULT 'draft',
    schedule_at TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'Asia/Dubai',
    pacing_messages_per_minute INT DEFAULT 60,
    total_selected INT NOT NULL DEFAULT 0,
    total_eligible INT NOT NULL DEFAULT 0,
    total_excluded INT NOT NULL DEFAULT 0,
    total_submitted INT NOT NULL DEFAULT 0,
    total_delivered INT NOT NULL DEFAULT 0,
    total_read INT NOT NULL DEFAULT 0,
    total_failed INT NOT NULL DEFAULT 0,
    estimated_cost_amount NUMERIC(10, 4) DEFAULT 0,
    estimated_cost_currency VARCHAR(10) DEFAULT 'USD',
    audience_filter_json JSONB DEFAULT '{}'::jsonb,
    variable_mapping_json JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    launched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: campaign_recipients (Per-contact eligibility and send state)
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(32) NOT NULL,
    eligibility VARCHAR(50) NOT NULL DEFAULT 'pending', -- eligible, excluded_no_consent, excluded_suppressed, excluded_invalid_phone
    exclusion_reason VARCHAR(100),
    variable_payload_json JSONB DEFAULT '{}'::jsonb,
    message_id UUID, -- References messages(id) once submitted
    idempotency_key VARCHAR(128) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, queued, submitted, delivered, read, failed, skipped
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(campaign_id, contact_id),
    UNIQUE(tenant_id, idempotency_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_tenant_waba ON templates(tenant_id, waba_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_eligibility ON campaign_recipients(campaign_id, eligibility);

