'use client';

import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingCardsProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ onOpenTrial, onOpenDemo }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for emerging businesses starting with official WhatsApp customer support.',
      monthlyPrice: 49,
      annualPrice: 39,
      badge: 'Getting Started',
      features: [
        '1,000 Monthly Active Contacts',
        '1 Official WhatsApp Business Number',
        '2 Agent Team Seats included',
        'Shared Multi-Agent Inbox with Collision Locks',
        'In-Dashboard Meta Template Creator',
        '24-Hour WhatsApp Service Window Tracking',
        'CSV/XLSX Contact Import with Consent Evidence',
        'Standard Email & In-App Support',
      ],
      ctaText: 'Start Free 14-Day Trial',
      action: onOpenTrial,
      highlight: false,
    },
    {
      name: 'Growth',
      description: 'The complete WhatsApp marketing, broadcast, and automation engine for scaling brands.',
      monthlyPrice: 99,
      annualPrice: 79,
      badge: 'Most Popular',
      features: [
        '10,000 Monthly Active Contacts',
        '2 Official WhatsApp Business Numbers',
        '5 Agent Team Seats with Role Permissions',
        'Unlimited Bulk WhatsApp Marketing Campaigns',
        'Automated Scheduling & Worker Queue Pacing',
        'No-Code Visual Chatbot & Automation Builder',
        'AI Customer Intent Classification & Smart FAQ',
        'Developer REST API v1 & HMAC Webhooks',
        'Realtime Delivery & Read Analytics',
        'Priority Technical Support (1-Hour SLA)',
      ],
      ctaText: 'Start Free 14-Day Trial',
      action: onOpenTrial,
      highlight: true,
    },
    {
      name: 'Enterprise',
      description: 'High-volume infrastructure with bespoke routing, dedicated onboarding, and governance.',
      monthlyPrice: 249,
      annualPrice: 199,
      badge: 'High Scale & Security',
      features: [
        '50,000+ Monthly Active Contacts (Custom scale)',
        'Up to 10 WhatsApp Business Numbers',
        '20+ Team Seats with Department Triage',
        'Custom Message Dispatch Concurrency & Pacing',
        'Full Supabase / Neon PostgreSQL Direct Integration',
        'Immutable Cryptographic Audit Logs',
        'Dedicated Solutions Architect & Onboarding',
        'Custom SLA Guarantee (99.9% Uptime)',
        'Signed BAA / Custom Data Processing Addendum',
      ],
      ctaText: 'Speak to Enterprise Sales',
      action: onOpenDemo,
      highlight: false,
    },
  ];

  return (
    <div id="pricing" className="py-20 bg-[#F4EFE7] border-b-2 border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="blue" size="md">Transparent, Predictable Pricing</Badge>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
            Predictable Plans for High-Growth Businesses
          </h2>
          <p className="text-sm text-[#202020]/80 font-sans leading-relaxed">
            No hidden markups on Meta conversation charges. You pay Meta directly at official rates. Choose the platform tier that fits your team size and broadcast volume.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-[#202020]' : 'text-[#202020]/60'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 bg-[#202020] rounded-full p-1 border-2 border-[#202020] transition-colors relative"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#72A4F2] border-2 border-[#202020] transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isAnnual ? 'text-[#202020]' : 'text-[#202020]/60'}`}>
                Annual Billing
              </span>
              <Badge variant="green" size="sm">Save 20%</Badge>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;
            return (
              <div
                key={p.name}
                className={`rounded-[32px] border-2 border-[#202020] p-8 flex flex-col justify-between transition-all relative ${
                  p.highlight
                    ? 'bg-white shadow-[8px_8px_0px_#202020] lg:-translate-y-2'
                    : 'bg-[#F9F6F1] shadow-[4px_4px_0px_#202020]'
                }`}
              >
                {/* Popular Pill */}
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#72A4F2] text-[#202020] font-serif font-black text-xs px-4 py-1.5 rounded-full border-2 border-[#202020] shadow-[2px_2px_0px_#202020] uppercase tracking-wider">
                      ★ Most Popular Choice
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-2xl text-[#202020]">{p.name}</h3>
                      <p className="text-xs text-[#202020]/70 mt-1 font-sans">{p.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif font-black text-4xl text-[#202020]">${price}</span>
                      <span className="text-xs text-[#202020]/70 font-bold">/month</span>
                    </div>
                    <span className="text-[11px] text-[#202020]/60 block font-mono">
                      {isAnnual ? 'Billed annually ($' + price * 12 + '/yr)' : 'Billed month-to-month'}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 text-xs text-[#202020] pt-2">
                    <span className="font-serif font-bold text-xs uppercase tracking-wider block text-[#202020]/70">
                      Included Capabilities:
                    </span>
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight font-sans">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-8 mt-6 border-t-2 border-[#202020]">
                  <Button
                    variant={p.highlight ? 'primary' : 'outline'}
                    size="md"
                    onClick={p.action}
                    className={`w-full font-bold text-xs gap-1.5 shadow-[3px_3px_0px_#202020] ${
                      !p.highlight ? 'bg-white' : ''
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Guarantee Footnote */}
        <div className="p-4 bg-white border-2 border-[#202020] rounded-[22px] max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#065f46] shrink-0" />
            <span className="text-[#202020]/80">
              <strong>Zero Meta Ban Risk:</strong> All messaging connects strictly through official Meta WhatsApp Cloud API endpoints. We enforce recipient opt-in verification and STOP suppression automatically.
            </span>
          </div>
          <Badge variant="green" size="sm">Official Meta Cloud API v21.0</Badge>
        </div>
      </div>
    </div>
  );
};

