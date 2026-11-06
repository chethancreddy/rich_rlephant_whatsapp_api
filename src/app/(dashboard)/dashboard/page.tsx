'use client';

import React from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCheck,
  Eye,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BRAND_CONFIG } from '@/lib/design-tokens';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Notice - Editorial Warm Aesthetic */}
      <div className="bg-white border-2 border-[#202020] text-[#202020] rounded-[32px] p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-[#202020] font-black bg-[#BED0F7] px-2.5 py-0.5 rounded-full border border-[#202020]">
                Platform Status
              </span>
              <span className="text-xs font-semibold text-[#202020]/70">Meta Cloud API v21.0 Online</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-serif tracking-tight text-[#202020]">
              {BRAND_CONFIG.name}
            </h2>
            <p className="text-xs text-[#202020]/70 mt-2 leading-relaxed font-sans">
              {BRAND_CONFIG.legalDisclaimer}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/campaigns">
              <Button variant="primary" size="md" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Bulk Campaign
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="secondary" size="md" className="gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202020]/60 uppercase tracking-wider">Messages Sent</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#BED0F7] border-2 border-[#202020] text-[#202020] flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-serif text-[#202020]">42,850</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#065f46] font-bold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% from last week</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202020]/60 uppercase tracking-wider">Delivery Rate</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#F4EFE7] border-2 border-[#202020] text-[#202020] flex items-center justify-center">
              <CheckCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-serif text-[#202020]">99.4%</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#202020]/70 font-semibold">
              <Eye className="h-3 w-3 text-[#202020]" />
              <span>86.2% read rate</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202020]/60 uppercase tracking-wider">Opted-In Contacts</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#BED0F7] border-2 border-[#202020] text-[#202020] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-serif text-[#202020]">18,420</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#065f46] font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#065f46]" />
              <span>100% consent verified</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202020]/60 uppercase tracking-wider">Estimated Meta Cost</span>
            <div className="w-10 h-10 rounded-[14px] bg-[#fef9c3] border-2 border-[#202020] text-[#854d0e] flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-serif text-[#202020]">$342.80</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#202020]/60 font-semibold">
              <span>Billed directly via Meta account</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Grid: WhatsApp Assets & Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Senders & Quality */}
        <Card title="Connected WhatsApp Senders" subtitle="Official Meta Cloud API Asset Inventory" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202020] font-mono">+971 50 123 4567</span>
                <Badge variant="blue" size="sm">Primary</Badge>
              </div>
              <p className="text-xs text-[#202020]/70 mt-1 font-medium">Verified Name: Acme Retail Dubai</p>
              <div className="mt-3 pt-2.5 border-t border-[#D8D0C4] flex items-center justify-between text-xs">
                <span className="text-[#202020]/60 font-medium">Quality Score:</span>
                <span className="font-bold text-[#065f46] bg-[#ecfdf5] border border-[#6ee7b7] px-2 py-0.5 rounded-full">High (Green)</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-[#202020]/60 font-medium">Messaging Limit:</span>
                <span className="font-bold text-[#202020]">10,000 / 24 hrs</span>
              </div>
            </div>

            <div className="p-4 bg-[#F9F6F1] border-2 border-[#D8D0C4] rounded-[22px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202020] font-mono">+971 50 987 6543</span>
                <Badge variant="cream" size="sm">Customer Care</Badge>
              </div>
              <p className="text-xs text-[#202020]/70 mt-1 font-medium">Verified Name: Acme Support Desk</p>
              <div className="mt-3 pt-2.5 border-t border-[#D8D0C4] flex items-center justify-between text-xs">
                <span className="text-[#202020]/60 font-medium">Quality Score:</span>
                <span className="font-bold text-[#065f46] bg-[#ecfdf5] border border-[#6ee7b7] px-2 py-0.5 rounded-full">High (Green)</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-[#202020]/60 font-medium">Messaging Limit:</span>
                <span className="font-bold text-[#202020]">1,000 / 24 hrs</span>
              </div>
            </div>

            <Link href="/settings">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Manage Senders
              </Button>
            </Link>
          </div>
        </Card>

        {/* Active Campaigns & Scheduled Queue */}
        <Card title="Recent Campaign Operations" subtitle="Durable queue status and delivery tracking" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE7]">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#202020]">
                    November UAE Flash Sale
                    <span className="block text-[10px] text-[#202020]/50 font-normal">Marketing • 2 hrs ago</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] bg-[#F4EFE7] border border-[#D8D0C4] px-2 py-0.5 rounded font-medium">
                      seasonal_sale_2026
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#202020]">4,500</span>
                    <span className="text-[10px] text-[#202020]/60 block">4,482 delivered</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="green" size="sm">Completed</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href="/campaigns" className="text-[#202020] hover:text-[#72A4F2] font-bold underline">
                      Report →
                    </Link>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#202020]">
                    VIP Loyalty Re-engagement
                    <span className="block text-[10px] text-[#202020]/50 font-normal">Marketing • Scheduled</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] bg-[#F4EFE7] border border-[#D8D0C4] px-2 py-0.5 rounded font-medium">
                      vip_exclusive_offer
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#202020]">1,250</span>
                    <span className="text-[10px] text-[#202020]/60 block">Preflight Passed</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="blue" size="sm">Scheduled</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href="/campaigns" className="text-[#202020] hover:text-[#72A4F2] font-bold underline">
                      View →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Safety & Compliance Pre-Flight Summary */}
      <Card title="Compliance & Campaign Safeguards" subtitle="Deterministic policy enforcement active" borderStyle="solid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#202020] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#202020] font-serif text-sm block">Consent Enforcement</span>
              <p className="text-[#202020]/70 mt-1 leading-relaxed">
                Recipients without timestamped consent evidence are blocked automatically before entering send queue.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[22px] flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#202020] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#202020] font-serif text-sm block">24h Service Window</span>
              <p className="text-[#202020]/70 mt-1 leading-relaxed">
                Free-form replies are locked after 24 hours. Business messages outside the window require approved Meta templates.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#fef9c3] border-2 border-[#202020] rounded-[22px] flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#854d0e] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#854d0e] font-serif text-sm block">Instant Suppression</span>
              <p className="text-[#854d0e]/80 mt-1 leading-relaxed">
                Inbound STOP keywords suppress contacts in real-time, preventing pending queue items from being submitted.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
