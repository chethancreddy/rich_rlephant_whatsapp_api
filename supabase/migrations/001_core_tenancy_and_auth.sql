-- ============================================================================
-- Migration 001: Core Tenancy and Authentication
-- Rich Rlephant Marketing Whatsapp API
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for Tenant Status
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial', 'cancelled');

-- Enum for Member Role
CREATE TYPE membership_role AS ENUM (
    'super_admin',
    'agency_owner',
    'workspace_owner',
    'workspace_admin',
    'campaign_manager',
    'agent',
    'team_lead',
    'automation_builder',
    'developer',
    'billing_viewer',
    'compliance_auditor'
);

-- Table: tenants (Workspaces)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(10) DEFAULT 'AE',
    timezone VARCHAR(50) DEFAULT 'Asia/Dubai',
    status tenant_status NOT NULL DEFAULT 'trial',
    plan_id UUID,
    settings_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: agencies (Parent Organization for Agency Hierarchy)
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_user_id UUID,
    branding_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: agency_tenant_access (Delegated Access to Client Workspaces)
CREATE TABLE IF NOT EXISTS agency_tenant_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agency_admin',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    revoked_at TIMESTAMPTZ,
    UNIQUE(agency_id, tenant_id)
);

-- Table: users (Application user profile linked to Supabase auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_e164 VARCHAR(32),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: tenant_memberships (RBAC & Tenancy Junction)
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'agent',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(tenant_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant ON tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_user_id);

