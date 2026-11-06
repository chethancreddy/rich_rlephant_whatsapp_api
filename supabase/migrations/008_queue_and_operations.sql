-- ============================================================================
-- Migration 008: Durable Queue, Subscriptions, Billing and Audit Logs
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: outbox_jobs (Durable Transactional Queue for Workers)
CREATE TABLE IF NOT EXISTS outbox_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL, -- send_message, process_campaign, sync_templates, webhook_dispatch
    aggregate_id UUID, -- References campaign_id, message_id, etc.
    payload_json JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, claimed, completed, failed, dead_letter
    available_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    locked_until TIMESTAMPTZ,
    worker_id VARCHAR(100),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    idempotency_key VARCHAR(128) UNIQUE,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: plans (SaaS Subscription Tiers)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- starter, growth, pro, agency, enterprise
    name VARCHAR(100) NOT NULL,
    monthly_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    entitlements_json JSONB NOT NULL DEFAULT '{
        "max_phone_numbers": 1,
        "max_agents": 2,
        "max_campaigns_per_month": 50,
        "max_contacts": 5000,
        "max_api_keys": 2,
        "ai_enabled": false,
        "white_label_enabled": false
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: subscriptions (Workspace SaaS Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    billing_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, past_due, cancelled, trialing
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: usage_events (Immutable Platform & AI Usage Ledger)
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usage_type VARCHAR(100) NOT NULL, -- message_submitted, message_delivered, ai_tokens, automation_step, api_call
    quantity INT NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'count',
    source_id UUID,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: pricing_rules (Versioned Destination Rate Cards for Estimates)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL, -- MARKETING, UTILITY, AUTHENTICATION, SERVICE
    rate_usd NUMERIC(8, 4) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    source_notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: audit_logs (Immutable Security & Administrative Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- role_change, campaign_launch, token_refresh, opt_out, api_key_create
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    before_json JSONB,
    after_json JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outbox_claim ON outbox_jobs(status, available_at, locked_until);
CREATE INDEX IF NOT EXISTS idx_usage_events_tenant ON usage_events(tenant_id, usage_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_lookup ON pricing_rules(country_code, category, effective_from);

