// ============================================================================
// Phone Normalizer Utility (E.164 Standards)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export interface NormalizedPhone {
  isValid: boolean;
  e164: string;
  countryCode?: string;
  rawInput: string;
  errorMessage?: string;
}

const COUNTRY_DIALING_CODES: Record<string, string> = {
  '971': 'AE',
  '91': 'IN',
  '1': 'US',
  '44': 'GB',
  '966': 'SA',
  '974': 'QA',
  '968': 'OM',
  '965': 'KW',
  '973': 'BH',
  '65': 'SG',
  '61': 'AU',
  '49': 'DE',
  '33': 'FR',
};

/**
 * Normalizes an arbitrary phone string into a strict E.164 format.
 * Example: "050 123 4567" with defaultCountry 'AE' -> "+971501234567"
 * Example: "+91 98765-43210" -> "+919876543210"
 */
export function normalizePhoneE164(
  input: string,
  defaultCountryCode: string = 'AE'
): NormalizedPhone {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      e164: '',
      rawInput: String(input || ''),
      errorMessage: 'Phone number is empty or not a string',
    };
  }

  const cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  let digitsOnly = cleaned;
  const hasLeadingPlus = cleaned.startsWith('+');

  if (hasLeadingPlus) {
    digitsOnly = cleaned.slice(1);
  }

  // Reject non-numeric characters
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      e164: '',
      rawInput: input,
      errorMessage: 'Phone number contains non-numeric characters',
    };
  }

  // If local national number without country code
  if (!hasLeadingPlus) {
    if (defaultCountryCode === 'AE') {
      if (digitsOnly.startsWith('05') && digitsOnly.length === 10) {
        digitsOnly = '971' + digitsOnly.slice(1);
      } else if (digitsOnly.startsWith('5') && digitsOnly.length === 9) {
        digitsOnly = '971' + digitsOnly;
      }
    } else if (defaultCountryCode === 'IN') {
      if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
        digitsOnly = '91' + digitsOnly.slice(1);
      } else if (digitsOnly.length === 10) {
        digitsOnly = '91' + digitsOnly;
      }
    } else if (defaultCountryCode === 'US' || defaultCountryCode === 'CA') {
      if (digitsOnly.length === 10) {
        digitsOnly = '1' + digitsOnly;
      }
    }
  }

  // E.164 allows 7 to 15 digits
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      e164: '+' + digitsOnly,
      rawInput: input,
      errorMessage: `Phone number length (${digitsOnly.length} digits) is outside valid E.164 range (7-15 digits)`,
    };
  }

  // Resolve country code from prefix
  let country: string | undefined;
  for (const [code, iso] of Object.entries(COUNTRY_DIALING_CODES)) {
    if (digitsOnly.startsWith(code)) {
      country = iso;
      break;
    }
  }

  return {
    isValid: true,
    e164: '+' + digitsOnly,
    countryCode: country,
    rawInput: input,
  };
}

/**
 * Alias for normalizePhoneE164 supporting .error convenience property
 */
export function normalizePhoneNumber(
  input: string,
  defaultCountryCode: string = 'AE'
): NormalizedPhone & { error?: string } {
  const res = normalizePhoneE164(input, defaultCountryCode);
  return {
    ...res,
    error: res.errorMessage,
  };
}


