import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, Globe, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy | Rich Rlephant Marketing Whatsapp API',
  description: 'Official privacy policy and Meta WhatsApp Cloud API data governance for Rich Rlephant Marketing Whatsapp API.',
};

export default function PrivacyPolicyPage() {
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
            <Badge variant="blue" size="md">Meta Cloud API Compliance</Badge>
            <Badge variant="green" size="md">GDPR &amp; CCPA Ready</Badge>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#202020] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#202020]/70 font-mono">
            Brand: Rich Rlephant Marketing Whatsapp API • Effective Date: November 1, 2026 • Version: 2.1
          </p>
        </div>

        {/* Legal Body Card */}
        <div className="p-8 bg-white border-2 border-[#202020] rounded-[32px] shadow-[6px_6px_0px_#202020] space-y-8 text-xs sm:text-sm text-[#202020]/90 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">1</span>
              Overview &amp; Scope
            </h2>
            <p>
              This Privacy Policy explains how <strong>Rich Rlephant Marketing Whatsapp API</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) collects, processes, stores, and protects data when businesses and end-users utilize our WhatsApp Business SaaS platform, developer APIs, bulk campaigns, and shared team inbox.
            </p>
            <p>
              We operate exclusively through official Meta Cloud API endpoints (Meta Platforms, Inc.) and are committed to maintaining the highest standards of data integrity, confidentiality, and regulatory compliance across global data protection frameworks (including GDPR, CCPA, and UAE Federal Decree Law No. 45 of 2021).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">2</span>
              Information We Collect &amp; Process
            </h2>
            <p>To deliver enterprise WhatsApp messaging services, we process the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Customer Profile &amp; Contact Data:</strong> E.164-formatted phone numbers, customer names, contact tags, custom CRM attributes, and verifiable opt-in source metadata.
              </li>
              <li>
                <strong>Message Content &amp; Transmission Logs:</strong> Inbound and outbound message text, interactive button payload identifiers, media attachments (images, PDFs, audio voice notes), and timestamped delivery receipts (sent, delivered, read, failed).
              </li>
              <li>
                <strong>Consent &amp; Opt-Out Records:</strong> Verifiable consent timestamps, opt-in source categories, and suppression entries triggered by automated opt-out keywords (e.g., STOP, CANCEL, UNSUBSCRIBE).
              </li>
              <li>
                <strong>Meta Cloud API Credentials:</strong> WhatsApp Business Account (WABA) IDs, Phone Number IDs, App IDs, and encrypted System User access tokens.
              </li>
              <li>
                <strong>Platform Usage &amp; Audit Logs:</strong> User session data, IP addresses, audit log entries of administrative actions, API key generation records, and webhook delivery attempts.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">3</span>
              How We Use Your Information
            </h2>
            <p>We process data strictly for the following operational purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Transmitting WhatsApp marketing broadcasts, utility notifications, and authentication codes via official Meta Cloud API v21.0.</li>
              <li>Powering the Shared Multi-Agent Inbox with real-time collision locks, team triage, and conversation assignments.</li>
              <li>Validating and submitting WhatsApp message templates to Meta for approval.</li>
              <li>Executing visual no-code chatbots and automated intent routing.</li>
              <li>Enforcing strict suppression lists to protect end-users from unwanted communications and guarantee zero ban risk.</li>
              <li>Authenticating developer REST API requests using SHA-256 hashed keys and HMAC-SHA256 signed webhooks.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">4</span>
              Meta Platforms, Inc. &amp; Sub-Processors
            </h2>
            <p>
              Our platform connects to official APIs operated by <strong>Meta Platforms, Inc.</strong> (1601 Willow Road, Menlo Park, CA 94025, USA). When messages are transmitted, message data passes through Meta&rsquo;s global Cloud API infrastructure in accordance with the Meta Commercial Terms and WhatsApp Business Terms of Service.
            </p>
            <p>Our authorized sub-processors include:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px]">
                <strong className="block text-[#202020]">Meta Platforms, Inc.</strong>
                <span className="text-[11px] text-[#202020]/70">Official WhatsApp Cloud API Gateway</span>
              </div>
              <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px]">
                <strong className="block text-[#202020]">Neon Serverless</strong>
                <span className="text-[11px] text-[#202020]/70">PostgreSQL Database &amp; Audit Logs</span>
              </div>
              <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px]">
                <strong className="block text-[#202020]">Vercel Inc.</strong>
                <span className="text-[11px] text-[#202020]/70">Edge Hosting &amp; Serverless Webhooks</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">5</span>
              Data Security &amp; Tenant Isolation
            </h2>
            <p>
              We implement industry-grade security measures to protect customer data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Row Level Security (RLS):</strong> Strict database isolation guarantees that no workspace or tenant can ever view or access data belonging to another tenant.
              </li>
              <li>
                <strong>Cryptographic Envelope Encryption:</strong> Meta Access Tokens and sensitive webhook secrets are encrypted at rest using AES-256-GCM authenticated encryption.
              </li>
              <li>
                <strong>Role-Based Access Control (RBAC):</strong> Granular permissions ensure customer contact lists cannot be exported by unauthorized personnel or Super Admins.
              </li>
              <li>
                <strong>TLS 1.3 Encryption in Transit:</strong> All web traffic, API requests, and Meta webhook events are encrypted using modern TLS certificates.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">6</span>
              End-User Rights &amp; Opt-Out
            </h2>
            <p>
              Every WhatsApp recipient maintains complete sovereignty over their data. Recipients can opt out at any time by replying with the keyword <strong>STOP</strong>. Our automated suppression engine immediately adds the number to the tenant suppression registry, preventing any further marketing broadcasts.
            </p>
            <p>
              Under GDPR and CCPA, users have the right to request access to, correction of, or deletion of their personal data (Right to Erasure). Requests may be submitted directly to our Data Protection team.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#202020] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-mono text-xs">7</span>
              Contact Information
            </h2>
            <p>
              For privacy inquiries, Data Protection Officer requests, or compliance auditing, contact our team:
            </p>
            <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] space-y-1.5 font-mono text-xs">
              <div><strong>Organization:</strong> Rich Rlephant Marketing Whatsapp API</div>
              <div><strong>Privacy Office:</strong> privacy@richrlephant.com</div>
              <div><strong>Security &amp; Abuse:</strong> security@richrlephant.com</div>
              <div><strong>Headquarters:</strong> DIFC Innovation Hub, Dubai, United Arab Emirates</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#202020] text-white py-8 border-t-2 border-[#202020] text-center text-xs text-white/60">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p>&copy; 2026 Rich Rlephant Marketing Whatsapp API. Built on Official Meta Cloud API. All rights reserved.</p>
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

