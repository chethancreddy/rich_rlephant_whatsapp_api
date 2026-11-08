// ============================================================================
// Seed Super Admin and Customer Users with Secure Hashes
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { Pool } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_pk6gIFE3PiSX@ep-long-poetry-beapdx7x-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

async function main() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding administrative and test users into Neon DB...');

    const superAdminPasswordHash = hashPassword('Admin@RichRlephant2026!');
    const demoPasswordHash = hashPassword('Demo@RichRlephant2026!');

    // 1. Super Admin User
    await client.query(`
      INSERT INTO users (id, display_name, email, password_hash, email_verified, is_super_admin, status)
      VALUES (
        '00000000-0000-0000-0000-000000000099',
        'Chief Security Officer',
        'admin@rich-rlephant.com',
        $1,
        true,
        true,
        'active'
      )
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $1,
        email_verified = true,
        is_super_admin = true,
        status = 'active',
        failed_login_attempts = 0,
        locked_until = NULL;
    `, [superAdminPasswordHash]);

    console.log('✅ Super Admin provisioned: admin@rich-rlephant.com');

    // 2. Demo Customer Admin User
    const userRes = await client.query(`
      INSERT INTO users (id, display_name, email, password_hash, email_verified, is_super_admin, status)
      VALUES (
        '00000000-0000-0000-0000-000000000010',
        'Chethan Reddy',
        'demo@rich-rlephant.com',
        $1,
        true,
        false,
        'active'
      )
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $1,
        email_verified = true,
        status = 'active',
        failed_login_attempts = 0,
        locked_until = NULL
      RETURNING id;
    `, [demoPasswordHash]);

    const demoUserId = userRes.rows[0]?.id || '00000000-0000-0000-0000-000000000010';

    // 3. Ensure membership in tenant 1
    await client.query(`
      INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        $1,
        'workspace_admin',
        'active'
      )
      ON CONFLICT (tenant_id, user_id) DO UPDATE SET
        role = 'workspace_admin',
        status = 'active';
    `, [demoUserId]);

    console.log('✅ Workspace Admin provisioned: demo@rich-rlephant.com');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
