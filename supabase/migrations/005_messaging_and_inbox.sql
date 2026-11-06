-- ============================================================================
-- Migration 005: Messaging and Shared Inbox
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: teams (Support & Agent Groups)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, name)
);

-- Table: team_members (Junction)
CREATE TABLE IF NOT EXISTS team_members (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (team_id, user_id)
);

-- Enum for Conversation Status
CREATE TYPE conversation_status AS ENUM ('open', 'pending', 'resolved', 'closed');

-- Table: conversations (Customer Chat Thread)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    phone_number_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE RESTRICT,
    status conversation_status NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    assigned_user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    unread_count INT NOT NULL DEFAULT 0,
    service_window_expires_at TIMESTAMPTZ, -- 24h window after customer inbound message
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    last_message_preview TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, contact_id, phone_number_id)
);

-- Enum for Message Direction & Type
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type AS ENUM ('text', 'template', 'image', 'document', 'audio', 'video', 'interactive', 'location');

-- Table: messages (Normalized Message Projection)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    phone_number_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE RESTRICT,
    direction message_direction NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    category VARCHAR(50) NOT NULL DEFAULT 'SERVICE', -- MARKETING, UTILITY, AUTHENTICATION, SERVICE
    template_id UUID REFERENCES templates(id),
    provider_message_id VARCHAR(128) UNIQUE, -- wamid.HBgL...
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, submitted, sent, delivered, read, failed
    error_code VARCHAR(50),
    error_message TEXT,
    cost_estimate NUMERIC(8, 4) DEFAULT 0,
    submitted_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    idempotency_key VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: conversation_messages (Message Content & Payload Pointer)
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    body TEXT,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    interactive_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: conversation_notes (Internal team collaboration notes)
CREATE TABLE IF NOT EXISTS conversation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: message_events (Immutable provider webhook event history)
CREATE TABLE IF NOT EXISTS message_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- submitted, sent, delivered, read, failed
    provider_event_id VARCHAR(128),
    payload_minimized JSONB,
    event_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations(tenant_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_window ON conversations(tenant_id, service_window_expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_provider_id ON messages(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_message_events_message ON message_events(message_id, event_at ASC);

