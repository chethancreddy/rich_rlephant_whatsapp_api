// ============================================================================
// WhatsApp 24-Hour Customer-Service Window Utility
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export const SERVICE_WINDOW_HOURS = 24;

export interface ServiceWindowStatus {
  isActive: boolean;
  remainingMinutes: number;
  remainingFormatted: string;
  expiresAt: Date;
  requiresTemplate: boolean;
}

/**
 * Calculates whether the 24-hour customer service window is currently active
 * based on the timestamp of the last message received from the customer.
 */
export function calculateServiceWindow(lastCustomerMessageAt?: Date | string | null): ServiceWindowStatus {
  if (!lastCustomerMessageAt) {
    const expiredDate = new Date(0);
    return {
      isActive: false,
      remainingMinutes: 0,
      remainingFormatted: 'Expired (Template Required)',
      expiresAt: expiredDate,
      requiresTemplate: true,
    };
  }

  const lastInboundTime = new Date(lastCustomerMessageAt).getTime();
  const windowDurationMs = SERVICE_WINDOW_HOURS * 60 * 60 * 1000;
  const expiresAtMs = lastInboundTime + windowDurationMs;
  const nowMs = Date.now();

  const remainingMs = expiresAtMs - nowMs;

  if (remainingMs <= 0) {
    return {
      isActive: false,
      remainingMinutes: 0,
      remainingFormatted: 'Expired (Template Required)',
      expiresAt: new Date(expiresAtMs),
      requiresTemplate: true,
    };
  }

  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  return {
    isActive: true,
    remainingMinutes,
    remainingFormatted: `${hours}h ${minutes}m remaining`,
    expiresAt: new Date(expiresAtMs),
    requiresTemplate: false,
  };
}

