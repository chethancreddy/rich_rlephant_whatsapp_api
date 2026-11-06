// ============================================================================
// White-Label Custom Branding Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_BRANDING,
  isValidHexColor,
  verifyCustomDomainCNAME,
  type WhiteLabelConfig,
} from '@/lib/services/branding-service';

// In-memory tenant branding store
const brandingStore = new Map<string, WhiteLabelConfig>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'default';

  const config = brandingStore.get(tenantId) || { ...DEFAULT_BRANDING, tenantId };

  return NextResponse.json({
    success: true,
    branding: config,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const {
    tenantId = 'default',
    brandName,
    primaryColor,
    accentColor,
    customDomain,
    logoUrl,
  } = body;

  if (primaryColor && !isValidHexColor(primaryColor)) {
    return NextResponse.json(
      { error: "Invalid primaryColor format. Hex required (e.g. '#72A4F2')", code: 'INVALID_COLOR' },
      { status: 422 }
    );
  }

  let cnameResult = { verified: false, message: 'No custom domain configured' };
  if (customDomain) {
    cnameResult = verifyCustomDomainCNAME(customDomain);
  }

  const updatedConfig: WhiteLabelConfig = {
    tenantId,
    brandName: brandName || DEFAULT_BRANDING.brandName,
    logoUrl: logoUrl || DEFAULT_BRANDING.logoUrl,
    faviconUrl: DEFAULT_BRANDING.faviconUrl,
    primaryColor: primaryColor || DEFAULT_BRANDING.primaryColor,
    accentColor: accentColor || DEFAULT_BRANDING.accentColor,
    customDomain: customDomain || undefined,
    cnameVerified: cnameResult.verified,
    supportEmail: DEFAULT_BRANDING.supportEmail,
    customFooterText: DEFAULT_BRANDING.customFooterText,
  };

  brandingStore.set(tenantId, updatedConfig);

  return NextResponse.json({
    success: true,
    branding: updatedConfig,
    cnameStatus: cnameResult,
  });
}

