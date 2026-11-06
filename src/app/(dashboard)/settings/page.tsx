'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Users,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UserCheck,
  UserX,
  Mail,
  ShieldCheck,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmbeddedSignupModal } from '@/components/settings/embedded-signup-modal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'workspace_owner' | 'workspace_admin' | 'manager' | 'agent';
  department: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'usr_001',
    name: 'Chethan Reddy',
    email: 'chethan@example.com',
    role: 'workspace_owner',
    department: 'Customer Support',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'usr_002',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    role: 'agent',
    department: 'Sales Desk',
    status: 'active',
    lastActive: '12 mins ago',
  },
  {
    id: 'usr_003',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'manager',
    department: 'Compliance',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: 'usr_004',
    name: 'Tariq Mansoor',
    email: 'tariq@example.com',
    role: 'agent',
    department: 'Customer Support',
    status: 'invited',
    lastActive: 'Pending invite acceptance',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'team' | 'billing'>('team');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Team Management State
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'workspace_admin' | 'manager' | 'agent'>('agent');
  const [inviteDept, setInviteDept] = useState('Customer Support');

  // Notification Toast
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `usr_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      department: inviteDept,
      status: 'invited',
      lastActive: 'Invitation sent just now',
    };

    setTeam([...team, newMember]);
    setInviteName('');
    setInviteEmail('');
    setIsInviteModalOpen(false);
    showSuccess(`Invitation email sent successfully to ${newMember.email}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setTeam((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    );
    const updatedName = editingMember.name;
    setEditingMember(null);
    showSuccess(`Updated role & permissions for ${updatedName}`);
  };

  const handleToggleStatus = (id: string) => {
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (m.role === 'workspace_owner') {
            alert('The Workspace Owner account cannot be suspended.');
            return m;
          }
          const nextStatus = m.status === 'active' ? 'suspended' : 'active';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleRemoveMember = (id: string) => {
    const target = team.find((m) => m.id === id);
    if (!target) return;
    if (target.role === 'workspace_owner') {
      alert('The Workspace Owner cannot be removed.');
      return;
    }

    if (confirm(`Are you sure you want to remove ${target.name} from this workspace?`)) {
      setTeam((prev) => prev.filter((m) => m.id !== id));
      showSuccess(`Removed ${target.name} from workspace`);
    }
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    switch (role) {
      case 'workspace_owner':
        return <Badge variant="blue" size="sm">Workspace Owner</Badge>;
      case 'workspace_admin':
        return <Badge variant="green" size="sm">Workspace Admin</Badge>;
      case 'manager':
        return <Badge variant="yellow" size="sm">Manager</Badge>;
      case 'agent':
        return <Badge variant="charcoal" size="sm">Support Agent</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-[#202020]/70 mt-1">
          Manage Meta WhatsApp business accounts, team access control, and SaaS subscription plans.
        </p>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="p-3 bg-[#ecfdf5] border-2 border-[#065f46] rounded-[18px] text-xs text-[#065f46] font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-[#065f46]/60 hover:text-[#065f46]">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b-2 border-[#202020] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'team' ? 'border-[#202020] text-[#202020]' : 'border-transparent text-[#202020]/60'
          }`}
        >
          <Users className="h-4 w-4" />
          Team & RBAC Roles ({team.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'whatsapp' ? 'border-[#202020] text-[#202020]' : 'border-transparent text-[#202020]/60'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          WhatsApp Cloud API Connections
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'billing' ? 'border-[#202020] text-[#202020]' : 'border-transparent text-[#202020]/60'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          SaaS Subscription & Invoices
        </button>
      </div>

      {activeTab === 'team' ? (
        <div className="space-y-6">
          <Card
            title="Team Members & Access Control"
            subtitle="Role-based permissions enforced by PostgreSQL RLS policies across all tenant data"
          >
            <div className="flex items-center justify-between pb-4">
              <span className="text-xs text-[#202020]/70 font-medium">
                Active team members with assigned seat entitlements.
              </span>
              <Button
                variant="primary"
                size="sm"
                className="gap-2 font-bold"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Invite Team Member
              </Button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE7]">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#202020]">
                        {member.name}
                        <span className="block text-[10px] text-[#202020]/50 font-normal">
                          {member.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(member.role)}</td>
                      <td className="py-3.5 px-4 font-medium text-[#202020]/80">
                        {member.department}
                      </td>
                      <td className="py-3.5 px-4">
                        {member.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[#065f46] font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#065f46]"></span>
                            Active
                          </span>
                        ) : member.status === 'invited' ? (
                          <span className="inline-flex items-center gap-1 text-[#854d0e] font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#854d0e]"></span>
                            Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#991b1b] font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#991b1b]"></span>
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#202020]/60 font-medium">
                        {member.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {member.role === 'workspace_owner' ? (
                          <span className="text-[#202020]/40 font-bold text-[11px]">Primary Owner</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMember(member)}
                              className="px-2.5 py-1 text-xs font-bold text-[#202020] bg-white border border-[#202020] rounded-[10px] hover:bg-[#F4EFE7] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(member.id)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-[10px] border transition-colors ${
                                member.status === 'active'
                                  ? 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5] hover:bg-[#fecaca]'
                                  : 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7] hover:bg-[#d1fae5]'
                              }`}
                              title={member.status === 'active' ? 'Suspend account' : 'Reactivate account'}
                            >
                              {member.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 text-[#991b1b] hover:bg-[#fee2e2] rounded-[8px] transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* RBAC Permission Reference Card */}
          <Card
            title="Role-Based Access Control (RBAC) Permission Matrix"
            subtitle="Granular permissions enforced at the PostgreSQL RLS and API layer"
          >
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                  <tr>
                    <th className="py-2.5 px-3">System Permission</th>
                    <th className="py-2.5 px-3 text-center">Super Admin</th>
                    <th className="py-2.5 px-3 text-center">Workspace Admin</th>
                    <th className="py-2.5 px-3 text-center">Manager</th>
                    <th className="py-2.5 px-3 text-center">Support Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE7]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Manage Workspace & WABA Accounts</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Invite & Manage Team Roles</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Create & Submit Meta Templates</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Launch & Schedule Outbound Campaigns</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Export Contacts CSV (All / Filtered / Selected)</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗ (Strict Gate)</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗ (Strict Gate)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Shared Inbox: Two-Way Chat & Voice Notes</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#202020]">Developer API Key Generation & Rotation</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#065f46] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#991b1b] font-bold">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'whatsapp' ? (
        <div className="space-y-6">
          <Card title="Connected Meta WhatsApp Business Account (WABA)" subtitle="Direct Meta Cloud API Integration">
            <div className="p-5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold font-serif text-base text-[#202020]">Acme Retail Holdings WABA</h4>
                  <p className="text-xs text-[#202020]/60 font-mono mt-0.5">WABA ID: 104829104820194</p>
                </div>
                <Badge variant="green" size="sm" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#065f46]" />
                  Connected & Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 border-t-2 border-[#D8D0C4] text-xs">
                <div>
                  <span className="text-[#202020]/50 block text-[10px] font-bold uppercase">Token Vault Status</span>
                  <span className="font-bold text-[#065f46]">Encrypted (AES-256-GCM v1)</span>
                </div>
                <div>
                  <span className="text-[#202020]/50 block text-[10px] font-bold uppercase">Graph API Version</span>
                  <span className="font-bold text-[#202020]">v21.0 Active</span>
                </div>
                <div>
                  <span className="text-[#202020]/50 block text-[10px] font-bold uppercase">Last Health Check</span>
                  <span className="font-bold text-[#202020]">Today at 14:35 UTC</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => showSuccess('Meta WABA Health Check: Healthy (HTTP 200, Webhook Active)')}>
                Test Connection Health
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-2"
                onClick={() => setIsSignupModalOpen(true)}
              >
                Launch Meta Embedded Signup
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card title="SaaS Plan & Entitlements" subtitle="Transparent separation between SaaS software and Meta message charges">
          <div className="p-6 bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[24px] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-black text-[#202020] bg-white border border-[#202020] px-2.5 py-0.5 rounded-full">Current Plan</span>
              <h3 className="text-xl font-black font-serif text-[#202020] mt-2">Growth Tier — $79 / month</h3>
              <p className="text-xs text-[#202020]/70 mt-1 font-medium">Includes 5 Agent Seats, 2 WhatsApp Numbers, Unlimited Templates</p>
            </div>
            <Button variant="primary" size="md">
              Upgrade Plan
            </Button>
          </div>
        </Card>
      )}

      {/* MODAL 1: INVITE TEAM MEMBER */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Al Zaabi"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. fatima@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Assign Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="agent">Support Agent (Shared Inbox, Chat & Voice Notes)</option>
                  <option value="manager">Manager (Campaigns, Templates, Contacts & Inbox)</option>
                  <option value="workspace_admin">Workspace Admin (Full Tenant Access & API Keys)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Assign Department *</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Sales Desk">Sales Desk</option>
                  <option value="Compliance">Compliance & Legal</option>
                  <option value="Technical">Technical Operations</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TEAM MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">Edit Team Member</h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={editingMember.email}
                  className="w-full px-3 py-2 bg-[#F4EFE7] border-2 border-[#202020] rounded-[18px] opacity-70 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Role *</label>
                <select
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="agent">Support Agent</option>
                  <option value="manager">Manager</option>
                  <option value="workspace_admin">Workspace Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Department *</label>
                <select
                  value={editingMember.department}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Sales Desk">Sales Desk</option>
                  <option value="Compliance">Compliance & Legal</option>
                  <option value="Technical">Technical Operations</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Account Status *</label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="suspended">Suspended (Access Blocked)</option>
                  <option value="invited">Invited (Awaiting Confirmation)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Signup Modal */}
      <EmbeddedSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSuccess={() => {
          showSuccess('Meta WABA Connected Successfully!');
        }}
      />
    </div>
  );
}
