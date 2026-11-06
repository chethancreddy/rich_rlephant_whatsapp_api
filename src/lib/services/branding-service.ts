// ============================================================================
// White-Label Branding & Custom Domain Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export interface WhiteLabelConfig {
  tenantId: string;
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string; // Hex format e.g. #72A4F2
  accentColor: string;
  customDomain?: string; // e.g. whatsapp.acme.com
  cnameVerified: boolean;
  supportEmail: string;
  customFooterText: string;
}

export const DEFAULT_BRANDING: WhiteLabelConfig = {
  tenantId: 'default',
  brandName: 'Rich Rlephant Marketing Whatsapp API',
  logoUrl: '/brand/rlephant-logo.svg',
  faviconUrl: '/favicon.ico',
  primaryColor: '#72A4F2', // Ko-fi Sky Blue default
  accentColor: '#202020',  // Core Ink
  cnameVerified: false,
  supportEmail: 'support@rich-rlephant.com',
  customFooterText: 'Powered by Rich Rlephant Marketing Whatsapp API',
};

/**
 * Validates custom brand color format
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/**
 * Validates domain name format
 */
export function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(domain);
}

/**
 * Simulates CNAME DNS verification for white-label custom domain routing
 */
export function verifyCustomDomainCNAME(
  domain: string,
  expectedTarget: string = 'cname.rich-rlephant.com',
  mockDnsRecords?: Record<string, string>
): { verified: boolean; target: string; message: string } {
  if (!isValidDomain(domain)) {
    return {
      verified: false,
      target: expectedTarget,
      message: 'Invalid domain syntax. Expected format: sub.domain.com',
    };
  }

  if (mockDnsRecords) {
    const resolvedTarget = mockDnsRecords[domain.toLowerCase()];
    if (resolvedTarget === expectedTarget) {
      return {
        verified: true,
        target: expectedTarget,
        message: 'CNAME record verified successfully. SSL certificate provisioning queued.',
      };
    } else {
      return {
        verified: false,
        target: expectedTarget,
        message: `CNAME check failed. DNS currently points to '${resolvedTarget || 'unresolved'}'. Point CNAME to '${expectedTarget}'.`,
      };
    }
  }

  // Default simulated verification
  return {
    verified: true,
    target: expectedTarget,
    message: 'CNAME verified.',
  };
}

