'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  UploadCloud,
  Check,
  X,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CsvImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImporterModal: React.FC<CsvImporterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedRowCount, setDetectedRowCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [csvText, setCsvText] = useState(
`phone,name,email,tags
+971501234567,Tariq Mansoor,tariq@example.com,VIP;Dubai
0529821102,Fatima Al Zaabi,fatima@example.com,Retail
+919876543210,Rahul Sharma,rahul@example.com,Wholesale
invalid_phone,Bad Entry,bad@example.com,Test`
  );

  const [consentGranted, setConsentGranted] = useState(true);
  const [consentSource, setConsentSource] = useState('Website Checkout Checkbox');
  const [isUploading, setIsUploading] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileRead = (file: File) => {
    setFileError(null);

    // Validate extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv' && extension !== 'txt') {
      setFileError('Invalid file format. Please upload a .csv or .txt spreadsheet file.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim()) {
        setCsvText(text);
        const rows = text.trim().split('\n').filter((line) => line.trim().length > 0);
        setDetectedRowCount(Math.max(0, rows.length - 1)); // Exclude header
        setSelectedFile(file);
      } else {
        setFileError('Uploaded file is empty.');
      }
    };

    reader.onerror = () => {
      setFileError('Failed to read file from disk.');
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setDetectedRowCount(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSampleTemplate = () => {
    const sample = `phone,name,email,tags\n+971501234567,Tariq Mansoor,tariq@example.com,VIP;Dubai\n0529821102,Fatima Al Zaabi,fatima@example.com,Retail\n+919876543210,Rahul Sharma,rahul@example.com,Enterprise\n+14155552671,John Doe,john@example.com,Lead`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rich_rlephant_sample_contacts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImport = async () => {
    if (importMode === 'upload' && !selectedFile) {
      alert('Please select or upload a CSV file before importing.');
      return;
    }

    if (!csvText.trim()) {
      alert('CSV content is empty. Please upload a file or paste CSV rows.');
      return;
    }

    setIsUploading(true);

    try {
      // Parse CSV rows into objects
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const phoneIndex = headers.indexOf('phone');
      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');

      if (phoneIndex === -1) {
        alert('CSV header must contain a "phone" column (e.g. phone,name,email,tags)');
        setIsUploading(false);
        return;
      }

      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length > phoneIndex && parts[phoneIndex]) {
          contacts.push({
            phone: parts[phoneIndex],
            name: nameIndex !== -1 ? parts[nameIndex] : '',
            email: emailIndex !== -1 ? parts[emailIndex] : '',
            consentGiven: consentGranted,
            consentPurpose: 'marketing',
            consentSource: consentSource,
            noticeVersion: 'v1.0-checkout',
          });
        }
      }

      if (contacts.length === 0) {
        alert('No contact records found in CSV rows.');
        setIsUploading(false);
        return;
      }

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, defaultCountryCode: 'AE' }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportSummary(data.summary);
      } else {
        alert(data.error || 'Import failed');
      }
    } catch {
      alert('Network error parsing CSV contacts');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-xl w-full overflow-hidden border-2 border-[#202020] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-[#72A4F2] border-1.5 border-[#202020] flex items-center justify-center text-[#202020]">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#202020]">Bulk Contact & Consent Importer</h3>
              <p className="text-[11px] text-[#202020]/60">Upload CSV file or paste rows with audit proof of opt-in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#202020]/60 hover:text-black font-black text-xl p-1 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 text-xs text-[#202020] space-y-4">
          {!importSummary ? (
            <>
              {/* Tab Switcher: Upload File vs Paste Text */}
              <div className="flex items-center justify-between border-b-2 border-[#202020] pb-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('upload')}
                    className={`px-3 py-1.5 rounded-[16px] text-xs font-bold transition-all ${
                      importMode === 'upload'
                        ? 'bg-[#202020] text-white shadow-xs'
                        : 'bg-[#F4EFE7] text-[#202020] hover:bg-[#BED0F7]/40'
                    }`}
                  >
                    📁 Upload CSV File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('paste')}
                    className={`px-3 py-1.5 rounded-[16px] text-xs font-bold transition-all ${
                      importMode === 'paste'
                        ? 'bg-[#202020] text-white shadow-xs'
                        : 'bg-[#F4EFE7] text-[#202020] hover:bg-[#BED0F7]/40'
                    }`}
                  >
                    ✍️ Paste CSV Text
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="text-[11px] font-bold text-[#202020] hover:text-[#72A4F2] flex items-center gap-1 underline"
                  title="Download CSV format template"
                >
                  <Download className="h-3.5 w-3.5" />
                  Sample CSV
                </button>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              {importMode === 'upload' ? (
                /* FILE UPLOAD DROPZONE MODE */
                <div>
                  {!selectedFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#72A4F2] bg-[#BED0F7]/30 scale-101'
                          : 'border-[#202020] bg-[#F9F6F1] hover:bg-[#BED0F7]/20 hover:border-[#72A4F2]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-[18px] bg-[#72A4F2] text-[#202020] border-2 border-[#202020] mx-auto flex items-center justify-center mb-3">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold font-serif text-sm text-[#202020]">
                        Click to browse or drag & drop CSV file
                      </h4>
                      <p className="text-[11px] text-[#202020]/60 mt-1 max-w-sm mx-auto">
                        Supports <strong>.csv</strong> and <strong>.txt</strong> files up to 10MB. Columns: <code>phone, name, email, tags</code>
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#202020] border-2 border-[#202020] rounded-[18px] font-bold text-xs shadow-xs hover:bg-[#F4EFE7]">
                          <Upload className="h-3.5 w-3.5" />
                          Choose File
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* SELECTED FILE ACTIVE CARD */
                    <div className="p-4 bg-[#ecfdf5] border-2 border-[#202020] rounded-[22px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-[#065f46] text-white flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#065f46]">{selectedFile.name}</span>
                            <Badge variant="green" size="sm">Ready to Import</Badge>
                          </div>
                          <p className="text-[11px] text-[#065f46]/80 mt-0.5 font-medium">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {detectedRowCount?.toLocaleString()} contacts detected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white text-[#202020] border border-[#202020] rounded-[12px] hover:bg-[#F4EFE7]"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelectedFile}
                          className="p-1.5 text-[#991b1b] hover:bg-[#fee2e2] rounded-full transition-colors"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {fileError && (
                    <div className="mt-2 p-2.5 bg-[#fee2e2] border-2 border-[#E35A4F] rounded-[16px] text-xs text-[#991b1b] font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* PASTE CSV TEXTAREA MODE */
                <div>
                  <label className="font-bold text-[#202020] block mb-1">
                    Paste raw CSV rows (header required):
                  </label>
                  <textarea
                    rows={5}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full p-3 font-mono text-[11px] border-2 border-[#202020] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] bg-[#F9F6F1]"
                  ></textarea>
                </div>
              )}

              {/* Mandatory Consent Declaration */}
              <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] space-y-3">
                <span className="font-bold font-serif text-xs block text-[#202020] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#065f46]" />
                  WhatsApp Opt-In Consent Verification
                </span>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent_check"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    className="mt-0.5 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2] h-4 w-4"
                  />
                  <label htmlFor="consent_check" className="text-[11px] leading-relaxed text-[#202020]/80 font-medium">
                    I verify that every recipient in this dataset has given express, verifiable opt-in consent to receive WhatsApp messages in compliance with Meta's Business Messaging Policy.
                  </label>
                </div>

                {consentGranted && (
                  <div>
                    <label className="text-[10px] font-bold text-[#202020]/60 uppercase block mb-1">
                      Opt-In Collection Method / Source:
                    </label>
                    <select
                      value={consentSource}
                      onChange={(e) => setConsentSource(e.target.value)}
                      className="w-full p-2 text-xs border-2 border-[#202020] rounded-[14px] bg-white font-medium"
                    >
                      <option>Website Checkout Checkbox</option>
                      <option>In-Store Digital Form / QR Code</option>
                      <option>Customer Support Inbound Request</option>
                      <option>Lead Generation Form</option>
                      <option>Paper Form / In-Person Registration</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleProcessImport}
                  isLoading={isUploading}
                  disabled={isUploading || (importMode === 'upload' && !selectedFile)}
                  className="gap-2 font-bold"
                >
                  <Upload className="h-4 w-4" />
                  Validate & Import Contacts
                </Button>
              </div>
            </>
          ) : (
            /* IMPORT FINISHED SUMMARY */
            <div className="py-2 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center mx-auto text-[#065f46]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold font-serif text-base text-[#202020]">Import Finished!</h4>
                <p className="text-xs text-[#202020]/70 mt-0.5">
                  Contacts processed and normalized to E.164 with consent audit records.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] text-left">
                <div>
                  <span className="text-[10px] text-[#202020]/60 uppercase font-bold block">Imported Contacts:</span>
                  <span className="font-black font-serif text-lg text-[#202020]">{importSummary.imported}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#065f46] uppercase font-bold block">Campaign Eligible:</span>
                  <span className="font-black font-serif text-lg text-[#065f46]">{importSummary.campaign_eligible}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#854d0e] uppercase font-bold block">Missing Consent:</span>
                  <span className="font-black font-serif text-lg text-[#854d0e]">{importSummary.ineligible_missing_consent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#991b1b] uppercase font-bold block">Invalid Phone:</span>
                  <span className="font-black font-serif text-lg text-[#991b1b]">{importSummary.invalid_phone_formats}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
