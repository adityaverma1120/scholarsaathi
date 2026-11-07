'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getScholarshipById } from '@/lib/catalogue/engine';
import { generateApplicationPreparationForm } from '@/lib/assistant/engine';
import {
  savePreparedForm,
  getPreparedForm,
  updateFieldValueInStorage,
  updateReviewChecklist,
} from '@/lib/assistant/storage';
import { loadProfile } from '@/lib/profile/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import {
  type ApplicationPreparationForm,
  type PreparedFieldValue,
} from '@/lib/assistant/schema';
import {
  FileEdit,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Edit3,
  Calendar,
  Save,
  ArrowLeft,
  User,
  GraduationCap,
  CreditCard,
  Phone,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ scholarshipId: string }>;
}

export default function AssistantWorkspacePage({ params }: PageProps) {
  const { scholarshipId } = use(params);
  const scheme = getScholarshipById(scholarshipId);

  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';

  const [form, setForm] = useState<ApplicationPreparationForm | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!scheme) {
    notFound();
  }

  useEffect(() => {
    async function loadData() {
      if (!scheme) return;
      setIsLoading(true);
      try {
        const profile = await loadProfile();
        const docs = await loadAllDocuments();

        const existing = await getPreparedForm(scholarshipId);
        const prepared = generateApplicationPreparationForm(scheme, profile, docs, existing);
        await savePreparedForm(prepared);
        setForm(prepared);
      } catch (err) {
        console.error('[Assistant Workspace] Error loading workspace:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [scholarshipId]);

  // Copy to clipboard handler
  const handleCopy = async (fieldId: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFieldId(fieldId);
      setTimeout(() => setCopiedFieldId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Field Edit Handlers
  const startEditing = (field: PreparedFieldValue) => {
    setEditingFieldId(field.fieldId);
    setEditValue(field.candidateValue);
  };

  const saveEdit = async (fieldId: string) => {
    if (!form) return;
    const updated = await updateFieldValueInStorage(scholarshipId, fieldId, editValue, true);
    if (updated) {
      setForm(updated);
    }
    setEditingFieldId(null);
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
  };

  // Toggle field confirmation
  const toggleFieldConfirmed = async (field: PreparedFieldValue) => {
    if (!form) return;
    const updated = await updateFieldValueInStorage(
      scholarshipId,
      field.fieldId,
      field.candidateValue,
      !field.isConfirmed
    );
    if (updated) {
      setForm(updated);
    }
  };

  // Final review checklist update
  const toggleChecklistItem = async (key: keyof ApplicationPreparationForm['finalReviewChecklist']) => {
    if (!form) return;
    const currentValue = form.finalReviewChecklist[key];
    const updated = await updateReviewChecklist(scholarshipId, {
      [key]: !currentValue,
    });
    if (updated) {
      setForm(updated);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-base-content/50">
        <FileEdit className="w-10 h-10 animate-pulse text-indigo-600 mb-3" aria-hidden="true" />
        <p className="text-sm">Preparing official application workspace...</p>
      </div>
    );
  }

  // Filter fields by section
  const sections = Array.from(new Set(form.fields.map(f => f.section)));
  const filteredFields = activeSection === 'all'
    ? form.fields
    : form.fields.filter(f => f.section === activeSection);

  // Status helper
  let statusBadge = 'badge-neutral';
  let statusText = lang === 'hi' ? 'प्रारूप' : 'Draft';
  if (form.status === 'confirmed_by_student') {
    statusBadge = 'badge-success text-white';
    statusText = lang === 'hi' ? 'छात्र द्वारा सत्यापित' : 'Confirmed by Student';
  } else if (form.status === 'in_review') {
    statusBadge = 'badge-warning text-white';
    statusText = lang === 'hi' ? 'समीक्षाधीन' : 'In Review';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/assistant"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{lang === 'hi' ? 'फॉर्म-सहायक केंद्र पर वापस जाएँ' : 'Back to Form Assistant'}</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-sm badge-outline font-mono text-xs">
                {scheme.code}
              </span>
              <span className="text-xs text-base-content/60">
                {form.portalName} • AY {scheme.academicYear}
              </span>
            </div>
            <span className={`badge ${statusBadge} gap-1.5 py-3 px-3 font-medium text-xs`}>
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              {statusText}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-base-content mt-1">
            {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
            <span>Prepared: <strong>{form.summary.preparedCount} of {form.summary.totalFields}</strong></span>
            <span>•</span>
            <span>Confirmed: <strong>{form.summary.confirmedCount}</strong></span>
            {form.summary.missingCount > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-700 font-medium">
                  {form.summary.missingCount} Missing
                </span>
              </>
            )}
            {form.summary.conflictCount > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-700 font-bold">
                  {form.summary.conflictCount} Conflict(s)
                </span>
              </>
            )}
          </div>

          {/* Rule P3 Boundary Safety Banner */}
          <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-indigo-950">
              <strong>{lang === 'hi' ? 'सुरक्षित फॉर्म सहायक:' : 'Safe Form Assistant:'}</strong>{' '}
              {lang === 'hi'
                ? 'यह कार्यक्षेत्र आधिकारिक पोर्टल पर त्वरित प्रविष्टि हेतु आपके सत्यापित मान प्रदर्शित करता है। स्कॉलर साथी कभी भी आपके क्रेडेंशियल्स दर्ज नहीं करती और न ही फॉर्म स्वतः सबमिट करती है (नियम P3)।'
                : 'This workspace displays your verified values for quick, accurate entry into the official portal. ScholarSaathi never enters portal credentials or auto-submits applications on your behalf (Rule P3).'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold min-h-[40px] transition-all ${
            activeSection === 'all'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {lang === 'hi' ? 'सभी फ़ील्ड्स' : 'All Fields'} ({form.fields.length})
        </button>
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold min-h-[40px] transition-all ${
              activeSection === sec
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Field Cards */}
      <div className="space-y-3.5 mb-8">
        {filteredFields.map(field => {
          const isCopied = copiedFieldId === field.fieldId;
          const isEditing = editingFieldId === field.fieldId;

          // Provenance badge helper
          let provBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
          let provLabel: string = field.sourceType;
          if (field.sourceType === 'profile') {
            provBadgeClass = 'bg-teal-50 text-teal-800 border-teal-300';
            provLabel = lang === 'hi' ? '👤 प्रोफ़ाइल' : '👤 Profile';
          } else if (field.sourceType === 'vault_document') {
            provBadgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-300';
            provLabel = lang === 'hi' ? '📄 वॉल्ट' : '📄 Vault Doc';
          } else if (field.sourceType === 'manual_override') {
            provBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
            provLabel = lang === 'hi' ? '✏️ संपादित' : '✏️ Manual';
          } else if (field.sourceType === 'missing') {
            provBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
            provLabel = lang === 'hi' ? '⚠️ दर्ज नहीं' : '⚠️ Missing';
          }

          return (
            <div
              key={field.fieldId}
              className={`card bg-white shadow-xs border rounded-2xl ${
                field.hasConflict
                  ? 'border-rose-400 bg-rose-50/20'
                  : field.isConfirmed
                  ? 'border-emerald-400/80'
                  : 'border-slate-200'
              } transition-colors`}
            >
              <div className="p-4 sm:p-5">
                {/* Header: Label, Section, Impact, Provenance */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900">
                      {lang === 'hi' ? field.labelHi : field.labelEn}
                    </span>
                    {field.highImpact && (
                      <span className="badge badge-xs bg-amber-100 text-amber-900 border-amber-300 font-bold uppercase text-[9px] py-1 px-1.5">
                        {lang === 'hi' ? 'मुख्य फ़ील्ड' : 'High Impact'}
                      </span>
                    )}
                    {field.isMandatory && (
                      <span className="text-rose-600 text-xs font-bold" title="Mandatory">*</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`badge badge-xs py-2 px-2 text-[10px] font-medium border ${provBadgeClass}`}>
                      {provLabel}
                    </span>
                    <button
                      onClick={() => toggleFieldConfirmed(field)}
                      className={`btn btn-xs min-h-[32px] px-2.5 rounded-xl gap-1 ${
                        field.isConfirmed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                          : 'btn-ghost text-slate-500 hover:text-slate-900'
                      }`}
                      aria-label="Toggle student confirmation"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="text-[11px]">
                        {field.isConfirmed
                          ? lang === 'hi' ? 'सत्यापित' : 'Confirmed'
                          : lang === 'hi' ? 'सत्यापित करें' : 'Confirm'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Candidate Value Box or Edit Input */}
                <div className="mt-2.5">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono text-sm min-h-[42px] focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        placeholder="Enter value..."
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => saveEdit(field.fieldId)}
                          className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white border-0 rounded-xl min-h-[42px] px-3.5 gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{lang === 'hi' ? 'सहेजें' : 'Save'}</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-sm btn-ghost rounded-xl min-h-[42px] px-3 text-slate-600"
                        >
                          {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm text-slate-900">
                      <span className="truncate select-all font-medium">
                        {field.candidateValue ? (
                          field.candidateValue
                        ) : (
                          <span className="text-slate-400 italic font-sans text-xs">
                            {lang === 'hi' ? 'कोई मान उपलब्ध नहीं (अधूरी जानकारी)' : 'No value available (Information missing)'}
                          </span>
                        )}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        {field.candidateValue && (
                          <button
                            onClick={() => handleCopy(field.fieldId, field.candidateValue)}
                            className="btn btn-xs btn-ghost gap-1 min-h-[32px] text-teal-700 hover:text-teal-800 rounded-lg"
                            aria-label={`Copy ${field.labelEn}`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                <span className="text-emerald-700 text-[11px] font-bold">
                                  {lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                <span className="text-[11px] font-medium">
                                  {lang === 'hi' ? 'कॉपी' : 'Copy'}
                                </span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(field)}
                          className="btn btn-xs btn-ghost gap-1 min-h-[32px] text-slate-600 hover:text-slate-900 rounded-lg"
                          aria-label={`Edit ${field.labelEn}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="text-[11px]">{lang === 'hi' ? 'संपादित करें' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conflict Warning (if profile and vault document differ) */}
                {field.hasConflict && (
                  <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{lang === 'hi' ? field.conflictDetailHi : field.conflictDetailEn}</span>
                  </div>
                )}

                {/* Format Guidance & Instructions */}
                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 pt-1.5 border-t border-slate-100">
                  <span>
                    <strong className="text-slate-700">{lang === 'hi' ? 'पोर्टल निर्देश:' : 'Portal Guideline:'}</strong>{' '}
                    {lang === 'hi' ? field.formatHelpHi : field.formatHelpEn}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {field.sourceInstructionRef}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Review Checklist (Spec 11 Section 5) */}
      <div className="card bg-white border border-indigo-200 shadow-xs mb-6 rounded-2xl">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" aria-hidden="true" />
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'hi' ? 'अंतिम समीक्षा चेकलिस्ट (पोर्टल पर जाने से पूर्व)' : 'Final Review Checklist (Before Leaving for Portal)'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            {lang === 'hi'
              ? 'आधिकारिक पोर्टल पर जमा करने से पहले सभी विवरणों की सत्यता स्वयं सुनिश्चित करें:'
              : 'Inspect and confirm the accuracy of all candidate values before manual entry on the official portal:'}
          </p>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.finalReviewChecklist.schemeConfirmed}
                onChange={() => toggleChecklistItem('schemeConfirmed')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="font-medium text-slate-800">
                {lang === 'hi'
                  ? `मैंने चयनित योजना (${scheme.nameEn}) एवं शैक्षणिक सत्र 2026-27 की पुष्टि कर ली है।`
                  : `I confirm that I am applying for "${scheme.nameEn}" for Academic Year 2026-27.`}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.finalReviewChecklist.identityConfirmed}
                onChange={() => toggleChecklistItem('identityConfirmed')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="font-medium text-slate-800">
                {lang === 'hi'
                  ? 'विद्यार्थी का नाम, जन्म तिथि (DD/MM/YYYY) 10वीं की अंकतालिका के अनुसार सही है।'
                  : 'Student Name and Date of Birth match Class 10th certificate exactly without spelling errors.'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.finalReviewChecklist.bankAccountConfirmed}
                onChange={() => toggleChecklistItem('bankAccountConfirmed')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="font-medium text-slate-800">
                {lang === 'hi'
                  ? 'बैंक खाता संख्या एवं आईएफएससी सही है और यह खाता आधार एवं डीबीटी से जुड़ा है।'
                  : 'Bank account number and IFSC are verified; account is active and seeded with Aadhaar for DBT.'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.finalReviewChecklist.categoryIncomeConfirmed}
                onChange={() => toggleChecklistItem('categoryIncomeConfirmed')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="font-medium text-slate-800">
                {lang === 'hi'
                  ? 'जाति श्रेणी एवं वार्षिक पारिवारिक आय वैध प्रमाण पत्रों के अनुरूप दर्ज है।'
                  : 'Social Category and Annual Family Income match valid government certificates.'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.finalReviewChecklist.officialGuidelinesRead}
                onChange={() => toggleChecklistItem('officialGuidelinesRead')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="font-medium text-slate-800">
                {lang === 'hi'
                  ? 'मैंने आधिकारिक पोर्टल के निर्देश पढ़ लिए हैं। आवेदन सबमिट करने के बाद रसीद अवश्य सहेजूँगा/सहेजूँगी।'
                  : 'I have read the official NSP portal guidelines and will save the application receipt after submission.'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Saffron Portal Deadline Warning Box (Rule P8) */}
      <div className="mb-6 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2">
        <Calendar className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        <p className="text-xs text-amber-950 font-medium">
          {lang === 'hi'
            ? 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।'
            : 'Check the date on the official portal as application deadlines fluctuate.'}
        </p>
      </div>

      {/* Official Hand-Off Actions (Rule P3) */}
      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/readiness/${scheme.id}`}
          className="btn btn-sm btn-ghost min-h-[44px] rounded-xl text-slate-700 hover:text-slate-900"
        >
          {lang === 'hi' ? '← तैयारी चेकलिस्ट पर वापस जाएं' : '← Back to Readiness Checklist'}
        </Link>

        <a
          href={scheme.officialSource.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-[#003366] hover:bg-[#002244] text-white border-0 gap-2 min-h-[48px] w-full sm:w-auto text-sm font-bold rounded-xl shadow-xs"
        >
          <span>{lang === 'hi' ? 'आधिकारिक पोर्टल खोलें (scholarships.gov.in)' : 'Open Official Portal (scholarships.gov.in)'}</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

