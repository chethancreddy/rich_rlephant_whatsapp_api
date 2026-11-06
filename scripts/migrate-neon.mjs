// ============================================================================
// Neon PostgreSQL Database Migrations Runner
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('placeholder')) {
  console.error('\n❌ ERROR: DATABASE_URL is not set or contains placeholder values.');
  console.error('Please configure your Neon Connection String in your environment or .env.local:');
  console.error('  DATABASE_URL="postgresql://neondb_owner:npg_...@ep-...neon.tech/neondb?sslmode=require"\n');
  process.exit(1);
}

async function runNeonMigrations() {
  console.log('🐘 Connecting to Neon Serverless PostgreSQL...');
  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon database successfully!\n');

    // Create migrations tracker table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Read all SQL files in order
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files in supabase/migrations/\n`);

    for (const file of files) {
      const checkRes = await client.query(
        'SELECT version FROM _schema_migrations WHERE version = $1',
        [file]
      );

      if (checkRes.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`⚡ Applying ${file}...`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      // Execute migration
      await client.query(sqlContent);

      // Record applied migration
      await client.query(
        'INSERT INTO _schema_migrations (version) VALUES ($1)',
        [file]
      );
      console.log(`✅ Applied ${file} successfully`);
    }

    client.release();
    console.log('\n🎉 All Neon database migrations applied successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runNeonMigrations();
