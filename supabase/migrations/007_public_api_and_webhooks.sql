-- ============================================================================
-- Migration 007: Public API and Webhooks
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: api_keys (Developer credentials, securely hashed)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL, -- e.g. rlep_live_
    key_hash VARCHAR(128) NOT NULL UNIQUE, -- SHA-256 hash of secret key
    scopes TEXT[] NOT NULL DEFAULT ARRAY['messages:send', 'contacts:read', 'templates:read'],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: webhook_endpoints (Customer's outbound webhook targets)
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_ciphertext TEXT NOT NULL,
    secret_iv TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT ARRAY['message.delivered', 'message.read', 'message.failed', 'contact.opted_out'],
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, disabled, failing
    failure_count INT NOT NULL DEFAULT 0,
    last_success_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: webhook_deliveries (Outbound webhook attempts & retries)
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    attempt INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, delivered, failed
    response_code INT,
    response_body TEXT,
    next_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: meta_webhook_events (Inbound webhook deduplication inbox)
CREATE TABLE IF NOT EXISTS meta_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_key VARCHAR(128) NOT NULL UNIQUE, -- SHA-256 of timestamp + message_id / status_id
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL, -- messages, message_status, template_status
    raw_payload JSONB NOT NULL,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'received', -- received, processed, duplicate, failed
    error_details TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant ON webhook_endpoints(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_meta_wh_events_key ON meta_webhook_events(provider_event_key);
CREATE INDEX IF NOT EXISTS idx_meta_wh_events_status ON meta_webhook_events(processing_status);

