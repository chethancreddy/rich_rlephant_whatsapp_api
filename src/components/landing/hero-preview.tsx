'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  FileCode2,
  BarChart3,
  CheckCheck,
  Smartphone,
  Play,
  Clock,
  Sparkles,
  ShieldCheck,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const HeroPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'campaigns' | 'templates' | 'analytics'>('inbox');

  return (
    <div className="bg-white border-2 border-[#202020] rounded-[32px] shadow-[8px_8px_0px_#202020] overflow-hidden max-w-5xl mx-auto">
      {/* Chrome Window Bar */}
      <div className="bg-[#202020] px-4 py-3 flex items-center justify-between border-b-2 border-[#202020]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-black/30" />
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-black/30" />
          <div className="w-3 h-3 rounded-full bg-[#10b981] border border-black/30" />
          <span className="text-[11px] font-mono text-white/60 ml-2 hidden sm:inline">
            https://app.richrlephant.com/inbox • Meta Cloud API v21.0
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-[14px]">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1 rounded-[10px] text-[11px] font-bold font-serif transition-colors flex items-center gap-1.5 ${
              activeTab === 'inbox' ? 'bg-[#72A4F2] text-[#202020]' : 'text-white/70 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Shared</span> Inbox
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1 rounded-[10px] text-[11px] font-bold font-serif transition-colors flex items-center gap-1.5 ${
              activeTab === 'campaigns' ? 'bg-[#72A4F2] text-[#202020]' : 'text-white/70 hover:text-white'
            }`}
          >
            <Send className="h-3 w-3" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1 rounded-[10px] text-[11px] font-bold font-serif transition-colors flex items-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-[#72A4F2] text-[#202020]' : 'text-white/70 hover:text-white'
            }`}
          >
            <FileCode2 className="h-3 w-3" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-[10px] text-[11px] font-bold font-serif transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-[#72A4F2] text-[#202020]' : 'text-white/70 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            Analytics
          </button>
        </div>
      </div>

      {/* Tab 1: Shared Inbox Preview */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] bg-[#F4EFE7]">
          {/* Left Column: Conversation List */}
          <div className="md:col-span-5 border-r-2 border-[#202020] bg-white p-3 space-y-2">
            <div className="p-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[14px] flex items-center gap-2 text-xs">
              <Search className="h-3.5 w-3.5 text-[#202020]/50" />
              <input
                type="text"
                readOnly
                value="Search 2,410 conversations..."
                className="bg-transparent text-[11px] outline-none text-[#202020]/70 w-full"
              />
            </div>

            {/* Active Thread */}
            <div className="p-3 bg-[#72A4F2]/20 border-2 border-[#202020] rounded-[18px] cursor-pointer space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#202020]">Tariq Mansoor</span>
                <span className="text-[10px] text-[#202020]/60 font-mono">12:30 PM</span>
              </div>
              <p className="text-[11px] text-[#202020]/80 truncate">Can you confirm my VIP delivery window?</p>
              <div className="flex items-center gap-1.5 pt-1">
                <Badge variant="green" size="sm">OPEN</Badge>
                <Badge variant="blue" size="sm">Customer Support</Badge>
              </div>
            </div>

            {/* Inactive Threads */}
            <div className="p-3 bg-white border border-[#202020]/20 rounded-[18px] space-y-1 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#202020]">Fatima Al Zaabi</span>
                <span className="text-[10px] text-[#202020]/60 font-mono">11:45 AM</span>
              </div>
              <p className="text-[11px] text-[#202020]/70 truncate">Order confirmed. Thank you for the quick assistance!</p>
              <div className="flex items-center gap-1.5 pt-1">
                <Badge variant="charcoal" size="sm">RESOLVED</Badge>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#202020]/20 rounded-[18px] space-y-1 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#202020]">Rahul Sharma</span>
                <span className="text-[10px] text-[#202020]/60 font-mono">10:15 AM</span>
              </div>
              <p className="text-[11px] text-[#202020]/70 truncate">Can I reschedule my appointment to tomorrow?</p>
              <div className="flex items-center gap-1.5 pt-1">
                <Badge variant="yellow" size="sm">PENDING</Badge>
                <Badge variant="blue" size="sm">Sales Desk</Badge>
              </div>
            </div>
          </div>

          {/* Right Column: Chat Canvas */}
          <div className="md:col-span-7 flex flex-col justify-between p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020] bg-white p-3 rounded-[18px] border-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#72A4F2] text-[#202020] font-serif font-bold text-xs flex items-center justify-center border-1.5 border-[#202020]">
                  TM
                </div>
                <div>
                  <div className="font-serif font-bold text-xs text-[#202020]">Tariq Mansoor (+971 50 443 2190)</div>
                  <div className="text-[10px] text-[#065f46] font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    24h Customer Service Window: 21h 45m remaining
                  </div>
                </div>
              </div>
              <Badge variant="green" size="sm">Verified Contact</Badge>
            </div>

            {/* Message Bubbles */}
            <div className="space-y-3 px-2">
              {/* Customer Inbound */}
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="bg-white border-2 border-[#202020] rounded-[20px] rounded-tl-none p-3 shadow-[2px_2px_0px_#202020] text-xs space-y-1">
                  <p>Hi! Can you please confirm my delivery window for order #98127? Need it before 4 PM today.</p>
                  <span className="text-[9px] text-[#202020]/50 font-mono block text-right">12:30 PM</span>
                </div>
              </div>

              {/* Agent Voice Note Reply */}
              <div className="flex items-end justify-end">
                <div className="bg-[#202020] text-white border-2 border-[#202020] rounded-[20px] rounded-br-none p-3 shadow-[2px_2px_0px_#72A4F2] text-xs space-y-1 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#72A4F2] text-[#202020] flex items-center justify-center cursor-pointer">
                      <Play className="h-3.5 w-3.5 fill-[#202020]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="h-1.5 w-32 bg-white/30 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-[#72A4F2] rounded-full" />
                      </div>
                      <span className="text-[9px] text-white/70 font-mono">Voice Note (0:14) • Sent via Meta Cloud API</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-white/60">
                    <span>12:31 PM</span>
                    <CheckCheck className="h-3 w-3 text-[#72A4F2]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Composer */}
            <div className="bg-white border-2 border-[#202020] rounded-[20px] p-2.5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="Hello Tariq! Your driver is 15 minutes away with your package..."
                className="text-xs text-[#202020] outline-none flex-1 font-sans"
              />
              <Button variant="primary" size="sm" className="font-bold text-xs gap-1 px-3">
                <Send className="h-3 w-3" />
                Reply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bulk Campaigns Preview */}
      {activeTab === 'campaigns' && (
        <div className="p-6 bg-[#F4EFE7] space-y-4 min-h-[420px]">
          <div className="flex items-center justify-between bg-white p-4 rounded-[22px] border-2 border-[#202020]">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-base text-[#202020]">Ramadan VIP Promotion Campaign</h4>
                <Badge variant="green" size="sm">DISPATCHING (82%)</Badge>
              </div>
              <p className="text-xs text-[#202020]/70 mt-0.5">
                Target: 12,500 Opted-In Customers • Template: <code className="font-mono">ramadan_exclusive_v2</code>
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif font-black text-[#202020]">10,250 / 12,500</span>
              <span className="text-[10px] text-[#065f46] block font-bold">99.8% Meta Delivery Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block">Sent &amp; Delivered</span>
              <div className="text-2xl font-serif font-bold text-[#202020] mt-1">10,229</div>
              <span className="text-[10px] text-[#065f46] font-bold">0 Failed • 21 Queued</span>
            </div>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block">Read Rate</span>
              <div className="text-2xl font-serif font-bold text-[#72A4F2] mt-1">84.2%</div>
              <span className="text-[10px] text-[#202020]/70">8,610 opened in 12 mins</span>
            </div>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block">Direct Replies</span>
              <div className="text-2xl font-serif font-bold text-[#065f46] mt-1">1,492</div>
              <span className="text-[10px] text-[#065f46] font-bold">Routed to Shared Inbox</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Template Builder Preview */}
      {activeTab === 'templates' && (
        <div className="p-6 bg-[#F4EFE7] grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[420px] items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">Meta Graph API v21.0</Badge>
              <Badge variant="green" size="sm">APPROVED</Badge>
            </div>
            <h4 className="font-serif font-bold text-xl text-[#202020]">In-Dashboard Meta Template Studio</h4>
            <p className="text-xs text-[#202020]/80 leading-relaxed font-sans">
              Create marketing, utility, and authentication templates directly in our platform. No need to visit Meta Business Manager. Dynamic sequential variable validation (<code className="font-mono bg-white px-1 py-0.5 rounded border border-[#202020]/30">{`{{1}}`}</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#202020]/30">{`{{2}}`}</code>) prevents Meta rejection.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Badge variant="charcoal" size="sm">Header Media (Image/Video)</Badge>
              <Badge variant="charcoal" size="sm">Quick Reply Buttons</Badge>
              <Badge variant="charcoal" size="sm">Call-to-Action URLs</Badge>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            {/* Phone Mockup Frame */}
            <div className="w-64 bg-[#202020] p-3 rounded-[32px] border-2 border-[#202020] shadow-[4px_4px_0px_#72A4F2]">
              <div className="bg-[#EFEAE2] rounded-[22px] p-3 space-y-2 text-[10px]">
                <div className="bg-[#075E54] text-white p-2 rounded-t-[14px] flex items-center justify-between">
                  <span className="font-bold">Rich Rlephant</span>
                  <span className="text-[9px]">Official WABA</span>
                </div>
                <div className="bg-white p-3 rounded-[16px] border border-black/10 space-y-2 shadow-xs">
                  <p className="font-bold text-[#202020]">Exclusive 30% VIP Offer ✨</p>
                  <p className="text-[#202020]/80">
                    Hello <span className="text-[#72A4F2] font-bold">{`{{1}}`}</span>! Your seasonal catalog is now unlocked for your store account.
                  </p>
                  <div className="pt-2 border-t border-black/10 flex flex-col gap-1.5">
                    <button className="w-full py-1.5 bg-[#F9F6F1] text-[#00a884] font-bold rounded-[8px] border border-black/10">
                      Shop VIP Collection &rarr;
                    </button>
                    <button className="w-full py-1.5 bg-[#F9F6F1] text-[#00a884] font-bold rounded-[8px] border border-black/10">
                      Chat with Stylist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Analytics Preview */}
      {activeTab === 'analytics' && (
        <div className="p-6 bg-[#F4EFE7] space-y-4 min-h-[420px]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase">Delivery SLA</span>
              <div className="text-2xl font-serif font-black text-[#065f46] mt-1">99.8%</div>
              <span className="text-[10px] text-[#065f46] font-bold">&lt; 1.2s avg latency</span>
            </div>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase">First Response Time</span>
              <div className="text-2xl font-serif font-black text-[#72A4F2] mt-1">42 sec</div>
              <span className="text-[10px] text-[#202020]/70">Bot + Human triage</span>
            </div>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase">Customer Opt-In Base</span>
              <div className="text-2xl font-serif font-black text-[#202020] mt-1">48,200</div>
              <span className="text-[10px] text-[#065f46] font-bold">100% Verifiable Consent</span>
            </div>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px]">
              <span className="text-[10px] font-bold text-[#202020]/60 uppercase">Conversations Saved</span>
              <div className="text-2xl font-serif font-black text-[#202020] mt-1">128,400</div>
              <span className="text-[10px] text-[#72A4F2] font-bold">AI intent resolved</span>
            </div>
          </div>

          <div className="p-5 bg-white border-2 border-[#202020] rounded-[22px] flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-serif font-bold text-sm text-[#202020]">Exportable Executive Reports</span>
              <p className="text-xs text-[#202020]/70">
                Detailed breakdowns by destination country code, Meta conversation categories (Marketing, Utility, Service), and agent performance.
              </p>
            </div>
            <Badge variant="blue" size="md">Realtime Audit Ledger</Badge>
          </div>
        </div>
      )}
    </div>
  );
};
