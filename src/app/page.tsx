'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageSquare,
  FileCode2,
  Bot,
  Users,
  Code,
  BarChart3,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Radio,
  Clock,
  Layers,
  ChevronRight,
  Database,
  ExternalLink,
  Smartphone,
  Play,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/navbar';
import { HeroPreview } from '@/components/landing/hero-preview';
import { DemoModal } from '@/components/landing/demo-modal';
import { TrialModal } from '@/components/landing/trial-modal';
import { PricingCards } from '@/components/landing/pricing-cards';
import { FaqAccordion } from '@/components/landing/faq-accordion';
import { ContactForm } from '@/components/landing/contact-form';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4EFE7] text-[#202020] font-sans selection:bg-[#72A4F2] selection:text-[#202020]">
      {/* 1. Navigation Bar */}
      <Navbar
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenTrial={() => setIsTrialModalOpen(true)}
      />

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b-2 border-[#202020]">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-[#202020] rounded-full shadow-[3px_3px_0px_#202020] text-xs font-bold text-[#202020]">
            <Radio className="h-3.5 w-3.5 text-[#065f46] animate-pulse" />
            <span>Official Meta WhatsApp Cloud API v21.0 Platform</span>
            <span className="text-[#202020]/40">•</span>
            <span className="text-[#065f46]">99.8% Inbox Delivery</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-[#202020] max-w-5xl mx-auto">
            Scale Customer Conversations on{' '}
            <span className="underline decoration-[#72A4F2] decoration-wavy decoration-4">
              WhatsApp
            </span>{' '}
            with Zero Ban Risk.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#202020]/80 font-sans max-w-3xl mx-auto leading-relaxed">
            The all-in-one WhatsApp Business platform for fast-moving teams. Deliver high-volume marketing broadcasts, manage customer support in a collaborative shared inbox, build no-code chatbots, and integrate with developer REST APIs.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto font-serif font-bold text-sm gap-2 shadow-[4px_4px_0px_#202020] px-8 py-6 rounded-[20px]"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto font-serif font-bold text-sm gap-2 bg-white shadow-[4px_4px_0px_#202020] px-8 py-6 rounded-[20px]"
            >
              <span>Book a Live Demo</span>
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-[#202020]/70 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#065f46]" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#065f46]" />
              Meta Embedded Signup in 2 Minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#065f46]" />
              Strict Multi-Tenant RLS Isolation
            </span>
          </div>

          {/* Product Dashboard Preview Mockup */}
          <div className="pt-10">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* 3. Operational Value Pillars Grid */}
      <section className="py-16 bg-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#F9F6F1] border-2 border-[#202020] rounded-[28px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-12 h-12 rounded-[16px] bg-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-bold text-[#202020]">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#202020]">Verified Bulk Broadcasts</h3>
              <p className="text-xs text-[#202020]/80 font-sans leading-relaxed">
                Reach up to 100,000+ opted-in customers per day using official Meta Cloud API templates with dynamic variables and zero account ban liability.
              </p>
            </div>

            <div className="p-8 bg-[#F9F6F1] border-2 border-[#202020] rounded-[28px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-12 h-12 rounded-[16px] bg-[#6ee7b7] border-2 border-[#202020] flex items-center justify-center font-bold text-[#065f46]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#202020]">Collaborative Shared Inbox</h3>
              <p className="text-xs text-[#202020]/80 font-sans leading-relaxed">
                Prevent agent overlap with live conversation collision locks, department triage routing, canned responses, and 24h WhatsApp service window timers.
              </p>
            </div>

            <div className="p-8 bg-[#F9F6F1] border-2 border-[#202020] rounded-[28px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-12 h-12 rounded-[16px] bg-[#fde68a] border-2 border-[#202020] flex items-center justify-center font-bold text-[#b45309]">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#202020]">No-Code AI Automation</h3>
              <p className="text-xs text-[#202020]/80 font-sans leading-relaxed">
                Build drag-and-drop conversational workflows that classify customer intent, answer common inquiries 24/7, and seamlessly escalate to human agents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WhatsApp Bulk Campaigns Section */}
      <section id="campaigns" className="py-20 bg-[#F4EFE7] border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="blue" size="md">High-Conversion Marketing</Badge>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
                Send Bulk WhatsApp Campaigns with 99.8% Inbox Delivery
              </h2>
              <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
                Unlike unreliable third-party WhatsApp Web extensions that get your numbers blocked, our 6-step campaign wizard connects directly to official Meta Cloud API infrastructure.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Strict Preflight Consent Gate:</strong> Automatically suppresses unconsented contacts and STOP opt-outs before touching Meta endpoints.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Scheduled Dispatch Pacing:</strong> Configure message pacing (e.g. 200 msgs/min) across worker daemons to guarantee delivery without quality score degradation.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Live Operational Controls:</strong> Pause, Resume, or Cancel running campaigns with instant outbox queue synchronization.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsTrialModalOpen(true)}
                  className="font-bold text-xs gap-1.5"
                >
                  <span>Explore Bulk Campaigns</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Visual Campaign Mockup Card */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#202020] shadow-[8px_8px_0px_#202020] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-[#72A4F2]" />
                  <span className="font-serif font-bold text-base text-[#202020]">Ramadan VIP Promotion</span>
                </div>
                <Badge variant="green" size="sm">Active (82% sent)</Badge>
              </div>

              <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#202020]/70">
                  <span>Template ID:</span>
                  <span className="font-bold text-[#202020]">ramadan_exclusive_v2 (en_US)</span>
                </div>
                <div className="flex justify-between text-[#202020]/70">
                  <span>Target Audience:</span>
                  <span className="font-bold text-[#202020]">12,500 Opted-In Contacts</span>
                </div>
                <div className="flex justify-between text-[#202020]/70">
                  <span>Estimated Meta Cost:</span>
                  <span className="font-bold text-[#065f46]">$387.50 USD (Direct Meta)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#202020]">
                  <span>Dispatch Progress</span>
                  <span>10,250 / 12,500 messages</span>
                </div>
                <div className="h-3 bg-[#E5DFD5] rounded-full overflow-hidden border border-[#202020]">
                  <div className="bg-[#72A4F2] h-full rounded-full w-[82%]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="p-3 bg-white border border-[#202020] rounded-[16px]">
                  <span className="text-[10px] text-[#202020]/60 block font-bold">SENT</span>
                  <span className="font-serif font-black text-lg text-[#202020]">10,250</span>
                </div>
                <div className="p-3 bg-white border border-[#202020] rounded-[16px]">
                  <span className="text-[10px] text-[#202020]/60 block font-bold">DELIVERED</span>
                  <span className="font-serif font-black text-lg text-[#065f46]">10,229</span>
                </div>
                <div className="p-3 bg-white border border-[#202020] rounded-[16px]">
                  <span className="text-[10px] text-[#202020]/60 block font-bold">READ</span>
                  <span className="font-serif font-black text-lg text-[#72A4F2]">8,610</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Shared Team Inbox Section */}
      <section id="inbox" className="py-20 bg-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Inbox Mockup Card */}
            <div className="lg:col-span-6 order-2 lg:order-1 bg-[#F9F6F1] p-6 sm:p-8 rounded-[32px] border-2 border-[#202020] shadow-[8px_8px_0px_#202020] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#72A4F2] text-[#202020] font-serif font-bold text-xs flex items-center justify-center border border-[#202020]">
                    CR
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#202020]">Chethan Reddy</span>
                    <span className="text-[10px] text-[#202020]/60 block font-mono">Viewing Thread • Locked</span>
                  </div>
                </div>
                <Badge variant="yellow" size="sm">Locked by Chethan</Badge>
              </div>

              <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#202020]/15">
                  <span className="font-bold text-[#065f46] flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    24h Customer Service Window Active
                  </span>
                  <Badge variant="blue" size="sm">Customer Support</Badge>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-[#F4EFE7] rounded-[16px] text-[#202020] space-y-1">
                    <p className="font-sans">Can someone help me update the delivery address for order #4491?</p>
                    <span className="text-[9px] text-[#202020]/50 font-mono block text-right">Customer • 11:42 AM</span>
                  </div>

                  <div className="p-3 bg-[#202020] text-white rounded-[16px] space-y-1">
                    <p className="font-sans">Hello Sarah! I have updated your address to Dubai Hills Estate Villa 12.</p>
                    <span className="text-[9px] text-white/60 font-mono block text-right">Chethan (Agent) • 11:44 AM</span>
                  </div>
                </div>

                <div className="p-2 bg-[#ecfdf5] border border-[#6ee7b7] rounded-[12px] flex items-center justify-between text-[11px]">
                  <span className="text-[#065f46] font-bold">Canned Snippets available:</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#202020]/20">
                    /greet, /hours, /address
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <Badge variant="green" size="md">Multi-Agent Collaboration</Badge>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
                A Unified Team Inbox Designed for Zero Collisions
              </h2>
              <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
                Empower your customer support, sales, and operations teams to collaborate on a single WhatsApp number without sending duplicate replies or losing context.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Collision Prevention Locks:</strong> When an agent opens a conversation, other teammates see a visual lock indicator to prevent overlapping replies.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Department &amp; Team Triage:</strong> Route incoming chats to Customer Support, Sales Desk, Compliance, or Technical Operations with custom SLA filters.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Audio Voice Notes &amp; Attachments:</strong> Record, pause, preview, and transmit high-fidelity audio notes and PDF invoices directly within the conversation canvas.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="font-bold text-xs gap-1.5 bg-white"
                >
                  <span>See Shared Inbox in Action</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WhatsApp Template Management Section */}
      <section id="templates" className="py-20 bg-[#F4EFE7] border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="charcoal" size="md">Meta Cloud API Studio</Badge>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
              Create &amp; Manage Meta Templates Without Leaving Your Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
              No need to navigate complicated Meta Business Manager menus. Design, validate, preview, and submit official WhatsApp message templates directly inside our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="p-6 bg-white border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-bold text-[#202020]">
                <FileCode2 className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#202020]">Real-Time Variable Validation</h3>
              <p className="text-[#202020]/75 font-sans leading-relaxed">
                Prevents Meta rejections by automatically validating sequential positional variables (<code className="font-mono bg-[#F9F6F1] px-1 py-0.5 rounded border border-[#202020]/30">{`{{1}}`}</code>, <code className="font-mono bg-[#F9F6F1] px-1 py-0.5 rounded border border-[#202020]/30">{`{{2}}`}</code>) and requiring representative sample values.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#6ee7b7] border-2 border-[#202020] flex items-center justify-center font-bold text-[#065f46]">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#202020]">Interactive Mobile Phone Preview</h3>
              <p className="text-[#202020]/75 font-sans leading-relaxed">
                See exactly how your template renders on iOS and Android devices in real-time, including rich media headers (images, documents, videos) and interactive buttons.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#fde68a] border-2 border-[#202020] flex items-center justify-center font-bold text-[#b45309]">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#202020]">Automatic Approval Sync</h3>
              <p className="text-[#202020]/75 font-sans leading-relaxed">
                Syncs with Meta Graph API every 5 minutes to detect approval, pause, or rejection status. Displays official Meta rejection reason banners with one-click duplicate &amp; fix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Chatbot & No-Code Automation Builder */}
      <section id="automation" className="py-20 bg-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="blue" size="md">Visual Automation Engine</Badge>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
                Build Intelligent WhatsApp Workflows Without Writing Code
              </h2>
              <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
                Design multi-step interactive chatbots that qualify leads, answer FAQs, dispatch order updates, and route customers based on keyword triggers.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Keyword &amp; Event Triggers:</strong> Launch automations when customers text keywords like <code className="font-mono bg-[#F9F6F1] px-1 rounded">PRICING</code>, <code className="font-mono bg-[#F9F6F1] px-1 rounded">TRACK</code>, or on inbound webhook events.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Interactive Quick-Reply Branching:</strong> Guide customers through automated button menus to reduce response times by 80%.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Human Agent Handover:</strong> Seamlessly transfer complex conversations to live support specialists with complete context and chat history preserved.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsTrialModalOpen(true)}
                  className="font-bold text-xs gap-1.5"
                >
                  <span>Build Your First Chatbot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Visual Workflow Canvas Mockup */}
            <div className="lg:col-span-6 bg-[#F9F6F1] p-6 sm:p-8 rounded-[32px] border-2 border-[#202020] shadow-[8px_8px_0px_#202020] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#6366f1]" />
                  <span className="font-serif font-bold text-base text-[#202020]">E-Commerce Order Bot Flow</span>
                </div>
                <Badge variant="green" size="sm">Active (99.2% success)</Badge>
              </div>

              <div className="space-y-3 text-xs">
                {/* Node 1 */}
                <div className="p-3.5 bg-white border-2 border-[#202020] rounded-[18px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#72A4F2] uppercase text-[10px] tracking-wider">Trigger Event</span>
                    <Badge variant="charcoal" size="sm">Keyword: TRACK</Badge>
                  </div>
                  <p className="text-[#202020] font-sans">Customer sends &ldquo;TRACK&rdquo; or &ldquo;Where is my order?&rdquo;</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-[#202020]" />
                </div>

                {/* Node 2 */}
                <div className="p-3.5 bg-white border-2 border-[#202020] rounded-[18px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#065f46] uppercase text-[10px] tracking-wider">Bot Action</span>
                    <Badge variant="green" size="sm">Fetch Shopify API</Badge>
                  </div>
                  <p className="text-[#202020] font-sans">Retrieves latest tracking URL &amp; delivery window from Shopify</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-[#202020]" />
                </div>

                {/* Node 3 */}
                <div className="p-3.5 bg-white border-2 border-[#202020] rounded-[18px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#b45309] uppercase text-[10px] tracking-wider">Interactive Reply</span>
                    <Badge variant="blue" size="sm">WhatsApp Buttons</Badge>
                  </div>
                  <p className="text-[#202020] font-sans">Dispatches interactive message with &ldquo;Track Package&rdquo; and &ldquo;Talk to Support&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AI Customer Support & Knowledge Retrieval */}
      <section className="py-20 bg-[#F4EFE7] border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual AI Suggest Mockup */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#202020] shadow-[8px_8px_0px_#202020] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#72A4F2]" />
                  <span className="font-serif font-bold text-base text-[#202020]">Smart AI Response Assistant</span>
                </div>
                <Badge variant="blue" size="sm">Intent: Delivery Inquiry</Badge>
              </div>

              <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] space-y-2 text-xs">
                <span className="font-bold text-[#202020]/70 uppercase text-[10px] block">Customer Inbound:</span>
                <p className="p-2.5 bg-white border border-[#202020]/20 rounded-[14px]">
                  &ldquo;What is your delivery policy for international orders to Saudi Arabia?&rdquo;
                </p>

                <span className="font-bold text-[#065f46] uppercase text-[10px] block pt-2">
                  AI Contextual Suggestion (from Store Knowledge Base):
                </span>
                <div className="p-3 bg-[#ecfdf5] border-2 border-[#065f46] rounded-[16px] text-xs text-[#065f46] space-y-2">
                  <p>
                    &ldquo;We ship to Saudi Arabia via DHL Express in 2-3 business days. All duties and customs taxes are included at checkout! Would you like me to share the shipping rate card?&rdquo;
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" className="bg-white text-[10px] font-bold h-6 px-2">
                      Edit
                    </Button>
                    <Button variant="primary" size="sm" className="text-[10px] font-bold h-6 px-2">
                      Insert &amp; Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <Badge variant="blue" size="md">Intelligent AI Assistance</Badge>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
                Empower Your Agents with Contextual AI Copilots
              </h2>
              <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
                Connect your product catalogs, FAQs, and company policies. Our AI engine indexes knowledge chunks to draft instant, accurate replies for your agents to review and send with one click.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Intent &amp; Sentiment Classification:</strong> Automatically categorizes customer moods and flags urgent escalations for VIP handling.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Conversation Summarization:</strong> Summarizes long customer chat threads into 2-bullet handover notes when transferring to another team member.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border-1.5 border-[#202020] flex items-center justify-center shrink-0 mt-0.5 text-[#065f46]">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-[#202020]">Strict Grounding:</strong> AI never hallucinates offers or policies—it only drafts answers grounded in your verified knowledge base documents.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Contact Management & CRM Section */}
      <section id="crm" className="py-20 bg-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="charcoal" size="md">Verifiable Contact CRM</Badge>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
              Enterprise Opt-In Governance &amp; Segmentation
            </h2>
            <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
              Maintain audit-ready compliance records with verifiable consent sources, E.164 phone normalization, tag segmentation, and duplicate detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">Opt-In Sources Registry</span>
              <p className="text-[#202020]/75 leading-relaxed font-sans">
                Track exact customer consent origin: Website Forms, POS Checkouts, QR Codes, or Inbound WhatsApp triggers.
              </p>
            </div>

            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">E.164 Auto Normalization</span>
              <p className="text-[#202020]/75 leading-relaxed font-sans">
                Cleanses and standardizes phone numbers into E.164 international formats, handling local zero prefixes seamlessly.
              </p>
            </div>

            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">Duplicate Prevention</span>
              <p className="text-[#202020]/75 leading-relaxed font-sans">
                Prevents duplicate contact records per workspace and eliminates duplicate message deliveries during bulk imports.
              </p>
            </div>

            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] shadow-[4px_4px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">Granular CSV/XLSX Export</span>
              <p className="text-[#202020]/75 leading-relaxed font-sans">
                Export All, Filtered, or Selected contacts with consent headers. Strictly disabled for Super Admins for data security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Developer APIs & Webhooks Section */}
      <section id="developers" className="py-20 bg-[#202020] text-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="blue" size="md">Developer REST API v1</Badge>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Integrate WhatsApp Messaging into Your Backend in Minutes
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                Connect your ERP, CRM, mobile app, or e-commerce store with our public REST API. Complete with OpenAPI 3.0 specification, cryptographic API key rotation, and HMAC-SHA256 authenticated webhooks.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-bold text-xs shrink-0">
                    &radic;
                  </div>
                  <span className="text-white/80">
                    <strong className="text-white">Direct Endpoints:</strong> Send template messages (<code className="font-mono text-[#72A4F2]">POST /api/v1/messages</code>), manage contacts, and query templates.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-bold text-xs shrink-0">
                    &radic;
                  </div>
                  <span className="text-white/80">
                    <strong className="text-white">Cryptographic Security:</strong> API keys hashed with SHA-256; webhook events signed with <code className="font-mono text-[#72A4F2]">X-Platform-Signature</code>.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center font-bold text-xs shrink-0">
                    &radic;
                  </div>
                  <span className="text-white/80">
                    <strong className="text-white">Webhook Simulator:</strong> Test outbound pings with live HMAC verification before going live.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <a href="/api/docs/openapi.json" target="_blank">
                  <Button variant="primary" size="md" className="font-bold text-xs gap-1.5 shadow-[4px_4px_0px_#72A4F2]">
                    <span>View OpenAPI 3.0 Spec</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Link href="/developer">
                  <Button variant="outline" size="md" className="font-bold text-xs bg-white text-[#202020]">
                    Developer Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code Request Block */}
            <div className="lg:col-span-6 bg-[#151515] p-6 rounded-[28px] border-2 border-white/20 font-mono text-xs text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white/50 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="ml-2 text-white/70">POST /api/v1/messages</span>
                </div>
                <Badge variant="blue" size="sm">cURL</Badge>
              </div>

              <pre className="text-[11px] text-[#72A4F2] overflow-x-auto leading-relaxed py-2">
{`curl -X POST https://app.richrlephant.com/api/v1/messages \\
  -H "Authorization: Bearer rrk_live_948f20b7..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+971501234567",
    "type": "template",
    "template": {
      "name": "shipping_update_v1",
      "language": { "code": "en_US" },
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Tariq" },
            { "type": "text", "text": "TRK-98127" }
          ]
        }
      ]
    }
  }'`}
              </pre>

              <div className="p-3 bg-white/5 rounded-[14px] border border-white/10 text-[10px] text-white/70 flex items-center justify-between">
                <span className="text-[#10b981] font-bold">HTTP 200 OK</span>
                <span>Response Time: 68ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Integrations Ecosystem Section */}
      <section id="integrations" className="py-20 bg-white border-b-2 border-[#202020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="blue" size="md">Ecosystem Connectivity</Badge>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
              Seamlessly Integrates with Your Modern Tech Stack
            </h2>
            <p className="text-xs sm:text-sm text-[#202020]/80 font-sans leading-relaxed">
              Connect your customer databases, e-commerce stores, and business tools to automate messages without manual exports.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] shadow-[3px_3px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">Shopify</span>
              <span className="text-[11px] text-[#202020]/70">Abandoned cart recovery &amp; order updates</span>
            </div>
            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] shadow-[3px_3px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">WooCommerce</span>
              <span className="text-[11px] text-[#202020]/70">Automated order receipts &amp; dispatch tracking</span>
            </div>
            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] shadow-[3px_3px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">HubSpot &amp; Salesforce</span>
              <span className="text-[11px] text-[#202020]/70">Two-way contact and conversation syncing</span>
            </div>
            <div className="p-6 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] shadow-[3px_3px_0px_#202020] space-y-2">
              <span className="font-serif font-bold text-base text-[#202020] block">Neon PostgreSQL</span>
              <span className="text-[11px] text-[#202020]/70">Direct serverless database &amp; outbox queue</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Pricing Plans Section */}
      <PricingCards
        onOpenTrial={() => setIsTrialModalOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* 13. Frequently Asked Questions */}
      <FaqAccordion />

      {/* 14. Contact Us Section */}
      <ContactForm />

      {/* 15. Bottom Banner CTA */}
      <section className="py-20 bg-[#72A4F2] text-[#202020] border-b-2 border-[#202020]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="charcoal" size="md">Get Started in 2 Minutes</Badge>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#202020] tracking-tight">
            Start Scaling Your WhatsApp Revenue Today
          </h2>
          <p className="text-sm sm:text-base text-[#202020]/80 font-sans max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking businesses using Rich Rlephant Marketing Whatsapp API to connect with customers at 98% open rates with official Meta compliance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto font-bold text-sm gap-2 shadow-[4px_4px_0px_#202020] px-8 py-5 rounded-[20px]"
            >
              <span>Claim Your 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto font-bold text-sm gap-2 bg-white shadow-[4px_4px_0px_#202020] px-8 py-5 rounded-[20px]"
            >
              <span>Book a Live Walkthrough</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 16. Professional Footer */}
      <Footer />

      {/* Interactive Modals */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <TrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />
    </div>
  );
}
