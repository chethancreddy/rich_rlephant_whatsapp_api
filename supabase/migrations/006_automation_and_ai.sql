-- ============================================================================
-- Migration 006: Automation Workflows and AI Studio
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Table: automation_flows
CREATE TABLE IF NOT EXISTS automation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, archived
    trigger_type VARCHAR(50) NOT NULL, -- keyword, inbound_message, campaign_reply, webhook
    trigger_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: automation_runs
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    flow_id UUID NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- running, completed, handed_over, failed
    current_step_id VARCHAR(100),
    execution_context JSONB DEFAULT '{}'::jsonb,
    error_details JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    ended_at TIMESTAMPTZ
);

-- Table: knowledge_sources (Tenant-scoped Knowledge Base)
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- faq, document, website_crawl, text_snippet
    storage_uri TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, indexing, active, error
    chunk_count INT NOT NULL DEFAULT 0,
    indexed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: knowledge_chunks (Retrieval items scoped strictly to tenant)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automation_flows_tenant ON automation_flows(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_tenant_flow ON automation_runs(tenant_id, flow_id, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_tenant ON knowledge_chunks(tenant_id, source_id);

