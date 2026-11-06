// ============================================================================
// Design Tokens & Brand System
// Product: Rich Rlephant Marketing Whatsapp API
// Design Specification: design.md (Ko-fi Cozy Creator Design System)
// ============================================================================

export const BRAND_CONFIG = {
  name: "Rich Rlephant Marketing Whatsapp API",
  shortName: "Rich Rlephant",
  tagline: "Enterprise WhatsApp Business Platform",
  legalDisclaimer: "Independent platform integrating with the official Meta WhatsApp Business Platform. WhatsApp is a trademark of Meta Platforms, Inc.",
  version: "1.0.0-prod",
  supportEmail: "support@richrlephant.com",
} as const;

export const THEME_TOKENS = {
  colors: {
    primary: "#72A4F2",        // Soft sky blue for primary CTAs and positive actions
    primaryHover: "#9CBDF5",   // primary-60
    primaryLight: "#BED0F7",   // primary-70
    secondary: "#202020",      // Deep charcoal core ink for headings, borders & text
    tertiary: "#FFFFFF",       // Clean white for cards & light surfaces
    neutral: "#F4EFE7",        // Warm cream page canvas background
    neutralLight: "#F9F6F1",   // neutral-20 for soft backgrounds
    neutralBorder: "#D8D0C4",  // neutral-80 for soft borders and dividers
    surface: "#FFFFFF",
    onSurface: "#202020",
    error: "#E35A4F",          // Reserved alert tone
  },
  typography: {
    display: "Georgia, 'Bogue Black', serif",
    body: "'DM Sans', 'Nunito', -apple-system, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  borderRadius: {
    none: "0px",
    sm: "10px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    full: "9999px",
  },
  borders: {
    thin: "1.5px solid #D8D0C4",
    solid: "2px solid #202020",
  },
} as const;
