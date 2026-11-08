// ============================================================================
// Vercel Cron / Outbox Queue Processor Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';
import { OutboxWorkerDaemon, type OutboxJob } from '@/worker/outbox-worker';

export const dynamic = 'force-dynamic';

/**
 * GET or POST /api/cron/outbox
 * Drains pending outbox_jobs from Neon PostgreSQL and dispatches via worker
 */
export async function GET(req: NextRequest) {
  return handleOutboxDrain(req);
}

export async function POST(req: NextRequest) {
  return handleOutboxDrain(req);
}

async function handleOutboxDrain(req: NextRequest) {
  const startTime = Date.now();
  const worker = new OutboxWorkerDaemon();

  try {
    const pool = getNeonPool();
    const client = await pool.connect();

    try {
      // 1. Atomically claim up to 25 available outbox jobs
      const claimRes = await client.query(`
        UPDATE outbox_jobs
        SET 
          status = 'claimed',
          locked_until = NOW() + INTERVAL '2 minutes',
          attempts = attempts + 1,
          updated_at = NOW()
        WHERE id IN (
          SELECT id FROM outbox_jobs
          WHERE 
            status = 'available'
            AND available_at <= NOW()
            AND (locked_until IS NULL OR locked_until < NOW())
          ORDER BY available_at ASC
          LIMIT 25
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `);

      const claimedJobs = claimRes.rows;
      if (claimedJobs.length === 0) {
        return NextResponse.json({
          status: 'idle',
          message: 'No available jobs in outbox queue',
          processed: 0,
          durationMs: Date.now() - startTime,
        });
      }

      let succeededCount = 0;
      let failedCount = 0;

      for (const jobRow of claimedJobs) {
        const outboxJob: OutboxJob = {
          id: jobRow.id,
          tenant_id: jobRow.tenant_id,
          job_type: jobRow.job_type,
          payload_json: jobRow.payload_json,
          attempts: jobRow.attempts,
        };

        const result = await worker.processJob(outboxJob);

        if (result.success) {
          succeededCount++;
          await client.query(
            `
            UPDATE outbox_jobs 
            SET status = 'completed', updated_at = NOW() 
            WHERE id = $1
            `,
            [jobRow.id]
          );

          // Update message if aggregate_id points to messages
          if (jobRow.aggregate_id) {
            await client.query(
              `
              UPDATE messages
              SET status = 'sent', sent_at = NOW(), provider_message_id = $2
              WHERE id = $1
              `,
              [jobRow.aggregate_id, result.providerId || null]
            );
          }
        } else {
          failedCount++;
          const willRetry = jobRow.attempts < jobRow.max_attempts;
          await client.query(
            `
            UPDATE outbox_jobs 
            SET 
              status = $1, 
              last_error = $2,
              locked_until = NULL,
              available_at = NOW() + INTERVAL '30 seconds',
              updated_at = NOW()
            WHERE id = $3
            `,
            [willRetry ? 'available' : 'dead_letter', result.reason || 'Dispatch failed', jobRow.id]
          );
        }
      }

      return NextResponse.json({
        status: 'success',
        processed: claimedJobs.length,
        succeeded: succeededCount,
        failed: failedCount,
        durationMs: Date.now() - startTime,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Outbox Cron Worker Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to process outbox queue', details: err.message },
      { status: 500 }
    );
  }
}
