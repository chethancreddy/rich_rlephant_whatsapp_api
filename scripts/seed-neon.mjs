// ============================================================================
// Database Seeder for Neon Serverless PostgreSQL
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Helper to auto-load .env.local and .env
function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (err) {}
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_pk6gIFE3PiSX@ep-long-poetry-beapdx7x-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function seedDatabase() {
  console.log('🐘 Connecting to Neon Database to seed initial data...');
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Seed Plans
    console.log('📦 Seeding Subscription Plans...');
    await client.query(`
      INSERT INTO plans (id, code, name, monthly_price_usd, entitlements_json, is_active)
      VALUES 
        ('00000000-0000-0000-0000-000000000101', 'starter', 'Starter Pro', 49.00, '{"max_contacts": 1000, "max_waba": 1, "max_agents": 2}', true),
        ('00000000-0000-0000-0000-000000000102', 'growth', 'Growth Scale', 99.00, '{"max_contacts": 10000, "max_waba": 2, "max_agents": 5}', true),
        ('00000000-0000-0000-0000-000000000103', 'enterprise', 'Enterprise High-Scale', 249.00, '{"max_contacts": 50000, "max_waba": 10, "max_agents": 20}', true)
      ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name, 
        monthly_price_usd = EXCLUDED.monthly_price_usd;
    `);

    // 2. Seed Pricing Rules
    console.log('💵 Seeding Meta Rate Card Pricing Rules...');
    await client.query(`
      INSERT INTO pricing_rules (country_code, category, rate_usd, effective_from)
      VALUES 
        ('971', 'MARKETING', 0.0310, NOW()),
        ('971', 'UTILITY', 0.0180, NOW()),
        ('971', 'AUTHENTICATION', 0.0210, NOW()),
        ('971', 'SERVICE', 0.0150, NOW()),
        ('1', 'MARKETING', 0.0250, NOW()),
        ('1', 'UTILITY', 0.0150, NOW()),
        ('91', 'MARKETING', 0.0100, NOW()),
        ('91', 'UTILITY', 0.0050, NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 3. Seed Tenants (Workspaces)
    console.log('🏢 Seeding Tenant Workspaces...');
    const tenant1Id = '00000000-0000-0000-0000-000000000001';
    const tenant2Id = '00000000-0000-0000-0000-000000000002';

    await client.query(`
      INSERT INTO tenants (id, name, slug, country, timezone, status, plan_id, settings_json)
      VALUES 
        ('${tenant1Id}', 'Acme Dubai Retail', 'acme-dubai-retail', 'AE', 'Asia/Dubai', 'active', '00000000-0000-0000-0000-000000000102', '{"theme": "cozy", "currency": "USD"}'),
        ('${tenant2Id}', 'Beta Luxury Auto Spa', 'beta-luxury-auto', 'AE', 'Asia/Dubai', 'active', '00000000-0000-0000-0000-000000000101', '{"theme": "cozy", "currency": "USD"}')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
    `);

    // 4. Seed User (Super Admin & Workspace Owner)
    console.log('👤 Seeding Primary User...');
    const userId = '00000000-0000-0000-0000-000000000005';
    await client.query(`
      INSERT INTO users (id, display_name, email, phone_e164, status)
      VALUES ('${userId}', 'Chethan Reddy', 'chethancreddy@users.noreply.github.com', '+971501234567', 'active')
      ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name;
    `);

    // 5. Seed Tenant Memberships
    console.log('🔑 Seeding Role-Based Memberships...');
    await client.query(`
      INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
      VALUES 
        ('${tenant1Id}', '${userId}', 'super_admin', 'active'),
        ('${tenant2Id}', '${userId}', 'workspace_owner', 'active')
      ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    `);

    // 6. Seed Meta Connection & Phone Number
    console.log('📱 Seeding Meta WhatsApp Cloud API Connection...');
    const metaConnId = '00000000-0000-0000-0000-000000000010';
    const phoneRecordId = '00000000-0000-0000-0000-000000000015';
    const wabaId = '2173616099891608';
    const metaPhoneId = '1452097831319023';

    await client.query(`
      INSERT INTO meta_connections (
        id, tenant_id, business_id, waba_id, app_id, 
        token_ciphertext, token_iv, token_tag, status, scopes
      )
      VALUES (
        '${metaConnId}', '${tenant1Id}', 'biz_dubai_retail_01', '${wabaId}', 'app_meta_cloud_2026',
        'enc_cipher_mock', 'enc_iv_mock', 'enc_tag_mock', 'active',
        ARRAY['whatsapp_business_messaging', 'whatsapp_business_management']
      )
      ON CONFLICT (tenant_id, waba_id) DO UPDATE SET status = 'active';

      INSERT INTO phone_numbers (
        id, tenant_id, meta_connection_id, phone_number_id, display_phone_number, 
        verified_name, quality_rating, connection_status, is_default
      )
      VALUES (
        '${phoneRecordId}', '${tenant1Id}', '${metaConnId}', '${metaPhoneId}', '+1 (555) 176-8297',
        'Acme Dubai Retail Official', 'GREEN', 'CONNECTED', true
      )
      ON CONFLICT (tenant_id, phone_number_id) DO UPDATE SET quality_rating = 'GREEN';
    `);

    // 7. Seed Opt-In Sources
    console.log('🛡️ Seeding Verifiable Opt-In Sources...');
    await client.query(`
      INSERT INTO opt_in_sources (id, tenant_id, name, type, description, is_active)
      VALUES 
        ('00000000-0000-0000-0000-000000000021', '${tenant1Id}', 'Website Checkout Checkbox', 'checkout_checkbox', 'E-Commerce checkout explicit WhatsApp opt-in', true),
        ('00000000-0000-0000-0000-000000000022', '${tenant1Id}', 'Storefront QR Code', 'qr_code', 'Physical retail POS scan to WhatsApp', true),
        ('00000000-0000-0000-0000-000000000023', '${tenant1Id}', 'Inbound Customer Service Request', 'inbound_whatsapp', 'Customer initiated inbound chat window', true)
      ON CONFLICT (tenant_id, name) DO NOTHING;
    `);

    // 8. Seed Contacts with Verified Consent
    console.log('👥 Seeding Contacts & Consent Records...');
    const contact1Id = '00000000-0000-0000-0000-000000000031';
    const contact2Id = '00000000-0000-0000-0000-000000000032';
    const contact3Id = '00000000-0000-0000-0000-000000000033';

    await client.query(`
      INSERT INTO contacts (id, tenant_id, phone_e164, name, first_name, email, source, campaign_eligibility)
      VALUES 
        ('${contact1Id}', '${tenant1Id}', '+971504432190', 'Tariq Mansoor', 'Tariq', 'tariq@example.ae', 'checkout_checkbox', true),
        ('${contact2Id}', '${tenant1Id}', '+971528819022', 'Sarah Al Hashmi', 'Sarah', 'sarah@example.ae', 'qr_code', true),
        ('${contact3Id}', '${tenant1Id}', '+971553321100', 'Rahul Sharma', 'Rahul', 'rahul@example.com', 'inbound_whatsapp', true)
      ON CONFLICT (tenant_id, phone_e164) DO UPDATE SET campaign_eligibility = true;

      INSERT INTO consent_records (tenant_id, contact_id, purpose, category, status, source)
      VALUES 
        ('${tenant1Id}', '${contact1Id}', 'marketing', 'MARKETING', 'granted', 'website_checkout'),
        ('${tenant1Id}', '${contact2Id}', 'marketing', 'MARKETING', 'granted', 'store_qr_code'),
        ('${tenant1Id}', '${contact3Id}', 'customer_care', 'SERVICE', 'granted', 'inbound_chat')
      ON CONFLICT DO NOTHING;
    `);

    // 9. Seed Templates
    console.log('📝 Seeding WhatsApp Message Templates...');
    await client.query(`
      INSERT INTO templates (
        tenant_id, waba_id, meta_template_id, name, language, category, 
        status, components_json, variable_count
      )
      VALUES 
        (
          '${tenant1Id}', '${wabaId}', 'tpl_meta_001', 'order_confirmation_v1', 'en', 'UTILITY',
          'APPROVED', '[{"type": "BODY", "text": "Hello {{1}}, your order #{{2}} has been confirmed."}]'::jsonb, 2
        ),
        (
          '${tenant1Id}', '${wabaId}', 'tpl_meta_002', 'ramadan_exclusive_v2', 'en', 'MARKETING',
          'APPROVED', '[{"type": "BODY", "text": "Hello {{1}}! Exclusive 30% VIP discount on our seasonal collection."}]'::jsonb, 1
        )
      ON CONFLICT (tenant_id, waba_id, name, language) DO UPDATE SET status = 'APPROVED';
    `);

    // 10. Seed Active Conversations & Messages
    console.log('💬 Seeding Shared Inbox Conversations & Messages...');
    const phoneRes = await client.query('SELECT id FROM phone_numbers WHERE phone_number_id = $1', [metaPhoneId]);
    const actualPhoneRecordId = phoneRes.rows[0]?.id || phoneRecordId;

    const conv1Id = '00000000-0000-0000-0000-000000000041';
    await client.query(`
      INSERT INTO conversations (
        id, tenant_id, contact_id, phone_number_id, status, 
        last_message_at, unread_count, service_window_expires_at, last_message_preview
      )
      VALUES (
        '${conv1Id}', '${tenant1Id}', '${contact1Id}', '${actualPhoneRecordId}', 'open',
        NOW(), 1, NOW() + INTERVAL '24 hours', 'Can you please confirm my delivery window for order #98127?'
      )
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO messages (
        id, tenant_id, conversation_id, contact_id, phone_number_id, direction, 
        message_type, category, provider_message_id, status, sent_at, delivered_at
      )
      VALUES 
        (
          '00000000-0000-0000-0000-000000000051', '${tenant1Id}', '${conv1Id}', '${contact1Id}', '${actualPhoneRecordId}', 'inbound', 
          'text', 'SERVICE', 'wamid_sample_inbound_01', 
          'delivered', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'
        ),
        (
          '00000000-0000-0000-0000-000000000052', '${tenant1Id}', '${conv1Id}', '${contact1Id}', '${actualPhoneRecordId}', 'outbound', 
          'text', 'SERVICE', 'wamid_sample_outbound_02', 
          'read', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'
        )
      ON CONFLICT (provider_message_id) DO NOTHING;

      INSERT INTO conversation_messages (
        tenant_id, conversation_id, message_id, body
      )
      VALUES 
        (
          '${tenant1Id}', '${conv1Id}', '00000000-0000-0000-0000-000000000051',
          'Can you please confirm my delivery window for order #98127?'
        ),
        (
          '${tenant1Id}', '${conv1Id}', '00000000-0000-0000-0000-000000000052',
          'Hello Tariq! Your driver is on the way and scheduled to arrive by 2:30 PM.'
        )
      ON CONFLICT DO NOTHING;
    `);

    console.log('\n🎉 Successfully seeded Neon Database with initial production data!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
