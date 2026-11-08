// ============================================================================
// Authenticated Identity & Session State Endpoint (/api/auth/me)
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJwt } from '@/lib/services/token-signer';
import { ROLE_PERMISSIONS } from '@/lib/services/permissions-service';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('rlep_session')?.value;
  let session = sessionCookie ? await verifySessionJwt(sessionCookie) : null;

  if (!session && req.headers.get('authorization')?.startsWith('Bearer ')) {
    const rawBearer = req.headers.get('authorization')!.substring(7);
    session = await verifySessionJwt(rawBearer);
  }

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const role = (session.role as keyof typeof ROLE_PERMISSIONS) || 'agent';
  const permissions = ROLE_PERMISSIONS[role] || [];

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      displayName: session.displayName,
      role: session.role,
      isSuperAdmin: session.isSuperAdmin,
      isMfaVerified: session.isMfaVerified,
      tenantId: session.tenantId,
      permissions,
    },
  });
}

