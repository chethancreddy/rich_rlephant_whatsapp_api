'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Activity,
  AlertTriangle,
  Server,
  Layers,
  Database,
  ArrowUpRight,
  TrendingUp,
  KeyRound,
  Check,
  History,
  X,
  CreditCard,
  Lock,
  Mail,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DETAILED_PLANS, type DetailedPlanInfo } from '@/lib/services/subscription-service';
import type { PlanTier } from '@/lib/services/billing-service';
import { MetaIntegrationCard } from '@/components/settings/meta-integration-card';
import { SecurityDashboardTab } from '@/components/super-admin/security-dashboard-tab';

interface CustomerTenant {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  planCode: PlanTier;
  planPriceUsd: number;
  startDate: string;
  expiryDate: string;
  contactUsage: number;
  contactLimit: number;
  messageUsage: number;
  messageLimit: number;
  status: 'active' | 'past_due' | 'trialing';
  qualityRating: 'High (Green)' | 'Medium (Yellow)' | 'Low (Red)';
  wabaCount: number;
  phoneCount: number;
}

const INITIAL_CUSTOMERS: CustomerTenant[] = [
  {
    id: 'tenant_dubai_retail',
    name: 'Acme Dubai Retail',
    slug: 'acme-dubai',
    adminEmail: 'ops@acmedubai.ae',
    planCode: 'starter',
    planPriceUsd: 49,
    startDate: '2026-11-01',
    expiryDate: '2026-11-30',
    contactUsage: 4120,
    contactLimit: 5000,
    messageUsage: 14800,
    messageLimit: 50000,
    status: 'active',
    qualityRating: 'High (Green)',
    wabaCount: 1,
    phoneCount: 2,
  },
  {
    id: 'tenant_lux_travel',
    name: 'Oasis Luxury Travel LLC',
    slug: 'oasis-travel',
    adminEmail: 'bookings@oasistravel.ae',
    planCode: 'growth',
    planPriceUsd: 149,
    startDate: '2026-10-15',
    expiryDate: '2026-11-15',
    contactUsage: 18400,
    contactLimit: 25000,
    messageUsage: 42100,
    messageLimit: 250000,
    status: 'active',
    qualityRating: 'High (Green)',
    wabaCount: 2,
    phoneCount: 4,
  },
  {
    id: 'tenant_fintech_gcc',
    name: 'Gulf Smart Pay',
    slug: 'gulf-pay',
    adminEmail: 'security@gulfsmartpay.com',
    planCode: 'enterprise',
    planPriceUsd: 499,
    startDate: '2026-09-01',
    expiryDate: '2027-08-31',
    contactUsage: 84300,
    contactLimit: 100000,
    messageUsage: 310000,
    messageLimit: 1000000,
    status: 'active',
    qualityRating: 'High (Green)',
    wabaCount: 3,
    phoneCount: 8,
  },
];

interface SubscriptionHistoryEntry {
  id: string;
  date: string;
  oldPlan: string;
  newPlan: string;
  newPrice: number;
  performer: string;
  notes: string;
}

export default function SuperAdminPage() {
  const [customers, setCustomers] = useState<CustomerTenant[]>(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerTenant | null>(null);

  // Modal states
  const [adminTab, setAdminTab] = useState<'workspaces' | 'integrations' | 'security'>('workspaces');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Upgrade Plan state
  const [targetPlanCode, setTargetPlanCode] = useState<PlanTier>('growth');
  const [effectiveImmediately, setEffectiveImmediately] = useState(true);
  const [upgradeNotes, setUpgradeNotes] = useState('');
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);

  // Password reset state
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // History state
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryEntry[]>([
    {
      id: 'sh_01',
      date: '2026-11-01 09:30 UTC',
      oldPlan: 'Free Starter ($0/mo)',
      newPlan: 'Starter Pro ($49/mo)',
      newPrice: 49,
      performer: 'admin@rich-rlephant.com',
      notes: 'Initial production subscription activation',
    },
  ]);

  const handleOpenDetails = (customer: CustomerTenant) => {
    setSelectedCustomer(customer);
    // Default target plan to next tier
    if (customer.planCode === 'free') setTargetPlanCode('starter');
    else if (customer.planCode === 'starter') setTargetPlanCode('growth');
    else setTargetPlanCode('enterprise');
    setResetSuccessMessage(null);
  };

  const handleExecuteUpgrade = async () => {
    if (!selectedCustomer) return;
    setIsSubmittingUpgrade(true);

    try {
      const res = await fetch(`/api/super-admin/customers/${selectedCustomer.id}/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlanCode,
          effectiveImmediately,
          notes: upgradeNotes || `Super Admin plan upgrade to ${targetPlanCode.toUpperCase()}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const newPlanInfo = DETAILED_PLANS[targetPlanCode];

        // Update local state
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id
              ? {
                  ...c,
                  planCode: targetPlanCode,
                  planPriceUsd: newPlanInfo.monthlyFee,
                  contactLimit: newPlanInfo.entitlements.maxContacts,
                  messageLimit: newPlanInfo.entitlements.maxCampaignsPerMonth * 1000,
                }
              : c
          )
        );

        setSelectedCustomer((prev) =>
          prev
            ? {
                ...prev,
                planCode: targetPlanCode,
                planPriceUsd: newPlanInfo.monthlyFee,
                contactLimit: newPlanInfo.entitlements.maxContacts,
                messageLimit: newPlanInfo.entitlements.maxCampaignsPerMonth * 1000,
              }
            : null
        );

        // Add history
        setSubscriptionHistory((prev) => [
          {
            id: `sh_${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
            oldPlan: DETAILED_PLANS[selectedCustomer.planCode].name,
            newPlan: newPlanInfo.name,
            newPrice: newPlanInfo.monthlyFee,
            performer: 'admin@rich-rlephant.com',
            notes: upgradeNotes || 'Upgraded via Super Admin Operations Center',
          },
          ...prev,
        ]);

        setIsUpgradeModalOpen(false);
        setUpgradeNotes('');
        alert(`Plan successfully upgraded to ${newPlanInfo.name} ($${newPlanInfo.monthlyFee}/mo). Entitlements updated immediately.`);
      } else {
        alert(data.error || 'Failed to upgrade plan');
      }
    } catch {
      alert('Network error communicating with billing service');
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  const handleExecutePasswordReset = async () => {
    if (!selectedCustomer) return;
    setIsSubmittingReset(true);
    setResetSuccessMessage(null);

    try {
      const res = await fetch(`/api/super-admin/customers/${selectedCustomer.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: selectedCustomer.adminEmail,
          userId: `usr_${selectedCustomer.slug}`,
          revokeExistingSessions: revokeSessions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResetSuccessMessage(
          `Password reset link dispatched securely to ${selectedCustomer.adminEmail}. Link is valid for 60 minutes.${
            revokeSessions ? ' All active customer sessions have been terminated.' : ''
          }`
        );
      } else {
        alert(data.error || 'Failed to dispatch password reset');
      }
    } catch {
      alert('Network error dispatching password reset');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const currentPlanDetails = selectedCustomer ? DETAILED_PLANS[selectedCustomer.planCode] : null;
  const targetPlanDetails = DETAILED_PLANS[targetPlanCode];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Top Header */}
      <div className="bg-[#202020] text-white p-8 rounded-[32px] border-2 border-[#202020]">
        <div className="flex items-center gap-2 text-[#72A4F2] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" />
          Master Platform Control
        </div>
        <h2 className="text-2xl font-bold font-serif tracking-tight">Super Admin Operations Center</h2>
        <p className="text-xs text-white/70 mt-1 font-sans">
          Global multi-tenant portfolio oversight, customer subscription & plan lifecycle management, password security, and Meta App health.
        </p>
      </div>

      {/* Infrastructure KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-xs">
        <Card className="p-5">
          <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">Active Tenants</span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">{customers.length} Workspaces</div>
          <span className="text-[#065f46] block mt-1 font-bold">100% RLS Isolation</span>
        </Card>
        <Card className="p-5">
          <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">Worker Daemons</span>
          <div className="text-2xl font-black font-serif text-[#065f46] mt-1">5 Running</div>
          <span className="text-[#202020]/60 block mt-1 font-medium">0.02s poll latency</span>
        </Card>
        <Card className="p-5">
          <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">SaaS ARR (Run-Rate)</span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">
            ${customers.reduce((acc, c) => acc + c.planPriceUsd, 0) * 12}/yr
          </div>
          <span className="text-[#065f46] block mt-1 font-bold">Subscription MRR: ${customers.reduce((acc, c) => acc + c.planPriceUsd, 0)}</span>
        </Card>
        <Card className="p-5">
          <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">Audit Security</span>
          <div className="text-2xl font-black font-serif text-[#72A4F2] mt-1">Active</div>
          <span className="text-[#202020]/60 block mt-1 font-medium">Immutable audit logging</span>
        </Card>
      </div>

      {/* Super Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-[#202020] pb-3">
        <button
          onClick={() => setAdminTab('workspaces')}
          className={`px-4 py-2 font-serif font-bold text-xs rounded-[16px] border-2 border-[#202020] transition-all flex items-center gap-2 ${
            adminTab === 'workspaces'
              ? 'bg-[#72A4F2] text-[#202020] shadow-[3px_3px_0px_#202020]'
              : 'bg-white text-[#202020]/70 hover:bg-[#F9F6F1]'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Customer Workspaces &amp; Subscriptions
        </button>
        <button
          onClick={() => setAdminTab('security')}
          className={`px-4 py-2 font-serif font-bold text-xs rounded-[16px] border-2 border-[#202020] transition-all flex items-center gap-2 ${
            adminTab === 'security'
              ? 'bg-[#72A4F2] text-[#202020] shadow-[3px_3px_0px_#202020]'
              : 'bg-white text-[#202020]/70 hover:bg-[#F9F6F1]'
          }`}
        >
          <Lock className="h-4 w-4" />
          Enterprise Security &amp; Audit Management
        </button>
        <button
          onClick={() => setAdminTab('integrations')}
          className={`px-4 py-2 font-serif font-bold text-xs rounded-[16px] border-2 border-[#202020] transition-all flex items-center gap-2 ${
            adminTab === 'integrations'
              ? 'bg-[#72A4F2] text-[#202020] shadow-[3px_3px_0px_#202020]'
              : 'bg-white text-[#202020]/70 hover:bg-[#F9F6F1]'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Settings &rarr; Integrations &rarr; Meta WhatsApp
        </button>
      </div>

      {adminTab === 'security' ? (
        <SecurityDashboardTab />
      ) : adminTab === 'integrations' ? (
        <MetaIntegrationCard />
      ) : (
        /* Tenants Table */
        <Card
          title="Customer Tenant Workspaces & Subscription Control"
          subtitle="Manage customer plans, view real-time usage vs limits, and handle security credentials without file exports"
        >
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                <tr>
                  <th className="py-3 px-4">Workspace / Tenant</th>
                  <th className="py-3 px-4">Current Plan</th>
                  <th className="py-3 px-4">Contact Usage</th>
                  <th className="py-3 px-4">Assets</th>
                  <th className="py-3 px-4">Quality Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Customer Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE7]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9F6F1]/50">
                    <td className="py-3.5 px-4 font-bold text-[#202020]">
                      {c.name}
                      <span className="block text-[10px] text-[#202020]/50 font-mono font-normal">
                        slug: {c.slug} | {c.adminEmail}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.planCode === 'enterprise' ? 'charcoal' : 'blue'} size="sm">
                        {DETAILED_PLANS[c.planCode].name} (${c.planPriceUsd}/mo)
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {c.contactUsage.toLocaleString()} / {c.contactLimit.toLocaleString()}
                      <div className="w-24 bg-[#E5DFD5] h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#72A4F2] h-full rounded-full"
                          style={{ width: `${Math.min(100, (c.contactUsage / c.contactLimit) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#202020]">
                      {c.wabaCount} WABA | {c.phoneCount} Numbers
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#065f46] font-bold bg-[#ecfdf5] border border-[#6ee7b7] px-2.5 py-0.5 rounded-full">
                        {c.qualityRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="green" size="sm">Active</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => handleOpenDetails(c)}
                      >
                        Customer Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer Details Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-3xl w-full border-2 border-[#202020] shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-[#202020] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] text-[#202020] font-black text-sm flex items-center justify-center font-serif">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold font-serif text-lg text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-white/70 font-mono">
                    ID: {selectedCustomer.id} | Admin: {selectedCustomer.adminEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#202020]">
              {/* Section 1: Subscription & Plan Management */}
              <div className="p-5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#202020] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60">
                      Current Subscription Plan
                    </span>
                    <h4 className="text-base font-bold font-serif text-[#202020]">
                      {currentPlanDetails?.name} — ${selectedCustomer.planPriceUsd}/month
                    </h4>
                  </div>
                  <Badge variant="blue" size="md">
                    Status: {selectedCustomer.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Plan Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-[16px] border border-[#202020]/30">
                    <span className="text-[10px] text-[#202020]/60 block">Subscription Start</span>
                    <span className="font-bold text-xs font-mono">{selectedCustomer.startDate}</span>
                  </div>
                  <div className="bg-white p-3 rounded-[16px] border border-[#202020]/30">
                    <span className="text-[10px] text-[#202020]/60 block">Subscription Expiry</span>
                    <span className="font-bold text-xs font-mono">{selectedCustomer.expiryDate}</span>
                  </div>
                  <div className="bg-white p-3 rounded-[16px] border border-[#202020]/30">
                    <span className="text-[10px] text-[#202020]/60 block">Active Contacts</span>
                    <span className="font-bold text-xs font-mono">
                      {selectedCustomer.contactUsage.toLocaleString()} / {selectedCustomer.contactLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-[16px] border border-[#202020]/30">
                    <span className="text-[10px] text-[#202020]/60 block">Monthly Messages</span>
                    <span className="font-bold text-xs font-mono">
                      {selectedCustomer.messageUsage.toLocaleString()} / {selectedCustomer.messageLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Available Features List */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60 block mb-2">
                    Available Entitled Features
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPlanDetails?.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium bg-white p-2.5 rounded-[14px] border border-[#202020]/20">
                        <Check className="h-4 w-4 text-[#065f46] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Upgrade Trigger */}
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    className="gap-2 font-bold"
                    onClick={() => setIsUpgradeModalOpen(true)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </div>
              </div>

              {/* Section 2: Administrative Password Reset */}
              <div className="p-5 bg-white border-2 border-[#202020] rounded-[24px] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#202020]" />
                    <h4 className="font-bold font-serif text-sm text-[#202020]">Administrative Password Reset</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-bold border-2 border-[#202020]"
                    onClick={() => setIsResetPasswordModalOpen(true)}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Reset Password
                  </Button>
                </div>
                <p className="text-xs text-[#202020]/70 leading-relaxed">
                  Super Admin can securely trigger a password-reset flow for the customer administrator ({selectedCustomer.adminEmail}). In accordance with strict security policies, existing passwords cannot be viewed or modified directly; a cryptographically secure one-time reset link valid for 60 minutes will be generated and dispatched.
                </p>
                {resetSuccessMessage && (
                  <div className="p-3 bg-[#ecfdf5] border-2 border-[#065f46] rounded-[16px] text-xs text-[#065f46] font-bold flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Section 3: Subscription History Audit Trail */}
              <div className="p-5 bg-white border-2 border-[#202020] rounded-[24px] space-y-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#202020]" />
                  <h4 className="font-bold font-serif text-sm text-[#202020]">Subscription Change History</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9F6F1] font-bold border-b border-[#202020]/20">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Plan Change</th>
                        <th className="py-2 px-3">New Price</th>
                        <th className="py-2 px-3">Performed By</th>
                        <th className="py-2 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EFE7]">
                      {subscriptionHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F9F6F1]/50">
                          <td className="py-2.5 px-3 font-mono text-[11px]">{item.date}</td>
                          <td className="py-2.5 px-3 font-semibold">{item.oldPlan} → {item.newPlan}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">${item.newPrice}/mo</td>
                          <td className="py-2.5 px-3 text-[11px] text-[#202020]/70">{item.performer}</td>
                          <td className="py-2.5 px-3 text-[11px]">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F9F6F1] border-t-2 border-[#202020] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Comparison Modal */}
      {isUpgradeModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-[#202020]/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full border-2 border-[#202020] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-[#202020] pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#202020]">Upgrade Customer Subscription</h3>
                <p className="text-xs text-[#202020]/70">
                  Select a target plan for <strong>{selectedCustomer.name}</strong>. Entitlements and billing limits will update immediately.
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1.5 text-[#202020]/60 hover:text-[#202020] rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Plan Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(['free', 'starter', 'growth', 'enterprise'] as PlanTier[]).map((code) => {
                const plan = DETAILED_PLANS[code];
                const isCurrent = selectedCustomer.planCode === code;
                const isSelected = targetPlanCode === code;

                return (
                  <button
                    key={code}
                    onClick={() => setTargetPlanCode(code)}
                    disabled={isCurrent}
                    className={`p-3.5 rounded-[20px] border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#202020] bg-[#72A4F2] text-[#202020] shadow-md scale-102 font-bold'
                        : isCurrent
                        ? 'border-[#202020]/30 bg-[#F4EFE7]/50 opacity-60 cursor-not-allowed'
                        : 'border-[#202020] bg-white hover:bg-[#F9F6F1]'
                    }`}
                  >
                    <span className="block font-bold font-serif text-sm">{plan.name}</span>
                    <span className="text-xs font-mono font-black mt-1 block">${plan.monthlyFee}/mo</span>
                    {isCurrent && <span className="text-[10px] font-bold uppercase text-[#854d0e] mt-2 block">Current Plan</span>}
                  </button>
                );
              })}
            </div>

            {/* Side-by-Side Comparison Card */}
            <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] space-y-3 text-xs">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#202020]/60 block">
                Current Plan vs. Target Plan Comparison
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-[16px] border border-[#202020]/20 space-y-1">
                  <span className="text-[10px] text-[#202020]/60 font-bold block uppercase">Current: {currentPlanDetails?.name}</span>
                  <p className="font-mono text-sm font-bold">${currentPlanDetails?.monthlyFee}/month</p>
                  <p className="text-[11px] text-[#202020]/70">• {currentPlanDetails?.entitlements.maxContacts.toLocaleString()} Contacts</p>
                  <p className="text-[11px] text-[#202020]/70">• {currentPlanDetails?.entitlements.maxAgents} Agents</p>
                  <p className="text-[11px] text-[#202020]/70">• AI Copilot: {currentPlanDetails?.entitlements.aiCopilotEnabled ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-3 bg-[#72A4F2]/30 rounded-[16px] border-2 border-[#202020] space-y-1">
                  <span className="text-[10px] text-[#202020] font-bold block uppercase">New: {targetPlanDetails.name}</span>
                  <p className="font-mono text-sm font-black text-[#202020]">${targetPlanDetails.monthlyFee}/month</p>
                  <p className="text-[11px] font-bold text-[#065f46]">• {targetPlanDetails.entitlements.maxContacts.toLocaleString()} Contacts (+{(targetPlanDetails.entitlements.maxContacts - (currentPlanDetails?.entitlements.maxContacts || 0)).toLocaleString()})</p>
                  <p className="text-[11px] font-bold text-[#065f46]">• {targetPlanDetails.entitlements.maxAgents} Agents</p>
                  <p className="text-[11px] font-bold text-[#202020]">• AI Copilot: {targetPlanDetails.entitlements.aiCopilotEnabled ? 'Included' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Effective Timing & Confirmation */}
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={effectiveImmediately}
                  onChange={(e) => setEffectiveImmediately(e.target.checked)}
                  className="rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                />
                <span>Apply upgrade and provision new feature limits immediately</span>
              </label>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#202020]/60 block mb-1">
                  Reason for Upgrade / Audit Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise volume expansion agreed with client"
                  value={upgradeNotes}
                  onChange={(e) => setUpgradeNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border-2 border-[#202020] rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] font-medium"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t-2 border-[#202020]">
              <Button variant="outline" size="sm" onClick={() => setIsUpgradeModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="gap-2 font-bold"
                disabled={isSubmittingUpgrade || targetPlanCode === selectedCustomer.planCode}
                onClick={handleExecuteUpgrade}
              >
                {isSubmittingUpgrade ? 'Applying Plan Upgrade...' : `Confirm Upgrade to ${targetPlanDetails.name}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Modal */}
      {isResetPasswordModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-[#202020]/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full border-2 border-[#202020] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-[#202020] pb-3">
              <div className="flex items-center gap-2 text-[#202020]">
                <KeyRound className="h-5 w-5 text-[#202020]" />
                <h3 className="text-base font-bold font-serif">Confirm Password Reset</h3>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1.5 text-[#202020]/60 hover:text-[#202020] rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#202020]/80 leading-relaxed">
              You are about to initiate an administrative password reset for:
              <strong className="block text-[#202020] font-mono mt-1 text-sm">{selectedCustomer.adminEmail}</strong>
            </p>

            <div className="p-3 bg-[#ecfdf5] border-2 border-[#065f46] rounded-[18px] text-xs text-[#065f46] font-medium space-y-1">
              <span className="font-bold block">Security Standard Enforced:</span>
              <p>• A one-time cryptographically hashed link will be emailed to the registered user.</p>
              <p>• Link will automatically expire in 60 minutes.</p>
              <p>• Super Admin cannot create, inspect, or set customer passwords directly.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold pt-1">
              <input
                type="checkbox"
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                className="rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
              />
              <span>Revoke all existing customer browser sessions immediately</span>
            </label>

            <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-[#202020]">
              <Button variant="outline" size="sm" onClick={() => setIsResetPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="gap-1.5 font-bold"
                disabled={isSubmittingReset}
                onClick={async () => {
                  await handleExecutePasswordReset();
                  setIsResetPasswordModalOpen(false);
                }}
              >
                <Mail className="h-4 w-4" />
                {isSubmittingReset ? 'Dispatching...' : 'Dispatch Reset Link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
