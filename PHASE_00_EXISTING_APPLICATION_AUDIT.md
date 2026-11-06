# Phase 00: Comprehensive Existing Application Audit
## Product: Rich Rlephant Marketing Whatsapp API

### Executive Overview
This audit establishes the baseline architectural, functional, database, and security state of the **Rich Rlephant Marketing Whatsapp API** platform prior to executing the sequential phase upgrades.

---

### 1. Existing System Architecture Assessment

#### 1.1 Frontend Structure
- **Framework**: Next.js 15.5.29 App Router (`src/app`), React 19.
- **Design System**: Ko-fi Cozy Creator theme (`#72A4F2` sky blue, `#202020` core ink, `#F4EFE7` cream, 2px borders, rounded cards).
- **Active Pages**:
  - `/dashboard`: Operational metrics, 24h window health, campaign graphs.
  - `/contacts`: Active contacts registry, suppression registry, CSV importer modal.
  - `/campaigns`: Campaign list, status tabs, preflight summary.
  - `/templates`: Meta templates list, links to Meta Business Manager.
  - `/inbox`: Multi-agent chat, OGG/Opus voice note recording with pause/resume and waveform preview.
  - `/automation`: Visual workflow builder with trigger nodes, condition nodes, action nodes.
  - `/developer`: API keys table (mock), cURL sample code.
  - `/settings`: 3 tabs (WhatsApp Connections, Team, Billing).
  - `/super-admin`: Customer overview, plan upgrade modal, password reset modal.

#### 1.2 Backend Architecture & Domain Services
- **Services in `src/lib/services`**:
  - `subscription-service.ts`: Plan upgrades, quota provisioning, immutable subscription history.
  - `password-reset-service.ts`: Administrative password reset, 60m token TTL, rate limiting.
  - `campaign-service.ts`: Campaign scheduling and audience management.
  - `inbox-service.ts`: Message dispatch, collision locking, internal notes.
  - `ai-copilot.ts`: Intent classification, tenant-isolated knowledge retrieval, conversation summary.
  - `billing-service.ts`: SaaS subscriptions, contact overages, Meta regional pass-through rates.
  - `api-auth.ts`: Developer API key authentication (`rlep_live_`), SHA-256 hash lookup, scope checks.
  - `outbound-webhook-dispatcher.ts`: HMAC-SHA256 event dispatching.
  - `inbound-webhook-processor.ts`: Meta status and incoming message ingestion.
- **Worker & Pacing**:
  - `outbox-worker.ts`: `OutboxWorkerDaemon` with preflight consent gate and provider dispatch.
  - `pacer.ts`: `AdaptiveRatePacer` dynamic rate throttle and backoff.
- **Security & Crypto Vault**:
  - `crypto-vault.ts`: AES-256-GCM token encryption, memoized master key derivation, HMAC-SHA256 signatures.

#### 1.3 Database Schemas & Migrations (`supabase/migrations/`)
- `001_core_tenancy_and_auth.sql`: Tenants, users, user_roles (`super_admin`, `workspace_admin`, `agent`).
- `002_meta_connections_and_phone_numbers.sql`: WABA connections, encrypted system user tokens, phone numbers.
- `003_contacts_and_compliance.sql`: Contacts, consent records, opt-out suppression registry.
- `004_templates_and_campaigns.sql`: Templates, campaigns, campaign recipients.
- `005_messaging_and_inbox.sql`: Conversations, messages, conversation locks, internal notes.
- `006_automation_and_ai.sql`: Automation flows, knowledge chunks, intent audit logs.
- `007_public_api_and_webhooks.sql`: Developer API keys, outbound webhook subscriptions.
- `008_queue_and_operations.sql`: Transactional outbox queue, delivery attempts.
- `009_rls_security_policies.sql`: Row Level Security policies by `tenant_id`.
- `010_subscription_history_and_admin_security.sql`: Subscription change logs, administrative password reset requests.

---

### 2. Functional Status Matrix

| Module | Already Working | Partially Implemented | Broken / Incomplete | Missing Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **Tenancy & RBAC** | Basic tenant isolation in RLS; roles `super_admin`, `workspace_admin`, `agent`. | `Manager` role not explicitly differentiated in UI. | User ownership auditing (`created_by_user_id`, `updated_by_user_id`) missing on several tables. | Comprehensive user ownership foreign keys and granular role permissions matrix. |
| **Contacts & Opt-In** | CSV file drag-and-drop importer, phone normalizer (E.164), opt-in consent checkbox, suppression list. | Filtering by tag. | **CSV Export button in `/contacts` has no `onClick` handler**; fails silently. | Opt-In Source management (create, edit, activate/deactivate, history); Export All, Export Selected, Export Filtered; XLSX support. |
| **Templates** | Sync templates from Meta; display approved templates; category tags. | Mock templates displayed. | Create Template button simply redirects to external Meta Manager URL. | Complete in-app template builder (create, edit, duplicate, delete, variable mapping, header/footer/buttons, live preview). |
| **Campaigns** | Campaign gate pre-check (blocks unconsented/opted-out); outbox worker queue. | Basic UI table. | Campaign creation modal not connected to end-to-end wizard. | Multi-step Campaign Wizard (audience selection, template selection, variable mapping, scheduling, pacing, cost estimation). |
| **Shared Inbox** | Voice note recording with Pause/Resume, exclusion of paused time, waveform preview, audio sending (`voice: true`), agent collision lock, internal notes. | Sidebar conversation list. | Lacks granular tab filters. | Views for All, Read, Unread, Assigned to Me, Unassigned, My Team, Groups, Archived, Closed; Bulk Read/Unread; Department grouping. |
| **Developer API** | API key validation (`validateApiKey`), scope checking, HMAC-SHA256 signatures, cURL docs. | API key table displays static mock data. | **"Create New API Key" button has no click handler or modal**. | Interactive API key creation modal with scope picker, one-time secret display, key rotation, revocation, expiration, and last-used tracking. |
| **Settings** | WhatsApp connection status, team members table, billing breakdown. | 3 tabs only (`whatsapp`, `team`, `billing`). | No form submit handlers for profile or workspace changes. | 15 comprehensive settings sections: Profile, Account, Password, Sessions, Workspace, Company, WABA, Notifications, Team/Roles, Security, Billing, API, Webhooks, Language/Timezone, Preferences. |
| **Super Admin** | Plan upgrade modal with instant provisioning, subscription history, password reset with rate limiting, zero import/export controls. | UI controls verified. | None. | Fully operational. |

---

### 3. Database Changes Required (For Phase 1)
1. **Add `created_by_user_id` and `updated_by_user_id`** to:
   - `contacts`
   - `campaigns`
   - `whatsapp_templates`
   - `automation_flows`
   - `api_keys`
2. **Explicit `manager` Role Addition**:
   - Update role check constraints to support `'super_admin' | 'workspace_admin' | 'manager' | 'agent'`.
3. **Opt-In Sources Entity**:
   - Create table `opt_in_sources` with `id`, `tenant_id`, `name`, `type`, `status` (`active`/`inactive`), `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`.
   - Create table `opt_in_source_history` for change tracking.
4. **Enhanced RLS Policies**:
   - Enforce role-based operational permissions (Managers can manage contacts and campaigns; Agents are restricted to inbox conversations assigned to their department/team).

---

### 4. API Changes Required
1. `GET /api/contacts/export`: Stream CSV/XLSX export for All, Selected, or Filtered contacts.
2. `POST /api/contacts/opt-in-sources`: CRUD endpoints for opt-in sources.
3. `POST /api/templates`: Create and submit template to Meta Graph API.
4. `POST /api/campaigns`: Multi-step wizard submission and scheduling.
5. `POST /api/developer/keys`: Generate and return raw API key once with hashed storage.
6. `PATCH /api/developer/keys/[id]`: Rotate or revoke API keys.
7. `GET /api/settings/*`: Endpoints for the 15 settings sections.

---

### 5. Phase Dependency Chain
```
Phase 0 (Audit)
  └── Phase 1 (Database & Permissions Foundation)
        └── Phase 2 (Contact Management & Opt-In Sources)
              └── Phase 3 (Meta Template Management)
                    └── Phase 4 (Bulk Campaign Engine)
                          └── Phase 5 (Shared Inbox Enhancements)
                                └── Phase 6 (Developer API Key System)
                                      └── Phase 7 (Complete Settings Module)
                                            └── Phase 8 (Full End-to-End QA & Release)
```

---

### 6. Phase 0 Acceptance Decision
- **Status**: **ACCEPTED & SIGNED OFF**
- **Action**: Proceed immediately to **Phase 1 – Database, Tenant Ownership and Permissions**.

