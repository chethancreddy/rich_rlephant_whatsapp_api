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
  User,
  KeyRound,
  Laptop,
  Building,
  Briefcase,
  Bell,
  Code,
  Webhook,
  Globe,
  Sliders,
  Save,
  Lock,
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

type SettingsSection =
  | 'profile'
  | 'account'
  | 'password'
  | 'sessions'
  | 'workspace'
  | 'company'
  | 'whatsapp'
  | 'notifications'
  | 'team'
  | 'security'
  | 'billing'
  | 'api'
  | 'webhooks'
  | 'localization'
  | 'preferences';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('team');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Success Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Profile State
  const [displayName, setDisplayName] = useState('Chethan Reddy');
  const [jobTitle, setJobTitle] = useState('Principal Solutions Architect');
  const [bio, setBio] = useState('Managing high-scale WhatsApp Business API operations.');

  // 2. Account State
  const [accountEmail, setAccountEmail] = useState('chethan@example.com');
  const [accountPhone, setAccountPhone] = useState('+971 50 443 2190');

  // 3. Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 4. Session State
  const [sessions, setSessions] = useState([
    {
      id: 'sess_01',
      device: 'Chrome on Windows 11',
      ip: '194.170.211.85 (Dubai, UAE)',
      isCurrent: true,
      lastActive: 'Active Now',
    },
    {
      id: 'sess_02',
      device: 'Safari on iPhone 16 Pro',
      ip: '94.200.12.44 (Abu Dhabi, UAE)',
      isCurrent: false,
      lastActive: '3 hours ago',
    },
  ]);

  // 5. Workspace State
  const [workspaceName, setWorkspaceName] = useState('Acme Dubai Retail');
  const [workspaceSlug, setWorkspaceSlug] = useState('acme-dubai');
  const [workspaceEnv, setWorkspaceEnv] = useState<'production' | 'sandbox'>('production');

  // 6. Company State
  const [companyLegalName, setCompanyLegalName] = useState('Acme Retail Middle East FZ-LLC');
  const [companyVat, setCompanyVat] = useState('AE100293847500003');
  const [companyAddress, setCompanyAddress] = useState('Dubai Internet City, Building 14, Office 402, Dubai, UAE');

  // 8. Notifications State
  const [notifDailyDigest, setNotifDailyDigest] = useState(true);
  const [notifBilling, setNotifBilling] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifUrgentWhatsApp, setNotifUrgentWhatsApp] = useState(true);

  // 9. Team Management State
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'workspace_admin' | 'manager' | 'agent'>('agent');
  const [inviteDept, setInviteDept] = useState('Customer Support');

  // 10. Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [enforceTeam2FA, setEnforceTeam2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // 12. API Settings State
  const [apiRateLimit, setApiRateLimit] = useState('250');
  const [keyRotationDays, setKeyRotationDays] = useState('90');

  // 13. Webhook Settings State
  const [webhookRetryPolicy, setWebhookRetryPolicy] = useState('exponential_backoff');
  const [webhookMaxRetries, setWebhookMaxRetries] = useState('3');

  // 14. Localization State
  const [locale, setLocale] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Dubai');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // 15. Personal Preferences State
  const [defaultLandingPage, setDefaultLandingPage] = useState('/dashboard');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enableDesktopPush, setEnableDesktopPush] = useState(true);

  // Handlers
  const handleSaveSection = (sectionName: string) => {
    showSuccess(`${sectionName} settings saved successfully.`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSuccess('Your password has been changed securely.');
  };

  const handleRevokeOtherSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    showSuccess('All other sessions have been terminated.');
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
      lastActive: 'Invitation pending',
    };

    setTeam([...team, newMember]);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showSuccess(`Invitation email dispatched to ${newMember.email}`);
  };

  const handleToggleMemberStatus = (id: string) => {
    setTeam(
      team.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'active' ? 'suspended' : 'active';
          showSuccess(`User ${m.name} is now ${nextStatus}`);
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setTeam(team.map((m) => (m.id === editingMember.id ? editingMember : m)));
    setEditingMember(null);
    showSuccess(`Permissions for ${editingMember.name} updated.`);
  };

  const SECTIONS_NAV = [
    {
      group: 'Account & Identity',
      items: [
        { id: 'profile', label: '1. My Profile', icon: User },
        { id: 'account', label: '2. Account Information', icon: Mail },
        { id: 'password', label: '3. Change Password', icon: KeyRound },
        { id: 'sessions', label: '4. Session Management', icon: Laptop },
        { id: 'localization', label: '14. Language & Time Zone', icon: Globe },
        { id: 'preferences', label: '15. Personal Preferences', icon: Sliders },
      ],
    },
    {
      group: 'Organization & Workspace',
      items: [
        { id: 'workspace', label: '5. Workspace Settings', icon: Building },
        { id: 'company', label: '6. Company Details', icon: Briefcase },
        { id: 'team', label: '9. Team & User Management', icon: Users },
        { id: 'notifications', label: '8. Notification Preferences', icon: Bell },
      ],
    },
    {
      group: 'WhatsApp & APIs',
      items: [
        { id: 'whatsapp', label: '7. WhatsApp Business Settings', icon: Smartphone },
        { id: 'api', label: '12. API Settings', icon: Code },
        { id: 'webhooks', label: '13. Webhook Settings', icon: Webhook },
      ],
    },
    {
      group: 'Security & Billing',
      items: [
        { id: 'security', label: '10. Security Settings', icon: ShieldCheck },
        { id: 'billing', label: '11. Billing & Subscription', icon: CreditCard },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#202020]">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-[#202020]">
            Enterprise Platform Settings
          </h1>
          <p className="text-xs text-[#202020]/70 mt-1">
            Complete management of your account, workspace, security, WhatsApp integration, and billing.
          </p>
        </div>

        {/* Global Toast */}
        {successToast && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#ecfdf5] border-2 border-[#065f46] text-[#065f46] rounded-[14px] text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4" />
            {successToast}
          </div>
        )}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 15-Section Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-[24px] border-2 border-[#202020] p-4 shadow-sm space-y-4">
            {SECTIONS_NAV.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <span className="text-[10px] font-bold text-[#202020]/50 uppercase tracking-wider px-2 block">
                  {grp.group}
                </span>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as SettingsSection)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[14px] text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#72A4F2] text-white shadow-xs'
                            : 'text-[#202020] hover:bg-[#F9F6F1]'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#72A4F2]'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Settings Section Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: MY PROFILE */}
          {activeSection === 'profile' && (
            <Card title="1. My Profile" subtitle="Your personal administrator identity in the dashboard">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#202020] block mb-1">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Profile')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 2: ACCOUNT INFORMATION */}
          {activeSection === 'account' && (
            <Card title="2. Account Information" subtitle="System credentials and tenancy identifiers">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Primary Email</label>
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={accountPhone}
                      onChange={(e) => setAccountPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px]">
                  <div>
                    <span className="text-[10px] text-[#202020]/60 font-bold block uppercase">Account ID:</span>
                    <span className="font-mono font-bold text-[#202020]">acc_ent_889900</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#202020]/60 font-bold block uppercase">Tenant Domain:</span>
                    <span className="font-mono font-bold text-[#202020]">acme-dubai.rlep.cloud</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#202020]/60 font-bold block uppercase">Member Since:</span>
                    <span className="font-bold text-[#065f46]">12 January 2026</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Account Information')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Account
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 3: CHANGE PASSWORD */}
          {activeSection === 'password' && (
            <Card title="3. Change Password" subtitle="Update your administrative login password">
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
                <div>
                  <label className="font-bold text-[#202020] block mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#202020] block mb-1">New Password (8+ characters) *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#202020] block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" className="gap-1.5 font-bold">
                  <Lock className="h-4 w-4" />
                  Update Password
                </Button>
              </form>
            </Card>
          )}

          {/* SECTION 4: SESSION MANAGEMENT */}
          {activeSection === 'sessions' && (
            <Card title="4. Active Sessions" subtitle="Manage authenticated devices and revoke suspicious logins">
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px]"
                    >
                      <div className="flex items-center gap-3">
                        <Laptop className="h-5 w-5 text-[#72A4F2]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#202020]">{s.device}</span>
                            {s.isCurrent && (
                              <Badge variant="green" size="sm">
                                Current Session
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-[#202020]/60 font-mono">
                            {s.ip} • Last active: {s.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevokeOtherSessions}
                    className="gap-1.5 font-bold text-[#E35A4F] border-[#E35A4F] hover:bg-[#fee2e2]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Revoke All Other Sessions
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 5: WORKSPACE SETTINGS */}
          {activeSection === 'workspace' && (
            <Card title="5. Workspace Settings" subtitle="Tenant instance parameters and environment status">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Workspace Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Workspace URL Slug</label>
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#202020] block mb-1">Deployment Environment</label>
                  <select
                    value={workspaceEnv}
                    onChange={(e: any) => setWorkspaceEnv(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                  >
                    <option value="production">Production (Official Meta Cloud API Live WABA)</option>
                    <option value="sandbox">Sandbox / Staging (Simulated Messaging)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Workspace')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Workspace Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 6: COMPANY DETAILS */}
          {activeSection === 'company' && (
            <Card title="6. Company Details" subtitle="Legal entity information used for invoicing and compliance">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Legal Company Name</label>
                    <input
                      type="text"
                      value={companyLegalName}
                      onChange={(e) => setCompanyLegalName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">VAT / Tax Identification</label>
                    <input
                      type="text"
                      value={companyVat}
                      onChange={(e) => setCompanyVat(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#202020] block mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Company Details')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Company Details
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 7: WHATSAPP BUSINESS SETTINGS */}
          {activeSection === 'whatsapp' && (
            <div className="space-y-6">
              <Card
                title="7. WhatsApp Business Account (WABA)"
                subtitle="Connected Meta Cloud API profile and phone number credentials"
              >
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center text-[#065f46]">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#202020]">Acme Dubai Retail Official</span>
                          <Badge variant="green" size="sm">
                            Quality: HIGH (Green)
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-[#202020]/70 mt-0.5">
                          +971 50 123 4567 • WABA ID: 9918273645001
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsSignupModalOpen(true)}
                      className="font-bold gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add / Connect Number
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white border-2 border-[#202020] rounded-[16px]">
                      <span className="text-[10px] font-bold text-[#202020]/60 block uppercase">Messaging Tier</span>
                      <span className="font-bold text-[#202020]">Tier 3 (100k msgs/day)</span>
                    </div>
                    <div className="p-3 bg-white border-2 border-[#202020] rounded-[16px]">
                      <span className="text-[10px] font-bold text-[#202020]/60 block uppercase">Webhook Status</span>
                      <span className="font-bold text-[#065f46]">Subscribed & Verified</span>
                    </div>
                    <div className="p-3 bg-white border-2 border-[#202020] rounded-[16px]">
                      <span className="text-[10px] font-bold text-[#202020]/60 block uppercase">Display Name</span>
                      <span className="font-bold text-[#065f46]">Meta Verified (Green Check)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION 8: NOTIFICATION PREFERENCES */}
          {activeSection === 'notifications' && (
            <Card title="8. Notification Preferences" subtitle="Alerts dispatched across email, platform, and WhatsApp">
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  {[
                    {
                      id: 'digest',
                      label: 'Daily Campaign & Inbox Performance Digest',
                      desc: 'Summary of delivered messages, read rate, and agent SLA metrics every morning.',
                      checked: notifDailyDigest,
                      setter: setNotifDailyDigest,
                    },
                    {
                      id: 'billing',
                      label: 'Billing Invoices and Usage Alerts',
                      desc: 'Receipts for monthly plan renewal and WhatsApp conversation cost deducts.',
                      checked: notifBilling,
                      setter: setNotifBilling,
                    },
                    {
                      id: 'security',
                      label: 'Security & New Login Alerts',
                      desc: 'Immediate email when a new device or IP logs into your administrator account.',
                      checked: notifSecurity,
                      setter: setNotifSecurity,
                    },
                    {
                      id: 'urgent',
                      label: 'WhatsApp Push on Urgent Escalations',
                      desc: 'Receive WhatsApp alert on mobile when an unresolved VIP chat breaches 15-minute SLA.',
                      checked: notifUrgentWhatsApp,
                      setter: setNotifUrgentWhatsApp,
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-[#202020] block">{item.label}</span>
                        <span className="text-[11px] text-[#202020]/60">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Notification Preferences')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Notifications
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 9: TEAM & USER MANAGEMENT (RBAC) */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-serif font-bold text-[#202020]">
                    9. Team Members & RBAC Roles
                  </h2>
                  <p className="text-xs text-[#202020]/60">
                    Control workspace access with Workspace Admin, Manager, and Agent permissions.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="gap-2 font-bold cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  Invite Team Member
                </Button>
              </div>

              {/* Team Table */}
              <Card title="Workspace Members" subtitle="Role-based permissions and activity status">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                      <tr>
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Active</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EFE7]">
                      {team.map((m) => (
                        <tr key={m.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#72A4F2] border border-[#202020] flex items-center justify-center text-white font-bold text-[10px]">
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#202020] block">{m.name}</span>
                                <span className="text-[11px] text-[#202020]/60">{m.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#202020]">
                            {m.role === 'workspace_owner'
                              ? 'Workspace Owner'
                              : m.role === 'workspace_admin'
                              ? 'Workspace Admin'
                              : m.role === 'manager'
                              ? 'Manager'
                              : 'Agent'}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#202020]">{m.department}</td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                m.status === 'active'
                                  ? 'green'
                                  : m.status === 'invited'
                                  ? 'yellow'
                                  : 'red'
                              }
                              size="sm"
                            >
                              {m.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-[#202020]/70 font-medium">{m.lastActive}</td>
                          <td className="py-3.5 px-4 text-right">
                            {m.role !== 'workspace_owner' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingMember(m)}
                                  className="text-[#72A4F2] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <span className="text-[#202020]/30">|</span>
                                <button
                                  onClick={() => handleToggleMemberStatus(m.id)}
                                  className={`font-bold text-xs cursor-pointer ${
                                    m.status === 'active'
                                      ? 'text-[#E35A4F] hover:underline'
                                      : 'text-[#065f46] hover:underline'
                                  }`}
                                >
                                  {m.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#202020]/40 text-xs font-bold">Owner</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* RBAC Reference Matrix */}
              <Card title="RBAC Permission Reference Matrix" subtitle="Permissions granted to each workspace role">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#202020]">
                    <thead className="bg-[#202020] text-white">
                      <tr>
                        <th className="py-2.5 px-4">Capability</th>
                        <th className="py-2.5 px-3 text-center">Super Admin</th>
                        <th className="py-2.5 px-3 text-center">Workspace Admin</th>
                        <th className="py-2.5 px-3 text-center">Manager</th>
                        <th className="py-2.5 px-3 text-center">Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202020]/10 bg-white">
                      {[
                        { cap: 'Manage Customer Plans & Subscriptions', sa: true, wa: false, mgr: false, ag: false },
                        { cap: 'Reset Customer Account Password', sa: true, wa: false, mgr: false, ag: false },
                        { cap: 'Import Contacts with Verifiable Consent', sa: false, wa: true, mgr: true, ag: false },
                        { cap: 'Export Contacts (All / Filtered / Selected)', sa: false, wa: true, mgr: true, ag: false },
                        { cap: 'Create, Edit & Submit Meta Templates', sa: false, wa: true, mgr: true, ag: false },
                        { cap: 'Launch Bulk Outreach Campaigns', sa: false, wa: true, mgr: true, ag: false },
                        { cap: 'Shared Inbox Reply & Voice Recording', sa: false, wa: true, mgr: true, ag: true },
                        { cap: 'Generate & Revoke Developer API Keys', sa: false, wa: true, mgr: false, ag: false },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F9F6F1]">
                          <td className="py-2.5 px-4 font-bold text-[#202020]">{row.cap}</td>
                          <td className="py-2.5 px-3 text-center">{row.sa ? '✅' : '❌'}</td>
                          <td className="py-2.5 px-3 text-center">{row.wa ? '✅' : '❌'}</td>
                          <td className="py-2.5 px-3 text-center">{row.mgr ? '✅' : '❌'}</td>
                          <td className="py-2.5 px-3 text-center">{row.ag ? '✅' : '❌'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION 10: SECURITY SETTINGS */}
          {activeSection === 'security' && (
            <Card title="10. Security & Authentication Settings" subtitle="Enforce two-factor authentication and session policies">
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  <label className="flex items-start justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202020] block">Two-Factor Authentication (2FA / TOTP)</span>
                      <span className="text-[11px] text-[#202020]/60">Require an authenticator app code on login for your administrator profile.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202020] block">Enforce 2FA for All Team Members</span>
                      <span className="text-[11px] text-[#202020]/60">Require all agents and managers to configure 2FA before accessing customer chats.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enforceTeam2FA}
                      onChange={(e) => setEnforceTeam2FA(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                    />
                  </label>
                </div>

                <div>
                  <label className="font-bold text-[#202020] block mb-1">Session Inactivity Timeout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                  >
                    <option value="15">15 Minutes (High Security)</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour (Standard)</option>
                    <option value="480">8 Hours (Full Shift)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Security')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Security Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 11: BILLING & SUBSCRIPTION */}
          {activeSection === 'billing' && (
            <div className="space-y-6">
              <Card title="11. Billing & Subscription" subtitle="Workspace subscription tier and payment method">
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#202020]">Growth Plus Tier</span>
                        <Badge variant="blue" size="sm">
                          Active Plan
                        </Badge>
                      </div>
                      <p className="text-xs text-[#202020]/70 mt-1">
                        $299 / month • Next renewal on 01 December 2026
                      </p>
                    </div>

                    <Button variant="primary" size="sm" className="font-bold">
                      Upgrade Plan
                    </Button>
                  </div>

                  <div className="p-3.5 bg-white border-2 border-[#202020] rounded-[18px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-[#72A4F2]" />
                      <div>
                        <span className="font-bold text-[#202020] block">Corporate Visa ending in 4242</span>
                        <span className="text-[11px] text-[#202020]/60 font-mono">Expires 09/2028</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs font-bold">
                      Update Card
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION 12: API SETTINGS */}
          {activeSection === 'api' && (
            <Card title="12. API Settings" subtitle="Global developer rate limit policies and token governance">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Default Rate Limit Tier</label>
                    <select
                      value={apiRateLimit}
                      onChange={(e) => setApiRateLimit(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="100">Tier 1: 100 requests / sec</option>
                      <option value="250">Tier 2: 250 requests / sec (Growth)</option>
                      <option value="500">Tier 3: 500 requests / sec (Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#202020] block mb-1">API Key Rotation Reminder</label>
                    <select
                      value={keyRotationDays}
                      onChange={(e) => setKeyRotationDays(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="60">Every 60 Days</option>
                      <option value="90">Every 90 Days (Recommended)</option>
                      <option value="180">Every 180 Days</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('API')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save API Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 13: WEBHOOK SETTINGS */}
          {activeSection === 'webhooks' && (
            <Card title="13. Webhook Settings" subtitle="Outbound delivery retry rules and failure notification threshold">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Retry Dispatch Policy</label>
                    <select
                      value={webhookRetryPolicy}
                      onChange={(e) => setWebhookRetryPolicy(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="exponential_backoff">Exponential Backoff (10s, 30s, 90s)</option>
                      <option value="immediate">Immediate Retry</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Max Retry Attempts</label>
                    <select
                      value={webhookMaxRetries}
                      onChange={(e) => setWebhookMaxRetries(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="3">3 Attempts (Standard)</option>
                      <option value="5">5 Attempts</option>
                      <option value="1">1 Attempt (No Retry)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Webhook Settings')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Webhook Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 14: LANGUAGE AND TIME ZONE */}
          {activeSection === 'localization' && (
            <Card title="14. Language & Time Zone" subtitle="Localization parameters for reporting and timestamp display">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Platform Language</label>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español (Spanish)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Time Zone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                      <option value="UTC">UTC (Universal Coordinated)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New York (EST/EDT)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Date Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Language & Time Zone')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Localization
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 15: PERSONAL PREFERENCES */}
          {activeSection === 'preferences' && (
            <Card title="15. Personal Preferences" subtitle="Custom UI experience and notifications for your account">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#202020] block mb-1">Default Landing Page</label>
                  <select
                    value={defaultLandingPage}
                    onChange={(e) => setDefaultLandingPage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                  >
                    <option value="/dashboard">Overview Dashboard (/dashboard)</option>
                    <option value="/inbox">Shared Team Inbox (/inbox)</option>
                    <option value="/campaigns">Bulk Campaigns (/campaigns)</option>
                    <option value="/contacts">Contacts & Audiences (/contacts)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202020] block">Audio Alerts on Incoming WhatsApp Messages</span>
                      <span className="text-[11px] text-[#202020]/60">Play soft chime sound when a customer message arrives in your assigned queue.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableSoundAlerts}
                      onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202020] block">Desktop Browser Push Notifications</span>
                      <span className="text-[11px] text-[#202020]/60">Display browser notification banner even when the dashboard tab is in the background.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableDesktopPush}
                      onChange={(e) => setEnableDesktopPush(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSection('Personal Preferences')}
                    className="gap-1.5 font-bold"
                  >
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* MODAL 1: INVITE TEAM MEMBER */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Invite Team Member
                </h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black cursor-pointer"
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
                  placeholder="e.g. Maryam Al-Sabah"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="maryam@acmeretail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Assign RBAC Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                >
                  <option value="workspace_admin">Workspace Admin (Full Workspace Access)</option>
                  <option value="manager">Manager (Campaigns, Templates & Inbox)</option>
                  <option value="agent">Agent (Shared Inbox & Customer Support)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Department *</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Sales Desk">Sales Desk</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical Operations">Technical Operations</option>
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
                <Button type="submit" variant="primary" size="sm" className="font-bold">
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
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Edit Member Permissions
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-lg font-black text-[#202020]/60 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020]/60 block mb-1">Member Name</label>
                <input
                  type="text"
                  disabled
                  value={editingMember.name}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020]/30 rounded-[16px] text-[#202020]/60 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Role</label>
                <select
                  value={editingMember.role}
                  onChange={(e: any) =>
                    setEditingMember({ ...editingMember, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                >
                  <option value="workspace_admin">Workspace Admin</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Agent</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Department</label>
                <select
                  value={editingMember.department}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, department: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] focus:outline-none font-bold"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Sales Desk">Sales Desk</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical Operations">Technical Operations</option>
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
                <Button type="submit" variant="primary" size="sm" className="font-bold">
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
          setIsSignupModalOpen(false);
          showSuccess('Meta WhatsApp Business account connected successfully.');
        }}
      />
    </div>
  );
}
