// ============================================================================
// Super Admin Security Management API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';
import { logSecurityEvent } from '@/lib/services/auth-service';

export async function GET(req: NextRequest) {
  try {
    const pool = getNeonPool();

    // 1. Fetch recent security events
    const eventsRes = await pool.query(`
      SELECT 
        e.id, e.event_type as "eventType", e.severity, e.ip_address as "ipAddress",
        e.user_agent as "userAgent", e.details_json as details, e.created_at as "createdAt",
        u.email as "userEmail", u.display_name as "userName",
        t.name as "tenantName"
      FROM security_events e
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN tenants t ON t.id = e.tenant_id
      ORDER BY e.created_at DESC
      LIMIT 100
    `);

    // 2. Fetch active sessions
    const sessionsRes = await pool.query(`
      SELECT 
        s.id, s.role, s.is_super_admin as "isSuperAdmin", s.is_mfa_verified as "isMfaVerified",
        s.ip_address as "ipAddress", s.user_agent as "userAgent", s.created_at as "createdAt",
        s.last_active_at as "lastActiveAt", s.expires_at as "expiresAt",
        u.email as "userEmail", u.display_name as "userName",
        t.name as "tenantName"
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN tenants t ON t.id = s.tenant_id
      WHERE s.revoked_at IS NULL AND s.expires_at > NOW()
      ORDER BY s.last_active_at DESC
      LIMIT 50
    `);

    // 3. Fetch user accounts security status
    const usersRes = await pool.query(`
      SELECT 
        u.id, u.display_name as "displayName", u.email, u.status, u.email_verified as "emailVerified",
        u.failed_login_attempts as "failedAttempts", u.locked_until as "lockedUntil",
        u.is_super_admin as "isSuperAdmin", u.created_at as "createdAt",
        t.name as "tenantName", m.role
      FROM users u
      LEFT JOIN tenant_memberships m ON m.user_id = u.id AND m.status = 'active'
      LEFT JOIN tenants t ON t.id = m.tenant_id
      ORDER BY u.created_at DESC
      LIMIT 100
    `);

    const activeUsersCount = usersRes.rows.filter((u) => u.status === 'active').length;
    const suspendedUsersCount = usersRes.rows.filter((u) => u.status === 'suspended').length;
    const lockedAccountsCount = usersRes.rows.filter(
      (u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        activeSessions: sessionsRes.rows.length,
        activeUsers: activeUsersCount,
        suspendedUsers: suspendedUsersCount,
        lockedAccounts: lockedAccountsCount,
        mfaEnforced: true,
      },
      events: eventsRes.rows,
      sessions: sessionsRes.rows,
      users: usersRes.rows,
    });
  } catch (err: any) {
    console.error('[Super Admin Security API Error]', err.message);
    return NextResponse.json({ error: 'Failed to retrieve security dashboard data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, sessionId } = body;
    const pool = getNeonPool();

    if (action === 'suspend_user' && userId) {
      await pool.query(`UPDATE users SET status = 'suspended' WHERE id = $1`, [userId]);
      await pool.query(`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1`, [userId]);
      await logSecurityEvent({
        userId,
        eventType: 'user_suspended_by_admin',
        severity: 'high',
        details: { actionBy: 'super_admin' },
      });
      return NextResponse.json({ success: true, message: 'User account suspended and active sessions revoked.' });
    }

    if (action === 'reactivate_user' && userId) {
      await pool.query(
        `UPDATE users SET status = 'active', failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
        [userId]
      );
      await logSecurityEvent({
        userId,
        eventType: 'user_reactivated_by_admin',
        severity: 'medium',
        details: { actionBy: 'super_admin' },
      });
      return NextResponse.json({ success: true, message: 'User account reactivated.' });
    }

    if (action === 'unlock_account' && userId) {
      await pool.query(
        `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
        [userId]
      );
      await logSecurityEvent({
        userId,
        eventType: 'account_unlocked_by_admin',
        severity: 'medium',
        details: { actionBy: 'super_admin' },
      });
      return NextResponse.json({ success: true, message: 'Account unlocked and attempt counter cleared.' });
    }

    if (action === 'revoke_session' && sessionId) {
      await pool.query(`UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1`, [sessionId]);
      await logSecurityEvent({
        eventType: 'session_revoked_by_admin',
        severity: 'medium',
        details: { sessionId },
      });
      return NextResponse.json({ success: true, message: 'Session revoked immediately.' });
    }

    return NextResponse.json({ error: 'Invalid security action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

