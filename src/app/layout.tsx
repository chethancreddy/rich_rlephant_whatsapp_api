import type { Metadata } from 'next';
import './globals.css';
import { BRAND_CONFIG } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} — B2B SaaS Platform`,
  description: 'Enterprise WhatsApp Business Cloud API engagement platform, campaigns, shared team inbox, automation and customer management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

