'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { type ScholarshipReadinessReport, type ReadinessState } from '@/lib/readiness/schema';
import { evaluateAllScholarshipsReadiness } from '@/lib/readiness/engine';
import { loadProfile } from '@/lib/profile/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FolderLock,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Calendar,
} from 'lucide-react';

const READINESS_OVERVIEW_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Application Readiness Hub', hi: 'आवेदन तैयारी केंद्र' },
  subtitle: {
    en: 'Track checklist completeness, document availability, and consistency for every scholarship before applying.',
    hi: 'आवेदन से पूर्व प्रत्येक छात्रवृत्ति हेतु चेकलिस्ट, दस्तावेज़ों की उपलब्धता और सुसंगतता की जाँच करें।',
  },
  disclaimer: {
    en: 'Technical readiness checklist based on published scheme rules. Does not constitute official approval by NSP or Ministry.',
    hi: 'प्रकाशित नियमों पर आधारित तकनीकी तैयारी चेकलिस्ट। यह एनएसपी या मंत्रालय द्वारा आधिकारिक स्वीकृति की गारंटी नहीं है।',
  },
  tabAll: { en: 'All Schemes', hi: 'सभी योजनाएं' },
  tabReady: { en: 'Ready for Review', hi: 'समीक्षा हेतु तैयार' },
  tabInProgress: { en: 'In Progress', hi: 'प्रक्रियाधीन' },
  tabBlocked: { en: 'Blocked', hi: 'बाधाएं उपस्थित' },
  viewChecklist: { en: 'Open Detailed Checklist', hi: 'विस्तृत चेकलिस्ट खोलें' },
  portalDateNotice: {
    en: 'Check the date on the portal as application deadlines fluctuate.',
    hi: 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।',
  },
};

export default function ReadinessOverviewPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const rl = (key: string) => READINESS_OVERVIEW_LABELS[key]?.[lang] || READINESS_OVERVIEW_LABELS[key]?.en || key;

  const [reports, setReports] = useState<ScholarshipReadinessReport[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'in_progress' | 'blocked'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const profile = await loadProfile();
        const docs = await loadAllDocuments();
        const evalReports = evaluateAllScholarshipsReadiness(profile, docs);
        setReports(evalReports);
      } catch (err) {
        console.error('[Readiness Hub] Error evaluating schemes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredReports = reports.filter(r => {
    if (activeTab === 'ready') {
      return r.overallState === 'READY_FOR_STUDENT_REVIEW' || r.overallState === 'STUDENT_CONFIRMED_READY';
    }
    if (activeTab === 'in_progress') {
      return r.overallState === 'IN_PROGRESS' || r.overallState === 'NOT_STARTED';
    }
    if (activeTab === 'blocked') {
      return r.overallState === 'BLOCKED';
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FolderLock className="w-7 h-7 text-[#003366]" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {rl('title')}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {rl('subtitle')}
        </p>

        {/* Rule P2 Disclaimer Banner */}
        <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-amber-950 font-medium">
            <strong>{lang === 'hi' ? 'महत्वपूर्ण सूचना:' : 'Notice:'}</strong> {rl('disclaimer')}
          </p>
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
          {rl('tabAll')}
          <span className="ml-1.5 badge badge-sm bg-slate-200 text-slate-800 border-0">{reports.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'ready'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {rl('tabReady')}
          <span className="ml-1.5 badge badge-sm bg-emerald-100 text-emerald-800 border-0">
            {reports.filter(r => r.overallState === 'READY_FOR_STUDENT_REVIEW' || r.overallState === 'STUDENT_CONFIRMED_READY').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'in_progress'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {rl('tabInProgress')}
          <span className="ml-1.5 badge badge-sm bg-amber-100 text-amber-800 border-0">
            {reports.filter(r => r.overallState === 'IN_PROGRESS' || r.overallState === 'NOT_STARTED').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'blocked'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {rl('tabBlocked')}
          <span className="ml-1.5 badge badge-sm bg-rose-100 text-rose-800 border-0">
            {reports.filter(r => r.overallState === 'BLOCKED').length}
          </span>
        </button>
      </div>

      {/* Report Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#003366] mb-2" aria-hidden="true" />
          <p className="text-sm">Evaluating application readiness across all schemes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => {
            let stateBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
            let stateText: string = report.overallState;
            let StateIcon = Clock;
            let borderClass = 'border-slate-200';

            if (report.overallState === 'STUDENT_CONFIRMED_READY') {
              stateBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              stateText = lang === 'hi' ? 'सत्यापित एवं तैयार' : 'Confirmed Ready';
              StateIcon = CheckCircle2;
              borderClass = 'border-emerald-300';
            } else if (report.overallState === 'READY_FOR_STUDENT_REVIEW') {
              stateBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              stateText = lang === 'hi' ? 'समीक्षा हेतु तैयार' : 'Ready for Review';
              StateIcon = CheckCircle2;
              borderClass = 'border-emerald-300';
            } else if (report.overallState === 'IN_PROGRESS') {
              stateBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
              stateText = lang === 'hi' ? 'प्रक्रियाधीन' : 'In Progress';
              StateIcon = Clock;
              borderClass = 'border-amber-300';
            } else if (report.overallState === 'BLOCKED') {
              stateBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
              stateText = lang === 'hi' ? 'बाधाएं उपस्थित' : 'Blocked';
              StateIcon = AlertCircle;
              borderClass = 'border-rose-300';
            }

            return (
              <div
                key={report.scholarshipId}
                className={`card bg-white shadow-xs border rounded-2xl ${borderClass} transition-colors`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-mono text-xs">
                        {report.scholarshipCode}
                      </span>
                      <span className="text-xs text-slate-600">
                        {lang === 'hi' ? report.providerHi : report.providerEn}
                      </span>
                    </div>
                    <span className={`badge ${stateBadgeClass} gap-1.5 py-2.5 px-3 font-semibold text-xs border`}>
                      <StateIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {stateText}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                    {lang === 'hi' ? report.scholarshipNameHi : report.scholarshipNameEn}
                  </h2>

                  {/* Summary Metric Counters */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="text-slate-600">
                      Checklist: <strong className="text-slate-900">{report.checklistSummary.passedChecks} / {report.checklistSummary.totalChecks} domains passed</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold">
                      Docs: {report.sections.requiredDocuments.availableCount} / {report.sections.requiredDocuments.totalRequired} available
                    </span>
                    {report.checklistSummary.blockingIssuesCount > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-rose-700 font-bold">
                          {report.checklistSummary.blockingIssuesCount} active blocker(s)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Blockers preview */}
                  {report.blockers.length > 0 && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-xs font-semibold text-rose-950 mb-1">
                        {lang === 'hi' ? 'आवेदन से पूर्व समाधान आवश्यक:' : 'Action required before applying:'}
                      </p>
                      <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
                        {report.blockers.slice(0, 2).map((b, idx) => (
                          <li key={idx}>{lang === 'hi' ? b.titleHi : b.titleEn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Saffron Deadline Warning Box (Rule P8) */}
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-amber-950 font-medium">
                      {rl('portalDateNotice')}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href={`/readiness/${report.scholarshipId}`}
                      className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white border-0 gap-1.5 min-h-[44px] px-4 rounded-xl shadow-xs"
                    >
                      <span>{rl('viewChecklist')}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
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

