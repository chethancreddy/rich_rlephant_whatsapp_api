'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Upload,
  ShieldCheck,
  Tag,
  Search,
  Filter,
  CheckCheck,
  XCircle,
  AlertOctagon,
  Download,
  PlusCircle,
  Check,
  Clock,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  History,
  Info,
  X,
  FileCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CsvImporterModal } from '@/components/contacts/csv-importer-modal';

interface ContactRow {
  id: string;
  name: string;
  phone: string;
  consentCategory: string;
  source: string;
  tags: string[];
  createdAt: string;
}

const INITIAL_CONTACTS: ContactRow[] = [];

interface OptInSourceItem {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  contactsCount: number;
  createdAt: string;
}

const INITIAL_SOURCES: OptInSourceItem[] = [
  {
    id: 'src_checkout_1',
    name: 'Website Checkout Checkbox',
    type: 'checkout_checkbox',
    description: 'Affirmative checkbox on cart checkout page with Privacy Notice.',
    isActive: true,
    contactsCount: 0,
    createdAt: 'Default',
  },
  {
    id: 'src_inbound_2',
    name: 'Customer Support Inbound Request',
    type: 'inbound_whatsapp',
    description: 'Direct inbound customer message requesting support or order updates.',
    isActive: true,
    contactsCount: 0,
    createdAt: 'Default',
  },
];

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'sources' | 'suppression'>('contacts');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateSourceModalOpen, setIsCreateSourceModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Opt-in sources state
  const [sources, setSources] = useState<OptInSourceItem[]>(INITIAL_SOURCES);
  const [contactsList, setContactsList] = useState<ContactRow[]>(INITIAL_CONTACTS);
  const [suppressedContacts, setSuppressedContacts] = useState<any[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState('website_form');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  // Fetch live contacts from Neon Serverless PostgreSQL
  useEffect(() => {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.contacts)) {
          const mapped: ContactRow[] = data.contacts.map((c: any) => ({
            id: c.id,
            name: c.name || 'Anonymous',
            phone: c.phone,
            consentCategory: c.campaignEligibility ? 'Marketing' : 'Transactional',
            source: c.sourceName || c.source || 'Website Form',
            tags: ['Live DB', c.sourceType || 'Opted-In'],
            createdAt: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          }));
          setContactsList(mapped);
        } else {
          setContactsList([]);
        }
      })
      .catch(() => {
        setContactsList([]);
      });
  }, []);

  // Contact filtering
  const filteredContacts = contactsList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTagFilter ? c.tags.includes(selectedTagFilter) : true;
    return matchesSearch && matchesTag;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Execute CSV Export via /api/contacts/export
  const executeExport = async (scope: 'all' | 'filtered' | 'selected') => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/contacts/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          selectedIds: selectedContactIds,
          filterTag: selectedTagFilter,
          searchQuery,
          userRole: 'workspace_admin',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Export failed');
        setIsExporting(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rich_rlephant_contacts_${scope}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch {
      alert('Network error downloading CSV export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle Opt-In Source status
  const handleToggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Create new Opt-In Source
  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    const newSource: OptInSourceItem = {
      id: `src_${Date.now()}`,
      name: newSourceName.trim(),
      type: newSourceType,
      description: newSourceDesc.trim() || 'Custom registered opt-in source with verifiable affirmative consent.',
      isActive: true,
      contactsCount: 0,
      createdAt: 'Just now',
    };

    setSources([newSource, ...sources]);
    setNewSourceName('');
    setNewSourceDesc('');
    setIsCreateSourceModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">
            Contact & Consent Registry
          </h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Maintain opted-in audiences with strict E.164 phone normalisation and audit-proof consent records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="h-4 w-4" />
            Export CSV
            {selectedContactIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#202020] text-white text-[10px] rounded-full">
                {selectedContactIds.length}
              </span>
            )}
          </Button>

          <Button
            variant="primary"
            size="md"
            className="gap-2"
            onClick={() => setIsImporterOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import Contacts with Consent
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#202020] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'contacts'
              ? 'border-[#202020] text-[#202020]'
              : 'border-transparent text-[#202020]/60'
          }`}
        >
          <Users className="h-4 w-4" />
          Active Contacts ({contactsList.length.toLocaleString()})
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'sources'
              ? 'border-[#202020] text-[#202020]'
              : 'border-transparent text-[#202020]/60'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-[#065f46]" />
          Opt-In Sources Registry ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('suppression')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition-colors ${
            activeTab === 'suppression'
              ? 'border-[#202020] text-[#202020]'
              : 'border-transparent text-[#202020]/60'
          }`}
        >
          <AlertOctagon className="h-4 w-4 text-[#E35A4F]" />
          Suppression & Opt-Out Registry ({suppressedContacts.length.toLocaleString()})
        </button>
      </div>

      {/* TAB 1: ACTIVE CONTACTS */}
      {activeTab === 'contacts' && (
        <Card>
          <div className="p-4 border-b-2 border-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9F6F1]">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-[#202020]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone number (E.164), name, or source..."
                className="w-full pl-10 pr-3 py-2 text-xs bg-white border-2 border-[#202020] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="text-xs bg-white border-2 border-[#202020] rounded-[18px] px-3 py-1.5 font-bold focus:outline-none"
              >
                <option value="">All Tags</option>
                <option value="VIP">VIP</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Gold">Gold</option>
              </select>

              {selectedContactIds.length > 0 && (
                <span className="text-[11px] font-bold text-[#065f46] bg-[#ecfdf5] px-2.5 py-1 rounded-[14px] border border-[#6ee7b7]">
                  {selectedContactIds.length} selected
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedContactIds.length > 0 &&
                        selectedContactIds.length === filteredContacts.length
                      }
                      onChange={handleSelectAll}
                      className="rounded-xs border-[#202020] accent-[#202020]"
                    />
                  </th>
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Phone (E.164)</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4">Opt-In Source</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE7]">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#BED0F7]/30 border-2 border-[#202020] flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-[#202020]" />
                        </div>
                        <h3 className="text-base font-bold text-[#202020] mb-1">No Contacts Added Yet</h3>
                        <p className="text-xs text-[#202020]/70 mb-5 text-center leading-relaxed">
                          {searchQuery || selectedTagFilter
                            ? 'No contacts match your active search filters.'
                            : 'Import your opted-in customer phone numbers via CSV or capture consent through verified opt-in sources.'}
                        </p>
                        {!searchQuery && !selectedTagFilter && (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setIsImporterOpen(true)}
                              className="gap-2 font-bold"
                            >
                              <Upload className="w-4 h-4" />
                              Import Contacts with Consent
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('sources')}
                              className="gap-2 font-bold"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Manage Opt-In Sources
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#F9F6F1]/50 transition-colors ${
                        selectedContactIds.includes(c.id) ? 'bg-[#BED0F7]/25' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(c.id)}
                          onChange={() => handleToggleSelectOne(c.id)}
                          className="rounded-xs border-[#202020] accent-[#202020]"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#202020]">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#202020]">{c.phone}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="green" size="sm" className="gap-1">
                          <CheckCheck className="h-3 w-3" />
                          Granted ({c.consentCategory})
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#202020]/80 font-medium">{c.source}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold bg-[#F4EFE7] border border-[#202020] text-[#202020] px-2 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#202020]/60 font-medium">{c.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: OPT-IN SOURCES REGISTRY */}
      {activeTab === 'sources' && (
        <Card
          title="Verifiable Consent & Opt-In Sources"
          subtitle="Meta requires documented proof of affirmative opt-in for all marketing campaign recipients"
        >
          <div className="p-4 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
            <p className="text-xs text-[#202020]/70 max-w-xl">
              Each opt-in source represents an audit-proof touchpoint (website checkbox, POS counter QR code, etc.) where recipient consent was captured.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsCreateSourceModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              New Opt-In Source
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                <tr>
                  <th className="py-3 px-4">Source Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description & Notice Version</th>
                  <th className="py-3 px-4">Opted-In Contacts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE7]">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F9F6F1]/50">
                    <td className="py-3.5 px-4 font-bold text-[#202020]">{s.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold bg-[#F4EFE7] px-2 py-0.5 rounded-full border border-[#202020]">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#202020]/70 max-w-xs">{s.description}</td>
                    <td className="py-3.5 px-4 font-bold text-[#065f46]">
                      {s.contactsCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.isActive ? (
                        <Badge variant="green" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="charcoal" size="sm">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleSource(s.id)}
                        className="text-xs font-bold text-[#202020] hover:text-[#72A4F2] underline"
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: SUPPRESSION REGISTRY */}
      {activeTab === 'suppression' && (
        <Card title="Suppression & Do-Not-Contact Registry" subtitle="Instantly blocks all outbound campaign jobs">
          <div className="overflow-x-auto">
            {suppressedContacts.length === 0 ? (
              <div className="p-12 text-center">
                <AlertOctagon className="h-8 w-8 text-[#202020]/30 mx-auto mb-2" />
                <h4 className="font-serif font-bold text-sm text-[#202020]">No Suppressed Contacts</h4>
                <p className="text-xs text-[#202020]/60 mt-1 max-w-sm mx-auto">
                  Contacts who text STOP or opt out will automatically appear here to prevent future campaign messaging.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                  <tr>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Date Suppressed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE7]">
                  {suppressedContacts.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-[#F9F6F1]/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202020]">{sc.phone}</td>
                      <td className="py-3.5 px-4 font-medium text-[#202020]">{sc.channel || 'WhatsApp'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="red" size="sm">{sc.reason || 'Opt-Out'}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#202020]/70 font-medium">{sc.source || 'Inbound Keyword'}</td>
                      <td className="py-3.5 px-4 text-[#202020]/50 font-medium">{sc.createdAt || 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* MODAL 1: EXPORT CSV CONTROLS */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#065f46]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">Export Contacts Dataset</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#202020]/70 mt-3">
              Export verified contact records formatted with strict E.164 phone numbers and associated consent audit trails.
            </p>

            <div className="mt-4 space-y-2.5">
              {/* Option 1: Export Selected */}
              <button
                disabled={selectedContactIds.length === 0 || isExporting}
                onClick={() => executeExport('selected')}
                className={`w-full text-left p-3.5 rounded-[18px] border-2 border-[#202020] flex items-center justify-between transition-all ${
                  selectedContactIds.length > 0
                    ? 'bg-[#F9F6F1] hover:bg-[#BED0F7]/30 cursor-pointer'
                    : 'bg-[#F4EFE7]/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-[#202020] block">
                    Export Selected Contacts ({selectedContactIds.length})
                  </span>
                  <span className="text-[11px] text-[#202020]/60">
                    Only download the contacts currently checked in the table
                  </span>
                </div>
                <Download className="h-4 w-4 text-[#202020]" />
              </button>

              {/* Option 2: Export Filtered */}
              <button
                disabled={isExporting}
                onClick={() => executeExport('filtered')}
                className="w-full text-left p-3.5 rounded-[18px] border-2 border-[#202020] bg-[#F9F6F1] hover:bg-[#BED0F7]/30 flex items-center justify-between transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-[#202020] block">
                    Export Filtered Contacts ({filteredContacts.length})
                  </span>
                  <span className="text-[11px] text-[#202020]/60">
                    Matches current search ({searchQuery ? `"${searchQuery}"` : 'None'}) & tag filter
                  </span>
                </div>
                <Download className="h-4 w-4 text-[#202020]" />
              </button>

              {/* Option 3: Export All */}
              <button
                disabled={isExporting}
                onClick={() => executeExport('all')}
                className="w-full text-left p-3.5 rounded-[18px] border-2 border-[#202020] bg-[#BED0F7]/20 hover:bg-[#BED0F7]/40 flex items-center justify-between transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-[#202020] block">
                    Export All Workspace Contacts ({contactsList.length.toLocaleString()})
                  </span>
                  <span className="text-[11px] text-[#202020]/60">
                    Full dataset with complete opt-in metadata
                  </span>
                </div>
                <Download className="h-4 w-4 text-[#202020]" />
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE OPT-IN SOURCE */}
      {isCreateSourceModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#065f46]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">Register Opt-In Source</h3>
              </div>
              <button
                onClick={() => setIsCreateSourceModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Loyalty Sign-Up Form"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Source Collection Type *</label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="website_form">Website Contact/Lead Form</option>
                  <option value="checkout_checkbox">E-Commerce Checkout Checkbox</option>
                  <option value="qr_code">In-Store / Event QR Code</option>
                  <option value="pos">Point of Sale (POS) Terminal</option>
                  <option value="inbound_whatsapp">Inbound Customer WhatsApp Request</option>
                  <option value="manual">Signed Paper / Contract Consent</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Description & Notice Version</label>
                <textarea
                  rows={2}
                  placeholder="e.g. v2.0 Privacy Policy with express consent clause displayed at cashier desk"
                  value={newSourceDesc}
                  onChange={(e) => setNewSourceDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateSourceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Register Source
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Importer Modal */}
      <CsvImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
