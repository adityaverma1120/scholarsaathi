'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getScholarshipById } from '@/lib/catalogue/engine';
import { evaluateScholarshipReadiness } from '@/lib/readiness/engine';
import {
  saveReadinessReport,
  getReadinessReport,
  updateStudentConfirmation,
} from '@/lib/readiness/storage';
import { loadProfile } from '@/lib/profile/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import { type ScholarshipReadinessReport } from '@/lib/readiness/schema';
import {
  FolderLock,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckSquare,
  Square,
  FileEdit,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ scholarshipId: string }>;
}

export default function ScholarshipReadinessPage({ params }: PageProps) {
  const { scholarshipId } = use(params);
  const scheme = getScholarshipById(scholarshipId);

  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';

  const [report, setReport] = useState<ScholarshipReadinessReport | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    eligibility: true,
    requiredDocuments: true,
    documentQuality: false,
    crossDocConsistency: false,
    profileCompleteness: false,
    applicationWindow: false,
    studentReview: true,
  });
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

        // Check if student confirmation was previously saved
        const existingReport = await getReadinessReport(scholarshipId);
        const previouslyConfirmed = existingReport?.sections.studentReview.isConfirmed || false;
        setIsConfirmed(previouslyConfirmed);

        const evaluatedReport = evaluateScholarshipReadiness(
          scheme,
          profile,
          docs,
          previouslyConfirmed
        );

        setReport(evaluatedReport);
        await saveReadinessReport(evaluatedReport);
      } catch (err) {
        console.error('[Readiness Details] Error evaluating scheme readiness:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [scholarshipId]);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleToggleConfirmation = async () => {
    if (!report) return;
    const nextState = !isConfirmed;
    setIsConfirmed(nextState);

    const updated = await updateStudentConfirmation(
      scholarshipId,
      nextState,
      'Confirmed after reviewing all 6 checklist sections.'
    );
    if (updated) {
      setReport(updated);
    }
  };

  if (isLoading || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-slate-500">
        <FolderLock className="w-10 h-10 animate-bounce text-[#003366] mb-3" aria-hidden="true" />
        <p className="text-sm">Evaluating application readiness against official checklist...</p>
      </div>
    );
  }

  // State styling helper
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/readiness"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{lang === 'hi' ? 'तैयारी केंद्र पर वापस जाएं' : 'Back to Readiness Hub'}</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className={`card bg-white shadow-xs border ${borderClass} rounded-2xl mb-6`}>
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-mono text-xs">
                {scheme.code}
              </span>
              <span className="text-xs text-slate-600">
                {lang === 'hi' ? scheme.providerHi : scheme.providerEn}
              </span>
            </div>
            <span className={`badge ${stateBadgeClass} gap-1.5 py-2.5 px-3 font-semibold text-xs border`}>
              <StateIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {stateText}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
            <span>AY {scheme.academicYear}</span>
            <span>•</span>
            <span>
              Passed Domains: <strong className="text-slate-900">{report.checklistSummary.passedChecks} of {report.checklistSummary.totalChecks}</strong>
            </span>
            <span>•</span>
            <span>
              Docs: <strong className="text-slate-900">{report.sections.requiredDocuments.availableCount} of {report.sections.requiredDocuments.totalRequired} Available</strong>
            </span>
          </div>

          {/* Rule P2 Disclaimer Banner */}
          <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-950 font-medium">
              <strong>{lang === 'hi' ? 'महत्वपूर्ण सूचना:' : 'Notice:'}</strong>{' '}
              {lang === 'hi'
                ? 'यह तकनीकी तैयारी चेकलिस्ट है। यह एनएसपी या किसी मंत्रालय द्वारा छात्रवृत्ति अनुमोदन या राशि वितरण की गारंटी नहीं है।'
                : 'This is a technical application readiness checklist. It does not constitute official scholarship approval or guaranteed fund disbursement by NSP or Ministry.'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Blockers Banner (if any) */}
      {report.blockers.length > 0 && (
        <div className="card bg-rose-50 border border-rose-300 rounded-2xl mb-6">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>
                {lang === 'hi'
                  ? `${report.blockers.length} बाधा(एं) उपस्थित हैं - आवेदन से पूर्व समाधान आवश्यक:`
                  : `${report.blockers.length} Active Blocker(s) - Must be resolved before applying:`}
              </span>
            </div>
            <div className="space-y-2 mt-2.5">
              {report.blockers.map(blocker => (
                <div
                  key={blocker.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-rose-200 text-xs shadow-xs"
                >
                  <div>
                    <span className="font-semibold text-rose-950 block">
                      {lang === 'hi' ? blocker.titleHi : blocker.titleEn}
                    </span>
                    <span className="text-rose-800">
                      {lang === 'hi' ? blocker.messageHi : blocker.messageEn}
                    </span>
                  </div>
                  <Link
                    href={blocker.actionUrl}
                    className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-white shrink-0 min-h-[32px] px-3 rounded-lg border-0 inline-flex items-center"
                  >
                    <span>{lang === 'hi' ? blocker.actionLabelHi : blocker.actionLabelEn}</span>
                    <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7 Interactive Checklist Sections */}
      <div className="space-y-3">
        {/* Section 1: Eligibility Conditions */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('eligibility')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '1. पात्रता शर्तें' : '1. Eligibility Conditions'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? report.sections.eligibility.summaryHi : report.sections.eligibility.summaryEn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-semibold border ${
                  report.sections.eligibility.status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : report.sections.eligibility.status === 'FAIL'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {report.sections.eligibility.status}
              </span>
              {openSections.eligibility ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.eligibility && (
            <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between py-2">
                <span>
                  {report.sections.eligibility.passedCount} Passed • {report.sections.eligibility.unknownCount} Missing • {report.sections.eligibility.failedCount} Ineligible
                </span>
                <Link href="/eligibility" className="text-teal-700 font-semibold hover:underline">
                  {lang === 'hi' ? 'पात्रता जाँचकर्ता देखें →' : 'View Full Eligibility →'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Required Documents */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('requiredDocuments')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '2. आवश्यक दस्तावेज़ सूची' : '2. Required Documents Checklist'}
                </h3>
                <p className="text-xs text-slate-500">
                  {report.sections.requiredDocuments.availableCount} of {report.sections.requiredDocuments.totalRequired} documents available in Vault
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-semibold border ${
                  report.sections.requiredDocuments.status === 'ALL_AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {report.sections.requiredDocuments.status}
              </span>
              {openSections.requiredDocuments ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.requiredDocuments && (
            <div className="p-4 pt-0 border-t border-slate-100 space-y-2.5">
              {report.sections.requiredDocuments.items.map((doc, idx) => {
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
                let OutcomeIcon = Clock;

                if (doc.outcome === 'AVAILABLE') {
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  OutcomeIcon = CheckCircle2;
                } else if (doc.outcome === 'MISSING') {
                  badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                  OutcomeIcon = AlertCircle;
                } else if (doc.outcome === 'NEEDS_REVIEW') {
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  OutcomeIcon = Clock;
                } else if (doc.outcome === 'NOT_APPLICABLE') {
                  badgeClass = 'bg-slate-100 text-slate-600 border-slate-300';
                  OutcomeIcon = CheckCircle2;
                }

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <span className="font-bold text-slate-900">
                        {lang === 'hi' ? doc.labelHi : doc.labelEn}
                      </span>
                      <span className={`badge ${badgeClass} badge-xs py-2 px-2 gap-1 font-semibold border`}>
                        <OutcomeIcon className="w-3 h-3" aria-hidden="true" />
                        {doc.outcome}
                      </span>
                    </div>

                    <p className="text-slate-600">
                      {lang === 'hi' ? doc.reasonsHi.join(' ') : doc.reasonsEn.join(' ')}
                    </p>

                    {doc.requirement.issuerAuthorityEn && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Authority:</span>{' '}
                        {lang === 'hi' ? doc.requirement.issuerAuthorityHi : doc.requirement.issuerAuthorityEn}
                      </div>
                    )}

                    {doc.outcome === 'MISSING' && doc.actionUrl && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200">
                        <Link
                          href={doc.actionUrl}
                          className="btn btn-xs bg-[#003366] hover:bg-[#002244] text-white border-0 min-h-[30px] rounded-lg px-2.5"
                        >
                          {lang === 'hi' ? doc.actionRequiredHi : doc.actionRequiredEn}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Document Quality and Validity */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('documentQuality')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '3. दस्तावेज़ स्पष्टता एवं वैधता' : '3. Document Quality & Validity'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'आकार (≤2MB), स्कैन गुणवत्ता और आधिकारिक मुहर की जाँच'
                    : 'File size limits, legibility score, and official stamp readiness'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-semibold border ${
                  report.sections.documentQuality.status === 'VALID'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {report.sections.documentQuality.status}
              </span>
              {openSections.documentQuality ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.documentQuality && (
            <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              {(lang === 'hi' ? report.sections.documentQuality.notesHi : report.sections.documentQuality.notesEn).map((note, idx) => (
                <p key={idx}>✓ {note}</p>
              ))}
              <div className="pt-2">
                <Link href="/vault" className="text-teal-700 font-semibold hover:underline">
                  {lang === 'hi' ? 'दस्तावेज़ कोष में फ़ाइलें जाँचें →' : 'Inspect files in Document Vault →'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Cross-Document Consistency */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('crossDocConsistency')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '4. दस्तावेज़ों में सुसंगतता' : '4. Cross-Document Consistency'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'नाम, जन्म तिथि और पिता के नाम का मिलान'
                    : 'Name, DOB, and details alignment across marksheet and ID'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-semibold border ${
                  report.sections.crossDocConsistency.status === 'CONSISTENT'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : report.sections.crossDocConsistency.status === 'MISMATCH_DETECTED'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {report.sections.crossDocConsistency.status}
              </span>
              {openSections.crossDocConsistency ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.crossDocConsistency && (
            <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              {(lang === 'hi' ? report.sections.crossDocConsistency.notesHi : report.sections.crossDocConsistency.notesEn).map((note, idx) => (
                <p key={idx}>{note}</p>
              ))}
              <div className="pt-2">
                <Link href="/checker" className="text-teal-700 font-semibold hover:underline">
                  {lang === 'hi' ? 'कंसिस्टेंसी चेकर में विवरण देखें →' : 'View in Cross-Document Checker →'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Profile Fields Required by Application */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('profileCompleteness')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '5. प्रोफ़ाइल आवेदन फ़ील्ड्स' : '5. Application Profile Fields'}
                </h3>
                <p className="text-xs text-slate-500">
                  {report.sections.profileCompleteness.completionRate}% complete ({report.sections.profileCompleteness.missingFields.length} missing fields)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-semibold border ${
                  report.sections.profileCompleteness.status === 'COMPLETE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {report.sections.profileCompleteness.status}
              </span>
              {openSections.profileCompleteness ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.profileCompleteness && (
            <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600">
              {report.sections.profileCompleteness.missingFields.length > 0 ? (
                <div>
                  <p className="font-semibold text-rose-700 mb-1">
                    {lang === 'hi' ? 'अधूरी जानकारी:' : 'Missing Fields:'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {report.sections.profileCompleteness.missingFields.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                  <div className="mt-2.5">
                    <Link href="/profile" className="btn btn-xs bg-[#003366] hover:bg-[#002244] text-white border-0 min-h-[30px] rounded-lg px-2.5">
                      {lang === 'hi' ? 'प्रोफ़ाइल पूरी करें →' : 'Complete Profile →'}
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-emerald-700 font-semibold">
                  ✓ {lang === 'hi' ? 'सभी आवश्यक फ़ील्ड्स प्रोफ़ाइल में दर्ज हैं।' : 'All core application profile fields are recorded.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 6: Official Portal and Window */}
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            onClick={() => toggleSection('applicationWindow')}
            className="w-full p-4 flex flex-row items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {lang === 'hi' ? '6. आधिकारिक पोर्टल एवं समय-सीमा' : '6. Official Portal & Window'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? `पोर्टल स्थिति: ${scheme.applicationWindow.status.toUpperCase()}` : `Portal status: ${scheme.applicationWindow.status.toUpperCase()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-semibold uppercase">
                {scheme.applicationWindow.status}
              </span>
              {openSections.applicationWindow ? (
                <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          </button>
          {openSections.applicationWindow && (
            <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              {/* Saffron Warning Box (Rule P8) */}
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                <p className="text-xs text-amber-950 font-medium">
                  {lang === 'hi' ? scheme.applicationWindow.portalNoticeHi : scheme.applicationWindow.portalNoticeEn}
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>
                  {scheme.applicationWindow.closingDate
                    ? `Closing Date: ${scheme.applicationWindow.closingDate}`
                    : 'Check live portal for closing dates'}
                </span>
                <a
                  href={scheme.officialSource.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>{lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Open Portal'}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Student Final Review & Confirmation */}
        <div className="card bg-white border border-teal-300 shadow-xs rounded-2xl">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                7
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {lang === 'hi' ? '7. छात्र अंतिम समीक्षा एवं पुष्टि' : '7. Final Student Review & Confirmation'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              {lang === 'hi'
                ? 'कृपया उपरोक्त सभी 6 अनुभागों की पुष्टि करें। स्कॉलर साथी छात्र की अनुमति के बिना कभी भी फॉर्म स्वतः सबमिट नहीं करती।'
                : 'Confirm that all documents and details match your original records. ScholarSaathi never automatically submits your application.'}
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={handleToggleConfirmation}
                  className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded"
                />
                <span className="text-xs font-medium text-slate-800">
                  {lang === 'hi'
                    ? 'मैंने सभी 6 जाँच अनुभागों की समीक्षा कर ली है। मेरे सभी आवश्यक दस्तावेज़ उपलब्ध और सुसंगत हैं।'
                    : 'I have reviewed all 6 readiness sections. All required documents are available, legible, and match my official records.'}
                </span>
              </label>
            </div>

            {report.overallState === 'STUDENT_CONFIRMED_READY' && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  {lang === 'hi'
                    ? 'बधाई! आपकी आवेदन तैयारी चेकलिस्ट पूरी हो गई है। अब आप आधिकारिक पोर्टल पर आवेदन करने के लिए तैयार हैं।'
                    : 'Great! Your application readiness checklist is confirmed. You are technically prepared to proceed to the official portal.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Hand-Off Link Button (Rule P3) */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/discovery/${scheme.id}`}
            className="btn btn-sm btn-ghost min-h-[44px] rounded-xl text-slate-700 hover:text-slate-900"
          >
            {lang === 'hi' ? 'योजना विवरण' : 'Scheme Details'}
          </Link>
          <Link
            href={`/assistant/${scheme.id}`}
            className="btn btn-sm btn-outline border-teal-600 text-teal-700 hover:bg-teal-50 gap-1.5 min-h-[44px] rounded-xl"
          >
            <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'hi' ? 'फॉर्म-सहायक खोलें' : 'Form Assistant'}</span>
          </Link>
        </div>

        <a
          href={scheme.officialSource.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-[#003366] hover:bg-[#002244] text-white border-0 gap-2 min-h-[48px] w-full sm:w-auto rounded-xl shadow-xs font-bold"
        >
          <span>{lang === 'hi' ? 'आधिकारिक पोर्टल पर जाएँ' : 'Proceed to Official Portal'}</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

