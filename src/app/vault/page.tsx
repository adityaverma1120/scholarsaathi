'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentCategory,
  DocumentMetadata,
  PROCESSING_STATE_DESCRIPTIONS,
} from '@/lib/vault/schema';
import { runDocumentChecks } from '@/lib/vault/checker';
import {
  loadAllDocuments,
  saveDocument,
  updateExtractedField,
  deleteDocument,
  clearAllDocuments,
  exportVaultSummary,
} from '@/lib/vault/storage';
import {
  FolderLock,
  Upload,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Download,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Edit3,
  Check,
} from 'lucide-react';

const VAULT_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Document Vault & Readiness Checker', hi: 'दस्तावेज़ कोष एवं तैयारी परीक्षक' },
  subtitle: {
    en: 'Organise your scholarship documents, run automated readiness checks, and prepare for error-free applications.',
    hi: 'छात्रवृत्ति दस्तावेज़ व्यवस्थित करें, स्वचालित तैयारी जाँचें चलाएं और त्रुटिहीन आवेदन हेतु तैयार हों।',
  },
  privacyBadge: {
    en: 'Private On-Device Storage: Files stay in your browser and are never uploaded to public databases.',
    hi: 'निजी ऑन-डिवाइस संग्रहण: फ़ाइलें केवल आपके ब्राउज़र में रहती हैं और सार्वजनिक डेटाबेस पर कभी नहीं भेजी जातीं।',
  },
  disclaimer: {
    en: 'Automated checks evaluate technical readiness (format, size limits, and required fields). Official authenticity can only be verified by your institution and portal authorities.',
    hi: 'स्वचालित जाँचें केवल तकनीकी तैयारी (प्रारूप, आकार सीमा और आवश्यक फ़ील्ड) का मूल्यांकन करती हैं। आधिकारिक प्रामाणिकता केवल आपका संस्थान और पोर्टल अधिकारी ही सत्यापित कर सकते हैं।',
  },
  uploadHeading: { en: 'Add Document to Vault', hi: 'कोष में दस्तावेज़ जोड़ें' },
  selectCategory: { en: 'Select Document Category', hi: 'दस्तावेज़ श्रेणी चुनें' },
  chooseFile: { en: 'Choose File (PDF, JPG, PNG up to 5 MB)', hi: 'फ़ाइल चुनें (पीडीएफ, जेपीजी, पीएनजी अधिकतम 5 एमबी)' },
  uploading: { en: 'Running automated readiness checks...', hi: 'स्वचालित तैयारी जाँचें चल रही हैं...' },
  myDocuments: { en: 'My Vault Documents', hi: 'मेरे कोष दस्तावेज़' },
  noDocuments: { en: 'No documents in vault yet. Add your first document above.', hi: 'कोष में अभी कोई दस्तावेज़ नहीं है। ऊपर पहला दस्तावेज़ जोड़ें।' },
  checksHeading: { en: 'Automated Readiness Checks', hi: 'स्वचालित तैयारी जाँच परिणाम' },
  extractedHeading: { en: 'Extracted Details (Review & Confirm)', hi: 'निकाले गए विवरण (समीक्षा एवं पुष्टि)' },
  confirmValue: { en: 'Confirm', hi: 'पुष्टि करें' },
  confirmed: { en: 'Confirmed', hi: 'पुष्ट' },
  deleteDoc: { en: 'Delete', hi: 'हटाएँ' },
  deleteConfirm: { en: 'Are you sure you want to delete this document from your vault?', hi: 'क्या आप वाकई इस दस्तावेज़ को अपने कोष से हटाना चाहते हैं?' },
  clearAll: { en: 'Clear Entire Vault', hi: 'पूरा कोष साफ़ करें' },
  clearAllConfirm: { en: 'Delete all documents from this device? This cannot be undone.', hi: 'इस डिवाइस से सभी दस्तावेज़ हटाएँ? यह पूर्ववत नहीं किया जा सकता।' },
  exportReport: { en: 'Export Vault Summary (JSON)', hi: 'कोष सारांश निर्यात करें (JSON)' },
};

export default function DocumentVaultPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const vl = (key: string) => VAULT_LABELS[key]?.[lang] || VAULT_LABELS[key]?.en || key;

  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('class_10_marksheet');
  const [processing, setProcessing] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [fieldEdits, setFieldEdits] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDocs = useCallback(async () => {
    const list = await loadAllDocuments();
    setDocuments(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const toggleExpand = (id: string) => {
    setExpandedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Read array buffer to check file signature
      const arrayBuffer = await file.arrayBuffer();
      const rawBytes = new Uint8Array(arrayBuffer);

      // Run automated readiness checks
      const analysis = runDocumentChecks(
        selectedCategory,
        file.name,
        file.size,
        file.type,
        rawBytes
      );

      const now = new Date().toISOString();
      const newDoc: DocumentMetadata = {
        id: crypto.randomUUID(),
        category: selectedCategory,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        checksum: `chk_${Date.now()}_${file.size}`,
        pageCount: 1,
        processingState: analysis.processingState,
        uploadedAt: now,
        updatedAt: now,
        readabilityScore: analysis.readabilityScore,
        extractedFields: analysis.extractedFields,
        checks: analysis.checks,
      };

      const saved = await saveDocument(newDoc);
      if (saved) {
        await loadDocs();
        setExpandedDocs(prev => ({ ...prev, [newDoc.id]: true }));
        showToast(lang === 'hi' ? 'दस्तावेज़ सफलतापूर्वक जाँचा और सहेजा गया!' : 'Document checked and saved to vault!');
      } else {
        showToast('Error saving document to local database.');
      }
    } catch {
      showToast('Error analyzing document file.');
    } finally {
      setProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleFieldChange = (fieldId: string, val: string) => {
    setFieldEdits(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleConfirmField = async (docId: string, fieldId: string, originalVal: string) => {
    const valueToConfirm = fieldEdits[fieldId] !== undefined ? fieldEdits[fieldId] : originalVal;
    const ok = await updateExtractedField(docId, fieldId, valueToConfirm);
    if (ok) {
      await loadDocs();
      showToast(lang === 'hi' ? 'फ़ील्ड की पुष्टि हो गई!' : 'Field confirmed!');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm(vl('deleteConfirm'))) return;
    await deleteDocument(id);
    await loadDocs();
    showToast(lang === 'hi' ? 'दस्तावेज़ हटा दिया गया।' : 'Document removed.');
  };

  const handleClearAll = async () => {
    if (!confirm(vl('clearAllConfirm'))) return;
    await clearAllDocuments();
    await loadDocs();
    showToast(lang === 'hi' ? 'कोष साफ़ कर दिया गया।' : 'Vault cleared.');
  };

  const handleExport = async () => {
    const json = await exportVaultSummary();
    if (!json) {
      showToast(lang === 'hi' ? 'कोई दस्तावेज़ उपलब्ध नहीं है।' : 'No documents to export.');
      return;
    }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarsaathi-vault-readiness.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderResultBadge = (res: string) => {
    switch (res) {
      case 'pass':
        return (
          <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            PASS
          </span>
        );
      case 'warning':
        return (
          <span className="badge badge-sm bg-amber-100 text-amber-800 border-amber-300 gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            WARNING
          </span>
        );
      case 'fail':
        return (
          <span className="badge badge-sm bg-red-100 text-red-800 border-red-300 gap-1 font-bold">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            FAIL
          </span>
        );
      default:
        return (
          <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 gap-1 font-semibold">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2 max-w-2xl mx-auto w-full">
      {/* Header */}
      <section className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <FolderLock className="w-4 h-4 text-teal-700" aria-hidden="true" />
          <span>ScholarSaathi Vault</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
          {vl('title')}
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {vl('subtitle')}
        </p>
      </section>

      {/* Safety & Non-Affiliation Boundary Alert */}
      <aside
        aria-label="Verification boundary notice"
        className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm shadow-xs"
      >
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Official Authenticity Notice (Rule P2)</p>
          <p className="text-amber-800 leading-relaxed">
            {vl('disclaimer')}
          </p>
        </div>
      </aside>

      {/* Privacy Box */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-center gap-2.5">
        <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>{vl('privacyBadge')}</span>
      </div>

      {/* UPLOAD SECTION */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#003366]" aria-hidden="true" />
          {vl('uploadHeading')}
        </h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="vault-category-select" className="block text-xs font-semibold text-slate-700 mb-1">
              {vl('selectCategory')}
            </label>
            <select
              id="vault-category-select"
              className="select select-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as DocumentCategory)}
              disabled={processing}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {DOCUMENT_CATEGORY_LABELS[cat][lang]} (Max {(DOCUMENT_CATEGORY_LABELS[cat].maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-5 text-center bg-teal-50/30 transition-colors">
            <input
              type="file"
              id="vault-file-input"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              disabled={processing}
            />
            <label
              htmlFor="vault-file-input"
              className="btn bg-[#003366] hover:bg-[#002244] text-white min-h-[48px] px-6 gap-2 cursor-pointer shadow-xs"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  {vl('uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  {vl('chooseFile')}
                </>
              )}
            </label>
            <p className="text-xs text-slate-500 mt-2">
              Supports PDF, JPEG, PNG, WebP • Verified on-device against NSP guidelines
            </p>
          </div>
        </div>
      </section>

      {/* MY DOCUMENTS LIST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-teal-700" aria-hidden="true" />
            {vl('myDocuments')} ({documents.length})
          </h2>
          {documents.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-xs btn-outline border-slate-300 text-slate-700 min-h-[32px]"
                onClick={handleExport}
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Export JSON
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost text-red-600 min-h-[32px]"
                onClick={handleClearAll}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner text-[#003366]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="card bg-white border border-slate-200 p-8 text-center text-slate-500 rounded-2xl shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm">{vl('noDocuments')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map(doc => {
              const isExpanded = expandedDocs[doc.id] ?? false;
              const passedCount = doc.checks.filter(c => c.result === 'pass').length;
              const warningCount = doc.checks.filter(c => c.result === 'warning').length;
              const failCount = doc.checks.filter(c => c.result === 'fail').length;

              return (
                <div
                  key={doc.id}
                  className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm sm:text-base">
                          {DOCUMENT_CATEGORY_LABELS[doc.category]?.[lang] || doc.category}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-0.5">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {failCount > 0 ? (
                        <span className="badge badge-sm bg-red-100 text-red-800 border-red-300 font-bold">
                          {failCount} Issue{failCount > 1 ? 's' : ''}
                        </span>
                      ) : warningCount > 0 ? (
                        <span className="badge badge-sm bg-amber-100 text-amber-800 border-amber-300 font-bold">
                          {warningCount} Warning{warningCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                          Ready ({passedCount} Passed)
                        </span>
                      )}

                      <button
                        type="button"
                        className="btn btn-sm btn-ghost text-slate-500 hover:text-slate-900 min-h-[44px] min-w-[44px]"
                        onClick={() => toggleExpand(doc.id)}
                        aria-expanded={isExpanded}
                        aria-label="Toggle details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Processing State Explanation */}
                      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between border border-slate-200">
                        <div>
                          <span className="font-semibold text-slate-900">Status: </span>
                          <span>{PROCESSING_STATE_DESCRIPTIONS[doc.processingState]?.[lang] || doc.processingState}</span>
                        </div>
                        {doc.readabilityScore !== undefined && (
                          <span className="badge badge-sm bg-slate-200 text-slate-800 font-semibold border-0">
                            Readability: {doc.readabilityScore}/100
                          </span>
                        )}
                      </div>

                      {/* Automated Checks */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                          {vl('checksHeading')}
                        </h3>
                        <div className="space-y-2">
                          {doc.checks.map((check, idx) => (
                            <div
                              key={idx}
                              className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5 text-xs shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{check.name}</span>
                                {renderResultBadge(check.result)}
                              </div>
                              <p className="text-slate-600 leading-relaxed">{check.explanation}</p>
                              {check.ruleReference && (
                                <p className="text-slate-400 italic text-[11px]">
                                  Rule: {check.ruleReference}
                                </p>
                              )}
                              {check.suggestedAction && (
                                <p className="text-teal-800 bg-teal-50/70 p-2 rounded-lg font-medium text-[11px]">
                                  Action: {check.suggestedAction}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Extracted Fields for Review */}
                      {doc.extractedFields.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                            {vl('extractedHeading')}
                          </h3>
                          <div className="space-y-2">
                            {doc.extractedFields.map(field => {
                              const currentVal = fieldEdits[field.id] !== undefined ? fieldEdits[field.id] : (field.userConfirmedValue || field.originalValue);
                              const isConfirmed = !!field.userConfirmedValue;

                              return (
                                <div
                                  key={field.id}
                                  className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-700">{field.label}</span>
                                    {isConfirmed ? (
                                      <span className="badge badge-xs bg-emerald-100 text-emerald-800 border-0 flex items-center gap-1 font-bold">
                                        <Check className="w-3 h-3" aria-hidden="true" />
                                        {vl('confirmed')}
                                      </span>
                                    ) : (
                                      <span className="badge badge-xs bg-amber-100 text-amber-800 border-0 font-medium">
                                        Needs Review
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      className="input input-bordered input-sm w-full min-h-[44px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                      value={currentVal}
                                      placeholder={`Enter or correct ${field.label.toLowerCase()}`}
                                      onChange={e => handleFieldChange(field.id, e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white min-h-[44px] px-3 shrink-0"
                                      onClick={() => handleConfirmField(doc.id, field.id, field.originalValue)}
                                    >
                                      <Check className="w-4 h-4" aria-hidden="true" />
                                      {vl('confirmValue')}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline border-red-200 text-red-600 hover:bg-red-50 min-h-[44px] px-3 gap-1.5"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          {vl('deleteDoc')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-center toast-top z-50">
          <div className="alert bg-[#003366] text-white shadow-xl text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-teal-300" aria-hidden="true" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

