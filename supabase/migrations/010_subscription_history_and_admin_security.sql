-- ============================================================================
-- Migration 010: Subscription History & Administrative Security
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: subscription_history (Immutable log of plan upgrades and billing modifications)
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    old_plan_code VARCHAR(50),
    new_plan_code VARCHAR(50) NOT NULL,
    old_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    new_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    change_type VARCHAR(50) NOT NULL DEFAULT 'upgrade', -- upgrade, downgrade, admin_override, renewal
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performer_email VARCHAR(255) NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: password_reset_requests (Auditable administrative password reset dispatch tracker)
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    target_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'dispatched', -- dispatched, consumed, expired, revoked
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    sessions_revoked BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_history_tenant ON subscription_history(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_email ON password_reset_requests(target_email, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_requests(token_hash);

