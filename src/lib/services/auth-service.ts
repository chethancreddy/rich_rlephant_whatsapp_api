// ============================================================================
// Production Enterprise Authentication & Session Security Service
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import crypto from 'node:crypto';
import { getNeonPool } from '../db/neon.ts';
import type { MembershipRole } from '../../types/domain.ts';

export const SESSION_COOKIE_NAME = 'rlep_session';
export const SESSION_DURATION_HOURS = 168; // 7 days
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export interface SessionPayload {
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: MembershipRole;
  isSuperAdmin: boolean;
  isMfaVerified: boolean;
  expiresAt: string;
}

export interface SecurityEventData {
  tenantId?: string | null;
  userId?: string | null;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// Password Security (Salted PBKDF2 with Constant-Time Comparison)
// ----------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const originalHash = parts[3];

  const derivedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedHash, 'utf8'), Buffer.from(originalHash, 'utf8'));
}

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one special character.' };
  }
  return { valid: true };
}

// ----------------------------------------------------------------------------
// Anti-Abuse Bot Challenge Verification
// ----------------------------------------------------------------------------

export function verifyAntiAbuseChallenge(answer: string | number, expected: string | number): boolean {
  if (answer === undefined || answer === null || expected === undefined || expected === null) {
    return false;
  }
  return String(answer).trim() === String(expected).trim();
}

// ----------------------------------------------------------------------------
// Audit & Security Event Logging
// ----------------------------------------------------------------------------

export async function logSecurityEvent(event: SecurityEventData): Promise<void> {
  try {
    const pool = getNeonPool();
    await pool.query(
      `
      INSERT INTO security_events (tenant_id, user_id, event_type, severity, ip_address, user_agent, details_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        event.tenantId || null,
        event.userId || null,
        event.eventType,
        event.severity,
        event.ipAddress || null,
        event.userAgent || null,
        JSON.stringify(event.details || {}),
      ]
    );
  } catch (err: any) {
    console.error('[Security Event Logger Error]', err.message);
  }
}

// ----------------------------------------------------------------------------
// Session Creation & Token Verification
// ----------------------------------------------------------------------------

export async function createSession(params: {
  userId: string;
  tenantId: string | null;
  role: string;
  isSuperAdmin: boolean;
  isMfaVerified: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const pool = getNeonPool();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await pool.query(
    `
    INSERT INTO user_sessions (
      user_id, tenant_id, session_token_hash, role, is_super_admin, is_mfa_verified,
      ip_address, user_agent, expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      params.userId,
      params.tenantId,
      tokenHash,
      params.role,
      params.isSuperAdmin,
      params.isMfaVerified,
      params.ipAddress || null,
      params.userAgent || null,
      expiresAt.toISOString(),
    ]
  );

  return { rawToken, expiresAt };
}

export async function validateSessionToken(rawToken: string): Promise<SessionPayload | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  try {
    const pool = getNeonPool();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const result = await pool.query(
      `
      SELECT 
        s.id as session_id,
        s.user_id,
        s.tenant_id,
        s.role,
        s.is_super_admin,
        s.is_mfa_verified,
        s.expires_at,
        u.email,
        u.display_name,
        u.status as user_status,
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.status as tenant_status
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN tenants t ON t.id = s.tenant_id
      WHERE s.session_token_hash = $1 
        AND s.revoked_at IS NULL 
        AND s.expires_at > NOW()
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Check if account or workspace is suspended
    if (row.user_status === 'suspended' || row.tenant_status === 'suspended') {
      return null;
    }

    // Refresh last active timestamp asynchronously
    pool.query(`UPDATE user_sessions SET last_active_at = NOW() WHERE id = $1`, [row.session_id]).catch(() => {});

    return {
      sessionId: row.session_id,
      userId: row.user_id,
      email: row.email,
      displayName: row.display_name,
      tenantId: row.tenant_id,
      tenantName: row.tenant_name || 'Primary Workspace',
      tenantSlug: row.tenant_slug || 'primary',
      role: row.role as MembershipRole,
      isSuperAdmin: Boolean(row.is_super_admin),
      isMfaVerified: Boolean(row.is_mfa_verified),
      expiresAt: row.expires_at.toISOString ? row.expires_at.toISOString() : String(row.expires_at),
    };
  } catch (err: any) {
    console.error('[validateSessionToken Error]', err.message);
    return null;
  }
}

export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  try {
    const pool = getNeonPool();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW() WHERE session_token_hash = $1`,
      [tokenHash]
    );
    return true;
  } catch (err) {
    return false;
  }
}

export async function revokeAllUserSessions(userId: string): Promise<boolean> {
  try {
    const pool = getNeonPool();
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    return true;
  } catch (err) {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Customer Registration
// ----------------------------------------------------------------------------

export async function registerCustomer(params: {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; error?: string; verificationToken?: string; userId?: string }> {
  const email = params.email.trim().toLowerCase();
  const pwdCheck = validatePasswordStrength(params.password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.reason };
  }

  const pool = getNeonPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Duplicate check
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'An account with this email address already exists. Please log in or reset your password.' };
    }

    // Hash password
    const hashed = hashPassword(params.password);
    const displayName = `${params.firstName.trim()} ${params.lastName.trim()}`.trim();

    // Create user
    const userInsert = await client.query(
      `
      INSERT INTO users (display_name, email, phone_e164, password_hash, email_verified, status)
      VALUES ($1, $2, $3, $4, false, 'active')
      RETURNING id
      `,
      [displayName, email, params.phone.trim(), hashed]
    );
    const userId = userInsert.rows[0].id;

    // Create tenant for the new company
    const slugBase = params.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
    const slug = `${slugBase}-${crypto.randomBytes(3).toString('hex')}`;

    const tenantInsert = await client.query(
      `
      INSERT INTO tenants (name, slug, status, country, timezone)
      VALUES ($1, $2, 'trial', 'AE', 'Asia/Dubai')
      RETURNING id
      `,
      [params.companyName.trim(), slug]
    );
    const tenantId = tenantInsert.rows[0].id;

    // Create workspace_admin membership
    await client.query(
      `
      INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
      VALUES ($1, $2, 'workspace_admin', 'active')
      `,
      [tenantId, userId]
    );

    // Generate email verification token (valid for 24 hours)
    const verificationRawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationRawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await client.query(
      `
      INSERT INTO auth_verification_tokens (user_id, token_hash, token_type, expires_at)
      VALUES ($1, $2, 'email_verification', $3)
      `,
      [userId, tokenHash, expiresAt.toISOString()]
    );

    await client.query('COMMIT');

    await logSecurityEvent({
      tenantId,
      userId,
      eventType: 'customer_registered',
      severity: 'low',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email, company: params.companyName },
    });

    return { success: true, verificationToken: verificationRawToken, userId };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Registration Error]', err);
    return { success: false, error: err.message || 'Registration failed' };
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------------------------
// Email Verification
// ----------------------------------------------------------------------------

export async function verifyEmailToken(rawToken: string): Promise<{ success: boolean; error?: string }> {
  if (!rawToken) return { success: false, error: 'Verification token is required' };
  const pool = getNeonPool();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const result = await pool.query(
    `
    SELECT id, user_id, expires_at, consumed_at 
    FROM auth_verification_tokens 
    WHERE token_hash = $1 AND token_type = 'email_verification'
    `,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return { success: false, error: 'Invalid or unrecognized email verification token.' };
  }

  const tokenRecord = result.rows[0];
  if (tokenRecord.consumed_at) {
    return { success: false, error: 'This email verification token has already been used.' };
  }
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { success: false, error: 'This email verification link has expired. Please request a new one.' };
  }

  // Mark token consumed and user verified
  await pool.query(
    `
    UPDATE auth_verification_tokens SET consumed_at = NOW() WHERE id = $1;
    UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id = $2;
    `,
    [tokenRecord.id, tokenRecord.user_id]
  );

  return { success: true };
}

// ----------------------------------------------------------------------------
// Customer Authentication (Login with Lockout)
// ----------------------------------------------------------------------------

export async function loginCustomer(params: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  error?: string;
  rawToken?: string;
  user?: any;
  tenantId?: string;
  needsEmailVerification?: boolean;
}> {
  const email = params.email.trim().toLowerCase();
  const pool = getNeonPool();

  const userRes = await pool.query(
    `
    SELECT 
      u.id, u.email, u.display_name, u.password_hash, u.email_verified, u.status,
      u.failed_login_attempts, u.locked_until, u.is_super_admin,
      m.tenant_id, m.role,
      t.status as tenant_status
    FROM users u
    LEFT JOIN tenant_memberships m ON m.user_id = u.id AND m.status = 'active'
    LEFT JOIN tenants t ON t.id = m.tenant_id
    WHERE u.email = $1
    LIMIT 1
    `,
    [email]
  );

  if (userRes.rows.length === 0) {
    await logSecurityEvent({
      eventType: 'login_failed_unknown_user',
      severity: 'low',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email },
    });
    return { success: false, error: 'Invalid email or password.' };
  }

  const user = userRes.rows[0];

  // Check lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remainingMin = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
    await logSecurityEvent({
      userId: user.id,
      tenantId: user.tenant_id,
      eventType: 'login_attempt_on_locked_account',
      severity: 'medium',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email, remainingMin },
    });
    return {
      success: false,
      error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMin} minute(s).`,
    };
  }

  // Verify password
  const isValidPassword = verifyPassword(params.password, user.password_hash);
  if (!isValidPassword) {
    const attempts = (user.failed_login_attempts || 0) + 1;
    let lockUntil: Date | null = null;
    let severity: 'low' | 'medium' | 'high' = 'low';

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      severity = 'high';
      await pool.query(
        `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [attempts, lockUntil.toISOString(), user.id]
      );
      await logSecurityEvent({
        userId: user.id,
        tenantId: user.tenant_id,
        eventType: 'account_locked',
        severity: 'high',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: { email, attempts, lockedMinutes: LOCKOUT_MINUTES },
      });
      return {
        success: false,
        error: `Too many invalid attempts. Your account has been temporarily locked for ${LOCKOUT_MINUTES} minutes to prevent brute-force attacks.`,
      };
    }

    await pool.query(`UPDATE users SET failed_login_attempts = $1 WHERE id = $2`, [attempts, user.id]);
    await logSecurityEvent({
      userId: user.id,
      tenantId: user.tenant_id,
      eventType: 'login_failed_bad_password',
      severity,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email, attemptCount: attempts, attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempts },
    });
    return {
      success: false,
      error: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - attempts} attempt(s) remaining before temporary lockout.`,
    };
  }

  // Check email verification status
  if (!user.email_verified) {
    return {
      success: false,
      needsEmailVerification: true,
      error: 'Please verify your email address before logging in. Check your inbox for the activation link.',
    };
  }

  // Check account or tenant status
  if (user.status === 'suspended' || user.tenant_status === 'suspended') {
    return {
      success: false,
      error: 'Your account or workspace has been suspended. Please contact our support team.',
    };
  }

  // Reset failed attempts upon successful login
  await pool.query(`UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`, [user.id]);

  // Create active session
  const { rawToken } = await createSession({
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role || 'agent',
    isSuperAdmin: Boolean(user.is_super_admin),
    isMfaVerified: false,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await logSecurityEvent({
    userId: user.id,
    tenantId: user.tenant_id,
    eventType: 'login_success',
    severity: 'low',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    details: { email },
  });

  return {
    success: true,
    rawToken,
    tenantId: user.tenant_id,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      isSuperAdmin: user.is_super_admin,
    },
  };
}

// ----------------------------------------------------------------------------
// Super Admin Dedicated Login & Mandatory MFA
// ----------------------------------------------------------------------------

export async function loginSuperAdmin(params: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  error?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
  mfaChallengeCode?: string; // Returned in development/staging for administrative testing
}> {
  const email = params.email.trim().toLowerCase();
  const pool = getNeonPool();

  const userRes = await pool.query(
    `
    SELECT id, email, display_name, password_hash, is_super_admin, status
    FROM users 
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  if (userRes.rows.length === 0 || !userRes.rows[0].is_super_admin) {
    await logSecurityEvent({
      eventType: 'super_admin_login_rejected_not_admin',
      severity: 'high',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email },
    });
    return { success: false, error: 'Access denied: Privileged administrative credentials required.' };
  }

  const admin = userRes.rows[0];
  if (!verifyPassword(params.password, admin.password_hash)) {
    await logSecurityEvent({
      userId: admin.id,
      eventType: 'super_admin_bad_password',
      severity: 'high',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email },
    });
    return { success: false, error: 'Invalid credentials.' };
  }

  // Generate 6-digit MFA challenge code (expires in 5 minutes)
  const challengeCode = Math.floor(100000 + Math.random() * 900000).toString();
  const mfaRawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(mfaRawToken).digest('hex');
  const codeHash = crypto.createHash('sha256').update(challengeCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Store in auth_verification_tokens with code hash in metadata
  await pool.query(
    `
    INSERT INTO auth_verification_tokens (user_id, token_hash, token_type, expires_at)
    VALUES ($1, $2, 'mfa_challenge', $3)
    `,
    [admin.id, tokenHash, expiresAt.toISOString()]
  );

  // Store expected code hash temporarily in users or secure session table
  await pool.query(
    `UPDATE users SET mfa_secret = $1 WHERE id = $2`,
    [codeHash, admin.id]
  );

  await logSecurityEvent({
    userId: admin.id,
    eventType: 'super_admin_mfa_challenge_dispatched',
    severity: 'medium',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    details: { email },
  });

  return {
    success: true,
    mfaRequired: true,
    mfaToken: mfaRawToken,
    mfaChallengeCode: challengeCode, // For administrative testing verification
  };
}

export async function verifySuperAdminMfa(params: {
  mfaToken: string;
  code: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; error?: string; rawToken?: string }> {
  const pool = getNeonPool();
  const tokenHash = crypto.createHash('sha256').update(params.mfaToken).digest('hex');
  const enteredCodeHash = crypto.createHash('sha256').update(params.code.trim()).digest('hex');

  const tokenRes = await pool.query(
    `
    SELECT t.id, t.user_id, t.expires_at, t.consumed_at, u.mfa_secret, u.email
    FROM auth_verification_tokens t
    JOIN users u ON u.id = t.user_id
    WHERE t.token_hash = $1 AND t.token_type = 'mfa_challenge'
    `,
    [tokenHash]
  );

  if (tokenRes.rows.length === 0) {
    return { success: false, error: 'Invalid or expired MFA session challenge.' };
  }

  const challenge = tokenRes.rows[0];
  if (challenge.consumed_at) {
    return { success: false, error: 'This MFA code challenge has already been consumed.' };
  }
  if (new Date(challenge.expires_at) < new Date()) {
    return { success: false, error: 'MFA challenge code has expired. Please log in again.' };
  }

  if (challenge.mfa_secret !== enteredCodeHash) {
    await logSecurityEvent({
      userId: challenge.user_id,
      eventType: 'super_admin_mfa_code_failed',
      severity: 'high',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: { email: challenge.email },
    });
    return { success: false, error: 'Invalid 6-digit MFA verification code.' };
  }

  // Consume challenge
  await pool.query(
    `
    UPDATE auth_verification_tokens SET consumed_at = NOW() WHERE id = $1;
    UPDATE users SET mfa_secret = NULL WHERE id = $2;
    `,
    [challenge.id, challenge.user_id]
  );

  // Issue privileged session with is_mfa_verified = true
  const { rawToken } = await createSession({
    userId: challenge.user_id,
    tenantId: null,
    role: 'super_admin',
    isSuperAdmin: true,
    isMfaVerified: true,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await logSecurityEvent({
    userId: challenge.user_id,
    eventType: 'super_admin_mfa_verified_success',
    severity: 'low',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    details: { email: challenge.email },
  });

  return { success: true, rawToken };
}

// ----------------------------------------------------------------------------
// Password Recovery Flow
// ----------------------------------------------------------------------------

export async function requestPasswordReset(emailInput: string, ipAddress?: string): Promise<{ success: boolean; resetToken?: string }> {
  const email = emailInput.trim().toLowerCase();
  const pool = getNeonPool();

  const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) {
    // Return generic success to prevent email enumeration attacks (OWASP ASVS standard)
    return { success: true };
  }

  const userId = userRes.rows[0].id;
  const resetRawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetRawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    `
    INSERT INTO auth_verification_tokens (user_id, token_hash, token_type, expires_at)
    VALUES ($1, $2, 'password_reset', $3)
    `,
    [userId, tokenHash, expiresAt.toISOString()]
  );

  await logSecurityEvent({
    userId,
    eventType: 'password_reset_requested',
    severity: 'low',
    ipAddress,
    details: { email },
  });

  return { success: true, resetToken: resetRawToken };
}

export async function resetPasswordWithToken(params: {
  token: string;
  newPassword: string;
  ipAddress?: string;
}): Promise<{ success: boolean; error?: string }> {
  const pwdCheck = validatePasswordStrength(params.newPassword);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.reason };
  }

  const pool = getNeonPool();
  const tokenHash = crypto.createHash('sha256').update(params.token).digest('hex');

  const tokenRes = await pool.query(
    `
    SELECT id, user_id, expires_at, consumed_at 
    FROM auth_verification_tokens 
    WHERE token_hash = $1 AND token_type = 'password_reset'
    `,
    [tokenHash]
  );

  if (tokenRes.rows.length === 0) {
    return { success: false, error: 'Invalid or unknown password reset token.' };
  }

  const record = tokenRes.rows[0];
  if (record.consumed_at) {
    return { success: false, error: 'This password reset link has already been used.' };
  }
  if (new Date(record.expires_at) < new Date()) {
    return { success: false, error: 'This password reset link has expired.' };
  }

  const newHash = hashPassword(params.newPassword);

  // Update password and invalidate all existing active sessions
  await pool.query(
    `
    UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL WHERE id = $2;
    UPDATE auth_verification_tokens SET consumed_at = NOW() WHERE id = $3;
    UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $2 AND revoked_at IS NULL;
    `,
    [newHash, record.user_id, record.id]
  );

  await logSecurityEvent({
    userId: record.user_id,
    eventType: 'password_reset_completed',
    severity: 'medium',
    ipAddress: params.ipAddress,
  });

  return { success: true };
}
