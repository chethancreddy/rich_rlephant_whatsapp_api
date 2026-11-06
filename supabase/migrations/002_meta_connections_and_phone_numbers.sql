-- ============================================================================
-- Migration 002: Meta Connections and Phone Numbers
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: meta_connections (Encrypted token store & WABA link)
CREATE TABLE IF NOT EXISTS meta_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    business_id VARCHAR(100) NOT NULL,
    waba_id VARCHAR(100) NOT NULL,
    app_id VARCHAR(100) NOT NULL,
    token_ciphertext TEXT NOT NULL,
    token_iv TEXT NOT NULL,
    token_tag TEXT NOT NULL,
    token_key_version VARCHAR(20) NOT NULL DEFAULT 'v1',
    scopes TEXT[] DEFAULT ARRAY['whatsapp_business_messaging', 'whatsapp_business_management'],
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, reauthorisation_required, revoked
    last_verified_at TIMESTAMPTZ,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, waba_id)
);

-- Table: phone_numbers (Connected sender numbers)
CREATE TABLE IF NOT EXISTS phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    meta_connection_id UUID NOT NULL REFERENCES meta_connections(id) ON DELETE CASCADE,
    phone_number_id VARCHAR(100) NOT NULL,
    display_phone_number VARCHAR(50) NOT NULL,
    verified_name VARCHAR(255),
    quality_rating VARCHAR(50) DEFAULT 'GREEN', -- GREEN, YELLOW, RED, UNKNOWN
    connection_status VARCHAR(50) DEFAULT 'CONNECTED', -- CONNECTED, DISCONNECTED, RATE_LIMITED
    code_verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    messaging_limit_tier VARCHAR(50) DEFAULT 'TIER_1K', -- TIER_1K, TIER_10K, TIER_100K, TIER_UNLIMITED
    throughput_level VARCHAR(50) DEFAULT 'STANDARD',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, phone_number_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meta_connections_tenant ON meta_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_tenant ON phone_numbers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone_id ON phone_numbers(phone_number_id);

