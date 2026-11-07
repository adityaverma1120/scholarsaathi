'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  type CrossDocumentAnalysisReport,
  type FieldComparisonReport,
  COMPARISON_RESULT_LABELS,
} from '@/lib/checker/schema';
import { runCrossDocumentComparison } from '@/lib/checker/engine';
import {
  saveStudentExplanation,
  getAllStudentExplanations,
} from '@/lib/checker/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import { loadProfile } from '@/lib/profile/storage';
import { type DocumentMetadata } from '@/lib/vault/schema';
import { type StudentProfile } from '@/lib/profile/schema';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  FolderLock,
  User,
  RefreshCw,
  MessageSquare,
  Check,
  FileText,
} from 'lucide-react';

const CHECKER_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Cross-Document Consistency Checker', hi: 'दस्तावेज़ सुसंगतता परीक्षक' },
  subtitle: {
    en: 'Compare names, dates of birth, parent names, and certificates across all your documents to prevent portal defects.',
    hi: 'पोर्टल दोषों से बचने के लिए अपने सभी दस्तावेज़ों में नाम, जन्म तिथि और प्रमाण पत्र विवरण की तुलना करें।',
  },
  disclaimer: {
    en: 'Consistency Assistant Notice (Rule P2): This tool identifies formatting and spelling differences before you submit. It is not an official fraud detector or government identity adjudication system.',
    hi: 'सुसंगतता सहायक सूचना (नियम P2): यह उपकरण आवेदन से पूर्व केवल वर्तनी और प्रारूप विसंगतियों की पहचान करता है। यह आधिकारिक पहचान सत्यापन प्रणाली नहीं है।',
  },
  runCheck: { en: 'Run Consistency Check', hi: 'सुसंगतता जाँच चलाएं' },
  reRunCheck: { en: 'Re-run Comparison', hi: 'पुनः तुलना करें' },
  noDocsTitle: { en: 'Add Documents to Start Comparison', hi: 'तुलना शुरू करने हेतु दस्तावेज़ जोड़ें' },
  noDocsDesc: {
    en: 'Upload at least 2 documents in your Document Vault or complete your Student Profile to compare fields.',
    hi: 'फ़ील्ड तुलना हेतु अपने दस्तावेज़ कोष में कम से कम 2 दस्तावेज़ अपलोड करें या प्रोफ़ाइल भरें।',
  },
  goToVault: { en: 'Go to Document Vault', hi: 'दस्तावेज़ कोष पर जाएँ' },
  goToProfile: { en: 'Go to Student Profile', hi: 'छात्र प्रोफ़ाइल पर जाएँ' },
  readyBadge: { en: 'Consistent & Ready', hi: 'सुसंगत एवं तैयार' },
  attentionBadge: { en: 'Attention Recommended', hi: 'समीक्षा आवश्यक' },
  highRiskBadge: { en: 'Mismatches Detected', hi: 'विसंगति पाई गई' },
  explainBtn: { en: 'Explain Discrepancy', hi: 'विसंगति का कारण स्पष्ट करें' },
  editExplanation: { en: 'Edit Explanation', hi: 'स्पष्टीकरण बदलें' },
  saveExplanation: { en: 'Save Explanation', hi: 'स्पष्टीकरण सहेजें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  explanationPlaceholder: {
    en: 'e.g. My marksheet uses middle initial "K" whereas Aadhaar has full name "Kumar".',
    hi: 'उदा. अंकतालिका में मध्य नाम संक्षिप्त "के" है जबकि आधार में पूरा नाम "कुमार" है।',
  },
  studentExplanationNote: {
    en: 'Your explanation is recorded on your device for your reference. Original document evidence is never modified.',
    hi: 'आपका स्पष्टीकरण आपके संदर्भ हेतु केवल आपके डिवाइस पर सहेजा गया है। मूल दस्तावेज़ साक्ष्य कभी नहीं बदले जाते।',
  },
};

export default function CrossDocumentCheckerPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const cl = (key: string) => CHECKER_LABELS[key]?.[lang] || CHECKER_LABELS[key]?.en || key;

  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [report, setReport] = useState<CrossDocumentAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [explanationDraft, setExplanationDraft] = useState('');
  const [savedExplanations, setSavedExplanations] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDataAndRun = useCallback(async () => {
    setLoading(true);
    const [docs, prof, explanations] = await Promise.all([
      loadAllDocuments(),
      loadProfile(),
      getAllStudentExplanations(),
    ]);

    setDocuments(docs);
    setProfile(prof);
    setSavedExplanations(explanations);

    // Run comparison if documents or profile available
    const analysis = runCrossDocumentComparison(docs, prof);

    // Merge saved explanations
    analysis.fieldReports = analysis.fieldReports.map(rep => {
      if (explanations[rep.id]) {
        return {
          ...rep,
          result: 'user_explained',
          studentExplanation: explanations[rep.id],
        };
      }
      return rep;
    });

    setReport(analysis);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDataAndRun();
  }, [loadDataAndRun]);

  const handleRunComparison = async () => {
    setAnalyzing(true);
    await loadDataAndRun();
    setAnalyzing(false);
    showToast(lang === 'hi' ? 'सुसंगतता जाँच पूरी हुई!' : 'Consistency check completed!');
  };

  const handleStartExplanation = (reportItem: FieldComparisonReport) => {
    setActiveEditingId(reportItem.id);
    setExplanationDraft(savedExplanations[reportItem.id] || '');
  };

  const handleSaveExplanation = async (reportItem: FieldComparisonReport) => {
    if (!explanationDraft.trim()) return;

    await saveStudentExplanation(reportItem.id, reportItem.fieldKey, explanationDraft.trim());
    setSavedExplanations(prev => ({ ...prev, [reportItem.id]: explanationDraft.trim() }));

    if (report) {
      setReport({
        ...report,
        fieldReports: report.fieldReports.map(rep => {
          if (rep.id === reportItem.id) {
            return {
              ...rep,
              result: 'user_explained',
              studentExplanation: explanationDraft.trim(),
            };
          }
          return rep;
        }),
      });
    }

    setActiveEditingId(null);
    showToast(lang === 'hi' ? 'स्पष्टीकरण सुरक्षित रूप से सहेजा गया!' : 'Explanation saved successfully!');
  };

  const renderResultBadge = (resultType: string) => {
    const config = COMPARISON_RESULT_LABELS[resultType as keyof typeof COMPARISON_RESULT_LABELS];
    const labelText = config?.[lang] || config?.en || resultType;

    switch (resultType) {
      case 'exact_match':
        return (
          <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {labelText}
          </span>
        );
      case 'likely_match':
        return (
          <span className="badge badge-sm bg-amber-100 text-amber-800 border-amber-300 gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            {labelText}
          </span>
        );
      case 'significant_mismatch':
      case 'possible_mismatch':
        return (
          <span className="badge badge-sm bg-red-100 text-red-800 border-red-300 gap-1 font-bold">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {labelText}
          </span>
        );
      case 'user_explained':
        return (
          <span className="badge badge-sm bg-blue-100 text-blue-800 border-blue-300 gap-1 font-bold">
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            {labelText}
          </span>
        );
      default:
        return (
          <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 gap-1 font-semibold">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {labelText}
          </span>
        );
    }
  };

  const totalSources = documents.length + (profile?.basic?.displayName ? 1 : 0);

  return (
    <div className="flex flex-col gap-6 py-2 max-w-2xl mx-auto w-full">
      {/* Header */}
      <section className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <FileSpreadsheet className="w-4 h-4 text-teal-700" aria-hidden="true" />
          <span>Cross-Document Consistency Audit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
          {cl('title')}
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {cl('subtitle')}
        </p>
      </section>

      {/* Safety & Rule P2 Boundary Alert */}
      <aside
        aria-label="Consistency Boundary Notice"
        className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm shadow-xs"
      >
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Consistency Assistant Scope (Rule P2)</p>
          <p className="text-amber-800 leading-relaxed">
            {cl('disclaimer')}
          </p>
        </div>
      </aside>

      {/* Source Inventory Bar */}
      <div className="card bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <FolderLock className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Vault Docs: <strong>{documents.length}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-4 h-4 text-[#003366]" aria-hidden="true" />
            <span>Profile: <strong>{profile?.basic?.displayName ? 'Active' : 'Empty'}</strong></span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white min-h-[44px] px-4 gap-1.5 shadow-xs"
          onClick={handleRunComparison}
          disabled={analyzing || totalSources < 2}
        >
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} aria-hidden="true" />
          {report && report.totalFieldsCompared > 0 ? cl('reRunCheck') : cl('runCheck')}
        </button>
      </div>

      {/* Empty State when insufficient sources */}
      {totalSources < 2 && (
        <div className="card bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 text-base">{cl('noDocsTitle')}</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{cl('noDocsDesc')}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/vault" className="btn btn-outline border-teal-600 text-teal-800 hover:bg-teal-50 min-h-[48px]">
              <FolderLock className="w-4 h-4" aria-hidden="true" />
              {cl('goToVault')}
            </Link>
            <Link href="/profile" className="btn btn-outline border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[48px]">
              <User className="w-4 h-4" aria-hidden="true" />
              {cl('goToProfile')}
            </Link>
          </div>
        </div>
      )}

      {/* COMPARISON RESULTS */}
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner text-[#003366]" />
        </div>
      ) : report && report.totalFieldsCompared > 0 ? (
        <section className="space-y-4">
          {/* Summary Readiness Card */}
          <div className="card bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">Overall Consistency Readiness:</span>
              {report.overallReadiness === 'ready' && (
                <span className="badge bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs p-2.5">
                  {cl('readyBadge')}
                </span>
              )}
              {report.overallReadiness === 'needs_attention' && (
                <span className="badge bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs p-2.5">
                  {cl('attentionBadge')}
                </span>
              )}
              {report.overallReadiness === 'high_risk' && (
                <span className="badge bg-red-100 text-red-900 border-red-300 font-bold text-xs p-2.5">
                  {cl('highRiskBadge')}
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-emerald-800 text-base">{report.exactMatches}</div>
                <div className="text-[11px] text-emerald-700 font-medium">Exact</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-amber-800 text-base">{report.likelyMatches}</div>
                <div className="text-[11px] text-amber-700 font-medium">Variations</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-red-800 text-base">{report.mismatches}</div>
                <div className="text-[11px] text-red-700 font-medium">Mismatches</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                <div className="font-extrabold text-blue-800 text-base">{report.userExplained}</div>
                <div className="text-[11px] text-blue-700 font-medium">Explained</div>
              </div>
            </div>
          </div>

          {/* Field Comparison Items */}
          <div className="space-y-3">
            {report.fieldReports.map(item => {
              const isEditing = activeEditingId === item.id;
              const hasExplanation = !!savedExplanations[item.id];

              return (
                <div
                  key={item.id}
                  className="card bg-white border border-slate-200 rounded-2xl shadow-xs p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.fieldLabel}
                    </span>
                    {renderResultBadge(item.result)}
                  </div>

                  {/* Compared Values Comparison Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.values.map((val, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1"
                      >
                        <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          <span>{val.sourceTitle}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm break-words">
                          {val.rawValue || '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Explanation & Portal Impact */}
                  <div className="bg-slate-50/80 rounded-xl p-3 text-xs text-slate-700 space-y-1.5 border border-slate-100">
                    <p className="leading-relaxed">{item.explanation}</p>
                    {item.suggestedAction && (
                      <p className="text-teal-900 font-semibold bg-teal-50/80 p-2 rounded-lg text-[11px]">
                        Official Next Step: {item.suggestedAction}
                      </p>
                    )}
                  </div>

                  {/* Student Recorded Explanation */}
                  {hasExplanation && !isEditing && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-blue-900">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                        <span>Your Explanation:</span>
                      </div>
                      <p className="italic text-blue-900 leading-relaxed">
                        "{savedExplanations[item.id]}"
                      </p>
                      <button
                        type="button"
                        className="text-xs text-blue-700 font-semibold underline mt-1"
                        onClick={() => handleStartExplanation(item)}
                      >
                        {cl('editExplanation')}
                      </button>
                    </div>
                  )}

                  {/* Inline Explanation Editor */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {cl('explainBtn')}
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full text-xs min-h-[80px] bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl"
                        placeholder={cl('explanationPlaceholder')}
                        value={explanationDraft}
                        onChange={e => setExplanationDraft(e.target.value)}
                        maxLength={1000}
                      />
                      <p className="text-[11px] text-slate-500 italic">
                        {cl('studentExplanationNote')}
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost text-slate-600 min-h-[36px]"
                          onClick={() => setActiveEditingId(null)}
                        >
                          {cl('cancel')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs bg-[#003366] hover:bg-[#002244] text-white min-h-[36px] px-3 gap-1"
                          onClick={() => handleSaveExplanation(item)}
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          {cl('saveExplanation')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    !hasExplanation &&
                    (item.result === 'likely_match' ||
                      item.result === 'possible_mismatch' ||
                      item.result === 'significant_mismatch') && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline border-slate-300 text-slate-700 min-h-[36px] gap-1"
                          onClick={() => handleStartExplanation(item)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                          {cl('explainBtn')}
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

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

