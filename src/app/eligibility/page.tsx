'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  type SchemeEligibilityEvaluation,
  type EligibilityEvaluationBatch,
  type ConditionEvaluation,
  type OverallEligibilityStatus,
} from '@/lib/eligibility/schema';
import { runEligibilityEvaluation } from '@/lib/eligibility/engine';
import {
  saveEvaluationBatch,
  getLatestEvaluationBatch,
} from '@/lib/eligibility/storage';
import { loadProfile } from '@/lib/profile/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import { type StudentProfile } from '@/lib/profile/schema';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  User,
  GraduationCap,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
  FolderLock,
} from 'lucide-react';

const ELIGIBILITY_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Deterministic Eligibility Checker', hi: 'पात्रता जाँचकर्ता' },
  subtitle: {
    en: 'Rule-based, transparent evaluation against official published guidelines. No guessing, no false promises.',
    hi: 'आधिकारिक प्रकाशित दिशानिर्देशों के आधार पर पारदर्शी नियम-आधारित मूल्यांकन। कोई अनुमान नहीं, कोई झूठे वादे नहीं।',
  },
  disclaimer: {
    en: 'Independent preliminary check. Does not constitute official approval, award, or fund disbursement by NSP or any Ministry.',
    hi: 'स्वतंत्र प्रारंभिक जाँच। यह एनएसपी या किसी भी मंत्रालय द्वारा आधिकारिक स्वीकृति, पुरस्कार या राशि वितरण की गारंटी नहीं है।',
  },
  profileBarTitle: { en: 'Active Student Profile', hi: 'सक्रिय छात्र प्रोफ़ाइल' },
  stateNotSet: { en: 'State: Not Set', hi: 'राज्य: दर्ज नहीं' },
  catNotSet: { en: 'Category: Not Set', hi: 'वर्ग: दर्ज नहीं' },
  incomeNotSet: { en: 'Income: Not Set', hi: 'आय: दर्ज नहीं' },
  reEvaluateBtn: { en: 'Re-evaluate All Schemes', hi: 'सभी योजनाओं का पुनः मूल्यांकन करें' },
  editProfileBtn: { en: 'Edit Profile', hi: 'प्रोफ़ाइल बदलें' },
  vaultBtn: { en: 'Document Vault', hi: 'दस्तावेज़ वॉल्ट' },
  tabAll: { en: 'All Schemes', hi: 'सभी योजनाएं' },
  tabEligible: { en: 'Potentially Eligible', hi: 'पात्रता शर्तें पूरी' },
  tabNeedsInfo: { en: 'Needs Information', hi: 'जानकारी आवश्यक' },
  tabIneligible: { en: 'Ineligible', hi: 'पात्रता अपूर्ण' },
  criteriaPassed: { en: 'Criteria Matched', hi: 'शर्तें पूरी' },
  criteriaNeedsInfo: { en: 'Information Required', hi: 'जानकारी आवश्यक' },
  criteriaFailed: { en: 'Criteria Not Met', hi: 'शर्तें पूरी नहीं' },
  criteriaUnverified: { en: 'Rules Under Review', hi: 'नियम समीक्षाधीन' },
  viewTrace: { en: 'View Detailed Criteria Breakdown', hi: 'विस्तृत शर्तों का विवरण देखें' },
  hideTrace: { en: 'Hide Detailed Criteria Breakdown', hi: 'शर्तों का विवरण छिपाएं' },
  missingHeader: { en: 'Missing information needed to determine eligibility:', hi: 'पात्रता निर्धारित करने हेतु आवश्यक अधूरी जानकारी:' },
  ineligibleHeader: { en: 'Conditions that did not meet scheme guidelines:', hi: 'वे शर्तें जो योजना दिशानिर्देशों के अनुसार पूरी नहीं हुईं:' },
  officialPortalBtn: { en: 'Official Application Portal', hi: 'आधिकारिक आवेदन पोर्टल' },
  schemeDetailsBtn: { en: 'View Scheme Details', hi: 'योजना विवरण देखें' },
  updateProfileLink: { en: 'Complete in Profile →', hi: 'प्रोफ़ाइल में पूरा करें →' },
  deadlineNotice: {
    en: 'Check the date on the portal as application deadlines fluctuate.',
    hi: 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।',
  },
  noEvaluationsFound: {
    en: 'No evaluations available. Click Re-evaluate to assess your eligibility.',
    hi: 'कोई मूल्यांकन उपलब्ध नहीं है। पात्रता जाँचने हेतु पुनः मूल्यांकन बटन दबाएं।',
  },
};

export default function EligibilityPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const el = (key: string) => ELIGIBILITY_LABELS[key]?.[lang] || ELIGIBILITY_LABELS[key]?.en || key;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [vaultDocCategories, setVaultDocCategories] = useState<string[]>([]);
  const [batch, setBatch] = useState<EligibilityEvaluationBatch | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'eligible' | 'needs_info' | 'ineligible'>('all');
  const [expandedSchemes, setExpandedSchemes] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Load profile, vault docs and latest evaluation on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loadedProfile = await loadProfile();
        setProfile(loadedProfile);

        const loadedDocs = await loadAllDocuments();
        const docCategories = loadedDocs.map(d => d.category);
        setVaultDocCategories(docCategories);

        // Load existing batch or run fresh evaluation
        const existingBatch = await getLatestEvaluationBatch();
        if (existingBatch) {
          setBatch(existingBatch);
        } else {
          // Run initial evaluation
          const newBatch = runEligibilityEvaluation(loadedProfile, undefined, docCategories);
          setBatch(newBatch);
          await saveEvaluationBatch(newBatch);
        }
      } catch (err) {
        console.error('[Eligibility UI] Error initializing data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle re-evaluation
  const handleReEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const currentProfile = await loadProfile();
      setProfile(currentProfile);

      const currentDocs = await loadAllDocuments();
      const categories = currentDocs.map(d => d.category);
      setVaultDocCategories(categories);

      const newBatch = runEligibilityEvaluation(currentProfile, undefined, categories);
      setBatch(newBatch);
      await saveEvaluationBatch(newBatch);
    } catch (err) {
      console.error('[Eligibility UI] Re-evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleExpand = (schemeId: string) => {
    setExpandedSchemes(prev => ({
      ...prev,
      [schemeId]: !prev[schemeId],
    }));
  };

  // Filter schemes based on active tab
  const filteredEvaluations = useMemo(() => {
    if (!batch) return [];
    if (activeTab === 'eligible') {
      return batch.evaluations.filter(e => e.overallResult === 'POTENTIALLY_ELIGIBLE');
    }
    if (activeTab === 'needs_info') {
      return batch.evaluations.filter(e => e.overallResult === 'NEEDS_INFORMATION');
    }
    if (activeTab === 'ineligible') {
      return batch.evaluations.filter(e => e.overallResult === 'NOT_ELIGIBLE');
    }
    return batch.evaluations;
  }, [batch, activeTab]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-7 h-7 text-[#003366]" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {el('title')}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {el('subtitle')}
        </p>

        {/* Rule P2 Disclaimer Banner */}
        <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-amber-950 font-medium">
            <strong>{lang === 'hi' ? 'महत्वपूर्ण सूचना:' : 'Notice:'}</strong> {el('disclaimer')}
          </p>
        </div>
      </div>

      {/* Profile Summary & Action Bar */}
      <div className="card bg-white shadow-xs border border-slate-200 rounded-2xl mb-6">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#003366]" aria-hidden="true" />
                <span className="font-semibold text-sm sm:text-base text-slate-900">
                  {profile?.basic?.displayName ? profile.basic.displayName : el('profileBarTitle')}
                </span>
                <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300">
                  {profile?.basic?.preferredLanguage === 'hi' ? 'हिंदी' : 'English'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {profile?.basic?.domicileState ? `State: ${profile.basic.domicileState}` : el('stateNotSet')}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {profile?.schemeDependent?.category ? `Category: ${profile.schemeDependent.category.toUpperCase()}` : el('catNotSet')}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {profile?.schemeDependent?.familyIncome
                    ? `Income: ₹${profile.schemeDependent.familyIncome.toLocaleString('en-IN')}`
                    : el('incomeNotSet')}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {`Vault: ${vaultDocCategories.length} docs`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleReEvaluate}
                disabled={isEvaluating}
                className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white border-0 min-h-[40px] px-3.5 rounded-xl shadow-xs"
                aria-label={el('reEvaluateBtn')}
              >
                <RefreshCw className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{el('reEvaluateBtn')}</span>
              </button>
              <Link href="/profile" className="btn btn-sm btn-outline border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[40px] rounded-xl">
                {el('editProfileBtn')}
              </Link>
              <Link href="/vault" className="btn btn-sm btn-ghost text-slate-600 min-h-[40px] rounded-xl">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>{el('vaultBtn')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {el('tabAll')}
          <span className="ml-1.5 badge badge-sm bg-slate-200 text-slate-800 border-0">{batch?.summary.totalEvaluated || 0}</span>
        </button>
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'eligible'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {el('tabEligible')}
          <span className="ml-1.5 badge badge-sm bg-emerald-100 text-emerald-800 border-0">{batch?.summary.potentiallyEligible || 0}</span>
        </button>
        <button
          onClick={() => setActiveTab('needs_info')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'needs_info'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {el('tabNeedsInfo')}
          <span className="ml-1.5 badge badge-sm bg-amber-100 text-amber-800 border-0">{batch?.summary.needsInformation || 0}</span>
        </button>
        <button
          onClick={() => setActiveTab('ineligible')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'ineligible'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {el('tabIneligible')}
          <span className="ml-1.5 badge badge-sm bg-rose-100 text-rose-800 border-0">{batch?.summary.notEligible || 0}</span>
        </button>
      </div>

      {/* Evaluation List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#003366] mb-2" aria-hidden="true" />
          <p className="text-sm">Evaluating scholarship criteria against student profile...</p>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="card bg-white border border-slate-200 text-center p-8 rounded-2xl shadow-xs">
          <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <h3 className="font-semibold text-base text-slate-800 mb-1">{el('noEvaluationsFound')}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map(item => {
            const isExpanded = !!expandedSchemes[item.scholarshipId];

            // Status styling helpers
            let borderClass = 'border-slate-200';
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
            let statusText = el('criteriaUnverified');
            let StatusIcon = AlertTriangle;

            if (item.overallResult === 'POTENTIALLY_ELIGIBLE') {
              borderClass = 'border-emerald-300';
              badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              statusText = el('criteriaPassed');
              StatusIcon = CheckCircle2;
            } else if (item.overallResult === 'NEEDS_INFORMATION') {
              borderClass = 'border-amber-300';
              badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
              statusText = el('criteriaNeedsInfo');
              StatusIcon = HelpCircle;
            } else if (item.overallResult === 'NOT_ELIGIBLE') {
              borderClass = 'border-rose-300';
              badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
              statusText = el('criteriaFailed');
              StatusIcon = XCircle;
            }

            return (
              <div
                key={item.scholarshipId}
                className={`card bg-white shadow-xs border rounded-2xl ${borderClass} transition-colors`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top Bar: Code, Provider, and Overall Outcome Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-mono text-xs">
                        {item.scholarshipCode}
                      </span>
                      <span className="text-xs text-slate-600">
                        {lang === 'hi' ? item.providerHi : item.providerEn}
                      </span>
                    </div>
                    <span className={`badge ${badgeClass} gap-1.5 py-2.5 px-3 font-semibold text-xs border`}>
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {statusText}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                    {lang === 'hi' ? item.scholarshipNameHi : item.scholarshipNameEn}
                  </h2>

                  {/* Summary Metric Counters */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="text-emerald-700 font-semibold">
                      ✓ {item.passedCount} {lang === 'hi' ? 'शर्तें पास' : 'Passed'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-semibold">
                      ? {item.unknownCount} {lang === 'hi' ? 'अधूरी जानकारी' : 'Needs Info'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-700 font-semibold">
                      ✗ {item.failedCount} {lang === 'hi' ? 'शर्तें अपूर्ण' : 'Ineligible'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono">
                      AY {item.academicYear}
                    </span>
                  </div>

                  {/* Missing Fields Box if Needs Information */}
                  {item.overallResult === 'NEEDS_INFORMATION' && item.missingFields.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs font-semibold text-amber-950 mb-1.5">
                        {el('missingHeader')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {item.missingFields.map((field, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-medium border border-amber-200"
                          >
                            {field}
                          </span>
                        ))}
                        <Link
                          href="/profile"
                          className="text-xs font-semibold text-teal-700 hover:underline ml-1 min-h-[32px] inline-flex items-center"
                        >
                          {el('updateProfileLink')}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Ineligible Reasons Box if Not Eligible */}
                  {item.overallResult === 'NOT_ELIGIBLE' && item.failedReasonsEn.length > 0 && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-xs font-semibold text-rose-950 mb-1">
                        {el('ineligibleHeader')}
                      </p>
                      <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
                        {(lang === 'hi' ? item.failedReasonsHi : item.failedReasonsEn).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Saffron Deadline Warning Box (Rule P8) */}
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-amber-950 font-medium">
                      {el('deadlineNotice')}
                    </p>
                  </div>

                  {/* Toggle Detailed Condition Trace Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpand(item.scholarshipId)}
                      className="btn btn-ghost btn-xs w-full justify-between min-h-[36px] text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? el('hideTrace') : el('viewTrace')}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Trace Section */}
                  {isExpanded && (
                    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2.5">
                      {item.conditionEvaluations.map(cond => {
                        let condBadge = 'bg-slate-100 text-slate-700 border-slate-300';
                        let CondIcon = HelpCircle;

                        if (cond.result === 'PASS') {
                          condBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          CondIcon = CheckCircle2;
                        } else if (cond.result === 'FAIL') {
                          condBadge = 'bg-rose-100 text-rose-800 border-rose-300';
                          CondIcon = XCircle;
                        } else if (cond.result === 'UNKNOWN') {
                          condBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                          CondIcon = HelpCircle;
                        }

                        return (
                          <div
                            key={cond.conditionId}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                              <span className="font-semibold text-slate-900">
                                {lang === 'hi' ? cond.labelHi : cond.labelEn}
                                {!cond.isMandatory && (
                                  <span className="ml-1 text-[10px] text-slate-500 font-normal">
                                    ({lang === 'hi' ? 'वैकल्पिक' : 'Optional'})
                                  </span>
                                )}
                              </span>
                              <span className={`badge ${condBadge} badge-xs py-2 px-2 gap-1 font-semibold border`}>
                                <CondIcon className="w-3 h-3" aria-hidden="true" />
                                {cond.result}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1.5 text-slate-800">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] uppercase text-slate-400 font-bold block">
                                  {lang === 'hi' ? 'योजना मानदंड' : 'Scheme Rule'}
                                </span>
                                <span className="font-medium text-slate-900">{cond.expectedValue}</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] uppercase text-slate-400 font-bold block">
                                  {lang === 'hi' ? 'आपकी प्रोफ़ाइल' : 'Your Profile Value'}
                                </span>
                                <span className="font-medium text-slate-900">
                                  {cond.studentValue !== undefined && cond.studentValue !== null
                                    ? String(cond.studentValue)
                                    : <span className="text-amber-700 font-semibold italic">{lang === 'hi' ? 'दर्ज नहीं है' : 'Not Provided'}</span>}
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 mt-1">
                              {lang === 'hi' ? cond.explanationHi : cond.explanationEn}
                            </p>

                            <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>{cond.sourceReference}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/discovery/${item.scholarshipId}`}
                        className="btn btn-sm btn-ghost gap-1 min-h-[44px] rounded-xl text-slate-700 hover:text-slate-900"
                      >
                        <span>{el('schemeDetailsBtn')}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/readiness/${item.scholarshipId}`}
                        className="btn btn-sm btn-outline border-teal-600 text-teal-700 hover:bg-teal-50 gap-1.5 min-h-[44px] rounded-xl"
                      >
                        <FolderLock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{lang === 'hi' ? 'तैयारी चेकलिस्ट' : 'Readiness Checklist'}</span>
                      </Link>
                    </div>

                    {/* Official Portal Link (Rule P3) */}
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white border-0 gap-1.5 min-h-[44px] rounded-xl shadow-xs font-bold"
                    >
                      <span>{el('officialPortalBtn')}</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

