'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the difference between Rich Rlephant and standard WhatsApp Web or unofficial tools?',
      a: 'Standard WhatsApp Web and unofficial scraping tools run on individual SIM cards and are vulnerable to permanent phone number bans, message limits, and multi-agent synchronization conflicts. Rich Rlephant connects directly to the official Meta WhatsApp Cloud API v21.0. This allows verified business profiles, unlimited broadcasts, team collision locking, automated chatbots, and 99.8% inbox delivery with zero ban risk.',
    },
    {
      q: 'Do I need my own Meta WhatsApp Business Account (WABA)?',
      a: 'Yes. You can connect your existing Meta WhatsApp Business Account in seconds using our in-dashboard Meta Embedded Signup or manually enter your Phone Number ID and System User Access Token. If you do not have one yet, our setup wizard walks you through creating an official Meta WABA directly inside the platform.',
    },
    {
      q: 'How does the WhatsApp 24-Hour Customer-Service Window work?',
      a: 'When a customer sends an inbound message to your WhatsApp number, Meta opens a 24-hour service window. During this window, your team can reply with free-form text, voice notes, images, and attachments without requiring pre-approved templates. Once the 24 hours expire, our system alerts you to re-engage using an approved Meta message template.',
    },
    {
      q: 'How do WhatsApp message templates and Meta approval work?',
      a: 'For outbound notifications, broadcasts, and re-engagement outside the 24-hour window, Meta requires pre-approved message templates. Rich Rlephant features an in-dashboard Template Studio that validates your sequential variables ({{1}}, {{2}}), buttons, and sample content before submitting to Meta via Graph API. Approvals typically take between 1 and 15 minutes.',
    },
    {
      q: 'How are Meta conversation charges billed?',
      a: 'Meta charges for WhatsApp conversations based on four standardized categories: Marketing, Utility, Authentication, and Service. Rich Rlephant provides a 100% transparent cost estimation engine with zero hidden markups. You pay Meta directly through your Meta Business Manager payment method, while your Rich Rlephant subscription covers the SaaS software, team seats, automation, and shared inbox.',
    },
    {
      q: 'Can I integrate Rich Rlephant with my existing CRM, Shopify, or custom database?',
      a: 'Absolutely. We provide a full REST API v1, OpenAPI 3.0 documentation, and HMAC-SHA256 authenticated webhooks. We support native connections for Shopify, WooCommerce, HubSpot, Salesforce, Zapier, and direct database integration with Neon Serverless PostgreSQL and Supabase.',
    },
  ];

  return (
    <div id="faq" className="py-20 bg-white border-b-2 border-[#202020]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <Badge variant="charcoal" size="md">Frequently Asked Questions</Badge>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
            Everything You Need to Know About the Platform
          </h2>
          <p className="text-xs text-[#202020]/70 font-sans">
            Clear answers about official Meta WhatsApp Cloud API compliance, pricing, and capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="border-2 border-[#202020] rounded-[22px] overflow-hidden bg-[#F9F6F1] transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-[#202020] hover:bg-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-[#72A4F2] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full border-1.5 border-[#202020] flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 bg-[#72A4F2] text-[#202020]' : 'bg-white text-[#202020]'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#202020]/80 leading-relaxed font-sans border-t border-[#202020]/15 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

