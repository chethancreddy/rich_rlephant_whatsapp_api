'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  FileText,
  Workflow,
  Code2,
  Settings,
  ShieldCheck,
  Radio,
  ChevronDown,
  Check,
  PlusCircle,
  Building2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/design-tokens';
import { Button } from '@/components/ui/button';

interface WorkspaceItem {
  id: string;
  name: string;
  tier: string;
  phone: string;
  color: string;
}

const INITIAL_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'ws_001',
    name: 'Acme Dubai Retail',
    tier: 'Growth Tier • UAE',
    phone: '+971 50 123 4567',
    color: '#72A4F2',
  },
  {
    id: 'ws_002',
    name: 'Alpha Real Estate Dubai',
    tier: 'Enterprise Tier • UAE',
    phone: '+971 50 111 2233',
    color: '#065f46',
  },
  {
    id: 'ws_003',
    name: 'Beta Luxury Auto Spa',
    tier: 'Growth Tier • UAE',
    phone: '+971 50 444 5566',
    color: '#d97706',
  },
  {
    id: 'ws_004',
    name: 'Gamma Hospitality',
    tier: 'Starter Tier • UAE',
    phone: '+971 50 777 8899',
    color: '#7c3aed',
  },
];

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Shared Inbox', href: '/inbox', icon: MessageSquare, badge: '3' },
  { name: 'Contacts & Consent', href: '/contacts', icon: Users },
  { name: 'Bulk Campaigns', href: '/campaigns', icon: Send },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Automation Flows', href: '/automation', icon: Workflow },
  { name: 'Developer & APIs', href: '/developer', icon: Code2 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Workspace Switcher State
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem>(INITIAL_WORKSPACES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Workspace Form State
  const [newWsName, setNewWsName] = useState('');
  const [newWsIndustry, setNewWsIndustry] = useState('Retail & E-Commerce');
  const [newWsPhone, setNewWsPhone] = useState('+971 50 ');
  const [newWsTier, setNewWsTier] = useState('Growth Tier');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSelectWorkspace = (ws: WorkspaceItem) => {
    setActiveWorkspace(ws);
    setIsDropdownOpen(false);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const colors = ['#72A4F2', '#065f46', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: WorkspaceItem = {
      id: `ws_${Date.now()}`,
      name: newWsName.trim(),
      tier: `${newWsTier} • UAE`,
      phone: newWsPhone.trim() || '+971 50 000 0000',
      color: randomColor,
    };

    setWorkspaces([...workspaces, created]);
    setActiveWorkspace(created);
    setNewWsName('');
    setNewWsPhone('+971 50 ');
    setIsCreateModalOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <aside className="w-64 bg-[#F9F6F1] text-[#202020] flex flex-col shrink-0 border-r-2 border-[#202020] min-h-screen relative">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b-2 border-[#202020] gap-3 bg-white">
        <div className="h-10 w-10 rounded-[14px] bg-[#72A4F2] border-2 border-[#202020] flex items-center justify-center text-[#202020] font-black text-xl font-serif shrink-0">
          R
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-serif font-black text-[#202020] text-sm tracking-tight leading-tight truncate">
            {BRAND_CONFIG.shortName}
          </span>
          <span className="text-[10px] text-[#202020]/70 font-bold uppercase tracking-wider">
            WhatsApp API
          </span>
        </div>
      </div>

      {/* Interactive Workspace Selector Dropdown */}
      <div className="p-4 border-b-2 border-[#D8D0C4] relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-[18px] text-[#202020] border-2 border-[#202020] transition-all font-semibold ${
            isDropdownOpen ? 'bg-[#BED0F7]/40 ring-2 ring-[#72A4F2]' : 'bg-white hover:bg-[#F4EFE7]'
          }`}
          title="Click to switch or create workspaces"
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-2.5 h-2.5 rounded-full border border-[#202020] shrink-0"
              style={{ backgroundColor: activeWorkspace.color }}
            ></span>
            <span className="truncate font-bold text-xs">{activeWorkspace.name}</span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#202020] shrink-0 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Floating Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-4 right-4 top-16 mt-1 bg-white border-2 border-[#202020] rounded-[22px] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 bg-[#F9F6F1] border-b-2 border-[#202020] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60">
                Workspaces ({workspaces.length})
              </span>
              <span className="text-[10px] font-bold text-[#065f46] bg-[#ecfdf5] border border-[#6ee7b7] px-2 py-0.2 rounded-full">
                Multi-Tenant
              </span>
            </div>

            {/* Workspaces List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#F4EFE7] p-1.5">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspace.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws)}
                    className={`w-full text-left p-2.5 rounded-[16px] transition-colors flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#BED0F7]/40 border border-[#202020]'
                        : 'hover:bg-[#F9F6F1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-[#202020] shrink-0"
                        style={{ backgroundColor: ws.color }}
                      ></span>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#202020] block truncate">
                          {ws.name}
                        </span>
                        <span className="text-[10px] text-[#202020]/60 block truncate">
                          {ws.tier}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#202020] shrink-0 font-black ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Footer Actions */}
            <div className="p-2 bg-[#F9F6F1] border-t-2 border-[#202020] space-y-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#202020] hover:bg-white rounded-[14px] transition-colors border border-transparent hover:border-[#202020]"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#72A4F2]" />
                <span>Create New Workspace</span>
              </button>

              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#202020]/70 hover:text-[#202020] hover:bg-white rounded-[14px] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Workspace Settings</span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-[20px] transition-all border-2 ${
                isActive
                  ? 'bg-[#72A4F2] text-[#202020] border-[#202020]'
                  : 'bg-transparent text-[#202020]/80 border-transparent hover:bg-white hover:border-[#D8D0C4] hover:text-[#202020]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-[#202020]" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-[#202020] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Meta Connection Health Footer */}
      <div className="p-4 border-t-2 border-[#202020] bg-white">
        <div className="flex items-center gap-2 text-xs font-bold text-[#202020]">
          <Radio className="h-3.5 w-3.5 text-[#72A4F2]" />
          <span>Meta Cloud API:</span>
          <span className="text-[#065f46] bg-[#ecfdf5] border border-[#6ee7b7] px-2 py-0.5 rounded-full text-[10px]">
            v21.0 Online
          </span>
        </div>
        <p className="text-[10px] text-[#202020]/60 font-medium mt-1.5">
          Sender: {activeWorkspace.phone} (High Quality)
        </p>
      </div>

      {/* MODAL: CREATE NEW WORKSPACE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Create New Workspace
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Workspace / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delta Logistics LLC"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Industry Vertical</label>
                <select
                  value={newWsIndustry}
                  onChange={(e) => setNewWsIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="Real Estate & Property">Real Estate & Property</option>
                  <option value="Hospitality & Dining">Hospitality & Dining</option>
                  <option value="Automotive & Mobility">Automotive & Mobility</option>
                  <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                  <option value="Corporate Services">Corporate Services</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  WhatsApp Business Phone (E.164)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={newWsPhone}
                  onChange={(e) => setNewWsPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">SaaS Plan Tier</label>
                <select
                  value={newWsTier}
                  onChange={(e) => setNewWsTier(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Growth Tier">Growth Tier ($79 / mo)</option>
                  <option value="Enterprise Tier">Enterprise Tier ($249 / mo)</option>
                  <option value="Starter Tier">Starter Tier ($39 / mo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Create Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
