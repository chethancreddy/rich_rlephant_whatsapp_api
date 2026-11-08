import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service | Rich Rlephant Marketing Whatsapp API',
  description: 'Terms of Service and Acceptable Use Policy for Rich Rlephant Marketing Whatsapp API.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F4EFE7] text-[#202020] font-sans selection:bg-[#72A4F2] selection:text-[#202020]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F4EFE7]/90 backdrop-blur-md border-b-2 border-[#202020]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[12px] bg-[#202020] text-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-serif font-black text-sm shadow-[2px_2px_0px_#202020] group-hover:bg-[#72A4F2] group-hover:text-[#202020] transition-colors">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm text-[#202020] tracking-tight leading-none">
                Rich Rlephant
              </span>
              <span className="font-mono text-[9px] text-[#202020]/70 font-semibold uppercase">
                Marketing WhatsApp API
              </span>
            </div>
          </Link>

          <Link href="/">
            <Button variant="outline" size="sm" className="font-bold text-xs bg-white gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Title Header Card */}
        <div className="p-8 bg-white border-2 border-[#202020] rounded-[32px] shadow-[6px_6px_0px_#202020] space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" size="md">Terms &amp; Conditions</Badge>
            <Badge variant="charcoal" size="md">Acceptable Use Policy</Badge>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#202020] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-[#202020]/70 font-mono">
            Brand: Rich Rlephant Marketing Whatsapp API • Last Updated: November 1, 2026
          </p>
        </div>

        {/* Legal Body Card */}
        <div className="p-8 bg-white border-2 border-[#202020] rounded-[32px] shadow-[6px_6px_0px_#202020] space-y-8 text-xs sm:text-sm text-[#202020]/90 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>Rich Rlephant Marketing Whatsapp API</strong>, you agree to be bound by these Terms of Service and all policies published by Meta Platforms, Inc. regarding WhatsApp Business Cloud API usage. If you do not agree to these terms, you may not use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020]">2. WhatsApp Cloud API &amp; Meta Compliance</h2>
            <p>
              All messaging activity on our platform must strictly comply with the <strong>WhatsApp Business Messaging Policy</strong> and <strong>Commerce Policy</strong>. Customers agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Messages may only be dispatched to recipients who have provided explicit, verifiable opt-in consent.</li>
              <li>Promotional templates must respect official Meta category guidelines (Marketing, Utility, Authentication).</li>
              <li>Users must honor opt-out requests (such as the STOP keyword) immediately.</li>
              <li>Spam, unsolicited mass cold broadcasts, deceptive communications, or content violating local laws are strictly prohibited and will result in immediate workspace termination.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020]">3. Account Responsibilities &amp; API Keys</h2>
            <p>
              You are responsible for safeguarding your login credentials, System User access tokens, and developer API keys. Any activity performed using your credentials is your sole responsibility. You agree to notify our security team immediately of any suspected unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020]">4. Service Level &amp; Availability</h2>
            <p>
              While we strive for 99.9% uptime, access to messaging services relies on upstream connectivity with Meta Platforms, Inc. We are not liable for outages, temporary message rate throttling, or template approval delays imposed by Meta&rsquo;s global infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020]">5. Contact Us</h2>
            <p>
              For legal inquiries regarding these terms, please contact:
              <br />
              <strong className="text-[#202020]">legal@richrlephant.com</strong> • DIFC Innovation Hub, Dubai, UAE.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#202020] text-white py-8 border-t-2 border-[#202020] text-center text-xs text-white/60">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p>&copy; 2026 Rich Rlephant Marketing Whatsapp API. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-white/80">
            <Link href="/" className="hover:underline">Home</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

