// ============================================================================
// Neon Serverless PostgreSQL Database Client
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { neon, neonConfig, Pool } from '@neondatabase/serverless';

// Configure connection parameters for edge / serverless compatibility
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_placeholder@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/neondb?sslmode=require';

/**
 * Returns a tagged template SQL executor for Neon Serverless
 * Example: const users = await sql`SELECT * FROM users WHERE tenant_id = ${tenantId}`;
 */
export function getNeonSql() {
  return neon(connectionString);
}

/**
 * Returns a connection pool for transactional workloads and batch migrations
 */
let poolInstance: Pool | null = null;

export function getNeonPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({ connectionString });
  }
  return poolInstance;
}

/**
 * Health check helper to verify Neon database connectivity
 */
export async function checkNeonConnection(): Promise<{
  connected: boolean;
  version?: string;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const sql = getNeonSql();
    const rows = await sql`SELECT version(), current_database() as db_name, now() as current_time`;
    return {
      connected: true,
      version: rows[0]?.version || 'PostgreSQL (Neon)',
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: err.message || 'Unable to connect to Neon database',
    };
  }
}

