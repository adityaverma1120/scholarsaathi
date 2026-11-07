'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ExternalLink,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building2,
  UserCheck,
  CreditCard,
  Landmark,
  HelpCircle,
  MessageSquare,
  Volume2,
  Share2,
  Printer,
  FileText,
  Check,
  AlertTriangle,
  ShieldCheck,
  Info,
  Flag,
  X,
  Sparkles,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getFaultConfig } from '../../../lib/library/faultMap';
import { composeWhyLine, type MatchPathType, type AgreementType } from '../../../lib/ai/why';
import libraryData from '../../../../data/library.json' with { type: 'json' };
import type { LibraryEntry } from '../../../lib/library/types';

interface FixCardProps {
  params: Promise<{ entryId: string }>;
}

function FixCardContent({ entryId }: { entryId: string }) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const pathParam = (searchParams?.get('path') as MatchPathType) || 'local';
  const agreeParam = (searchParams?.get('agree') as AgreementType) || 'local_only';
  const whyParam = searchParams?.get('why');

  const entries = libraryData as unknown as LibraryEntry[];
  const entry = entries.find((e) => e.id === entryId) || entries[0];

  const matchedTerms = whyParam
    ? whyParam.split(',').filter(Boolean)
    : (entry.triggers || []).slice(0, 2);

  const whyLine = composeWhyLine({
    match_path: pathParam,
    agreement: agreeParam,
    matched_terms: matchedTerms,
    entry_category: entry.category,
    who_acts: entry.who_acts,
  });

  const isVerified = entry.status === 'verified';
  const faultConfig = getFaultConfig(entry.who_acts);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('wrong_meaning');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Anonymous Event Telemetry: Fire-and-forget ONLY IF user opted in via localStorage
  useEffect(() => {
    try {
      const consent = typeof window !== 'undefined' && localStorage.getItem('wajah.consent.stats') === 'true';
      if (consent) {
        let faultLabel: 'student' | 'institute_officer' | 'bank' | 'unsure' = 'unsure';
        if (entry.who_acts === 'student') faultLabel = 'student';
        else if (entry.who_acts === 'institute') faultLabel = 'institute_officer';
        else if (entry.who_acts === 'bank') faultLabel = 'bank';

        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry_id: entry.id,
            fault_label: faultLabel,
            match_path: pathParam,
            outcome: 'matched',
            consent: true,
          }),
        }).catch(() => {});
      }
    } catch {}
  }, [entry.id, entry.who_acts, pathParam]);

  const getFaultIcon = () => {
    switch (entry.who_acts) {
      case 'student': return <UserCheck size={20} aria-hidden="true" />;
      case 'institute': return <Building2 size={20} aria-hidden="true" />;
      case 'district_state': return <Landmark size={20} aria-hidden="true" />;
      case 'bank': return <CreditCard size={20} aria-hidden="true" />;
      default: return <HelpCircle size={20} aria-hidden="true" />;
    }
  };

  const getConfidenceBadge = () => {
    if (agreeParam === 'agree' || pathParam === 'both') {
      return (
        <span className="badge badge-sm bg-emerald-50 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1">
          <CheckCircle2 size={12} className="text-emerald-600" aria-hidden="true" />
          <span>{language === 'hi' ? 'उच्च विश्वास मिलान' : 'High Confidence Match'}</span>
        </span>
      );
    }
    if (pathParam === 'chosen') {
      return (
        <span className="badge badge-sm bg-teal-50 text-teal-800 border-teal-300 font-bold flex items-center gap-1">
          <UserCheck size={12} className="text-teal-600" aria-hidden="true" />
          <span>{language === 'hi' ? 'सत्यापित चयन' : 'Student Selected'}</span>
        </span>
      );
    }
    if (pathParam === 'ai') {
      return (
        <span className="badge badge-sm bg-indigo-50 text-indigo-800 border-indigo-300 font-bold flex items-center gap-1">
          <Sparkles size={12} className="text-indigo-600" aria-hidden="true" />
          <span>{language === 'hi' ? 'एआई समर्थित मिलान' : 'AI Assisted Match'}</span>
        </span>
      );
    }
    return (
      <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-semibold flex items-center gap-1">
        <ShieldCheck size={12} className="text-slate-600" aria-hidden="true" />
        <span>{language === 'hi' ? 'सुसंगत मिलान' : 'Verified Match'}</span>
      </span>
    );
  };

  const handleAudioPlayback = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const respText = language === 'hi'
      ? `${faultConfig.label.hi}। ${entry.cause.hi}। ${entry.steps.map(s => `${s.step_number}. ${s.where.hi}`).join('. ')}`
      : `${faultConfig.label.en}. ${entry.cause.en}. ${entry.steps.map(s => `${s.step_number}. ${s.where.en}`).join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(respText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `ScholarSaathi Guidance: ${entry.what_the_screen_says}`,
      text: `Remedy steps for scholarship status: "${entry.what_the_screen_says}"`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      } catch {}
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: entry.id,
          category: feedbackCategory,
          note: feedbackNote.trim() ? feedbackNote.trim().slice(0, 300) : null,
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setIsFeedbackOpen(false);
          setFeedbackSubmitted(false);
          setFeedbackNote('');
        }, 2200);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const officialUrl = isVerified && entry.official_destination
    ? entry.official_destination.url
    : 'https://scholarships.gov.in/';

  const officialLabel = isVerified && entry.official_destination
    ? (language === 'hi' ? entry.official_destination.label.hi : entry.official_destination.label.en)
    : t('openPortalBtn');

  return (
    <article className="flex flex-col gap-5 py-2">
      {/* Back button */}
      <div className="no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('backToHome')}</span>
        </Link>
      </div>

      {/* DRAFT / VERIFIED Status Banner */}
      {!isVerified ? (
        <aside
          role="note"
          aria-label="Draft entry status warning"
          className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 text-xs leading-relaxed"
        >
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-sm bg-amber-200 text-amber-900 font-extrabold uppercase tracking-wider border border-amber-400">
                DRAFT ENTRY
              </span>
              <span className="font-bold text-amber-900">
                {language === 'hi' ? 'अपुष्ट नमूना प्रविष्टि' : 'Unverified Sample Data'}
              </span>
            </div>
            <p className="text-amber-900">
              {language === 'hi'
                ? 'यह प्रविष्टि प्रोटोटाइप परीक्षण हेतु है और इसे 2 स्वतंत्र परीक्षकों द्वारा आधिकारिक रूप से सत्यापित नहीं किया गया है। निश्चित तिथियों और नियमों के लिए सदैव scholarships.gov.in देखें।'
                : 'This entry is based on unverified sample data for prototype demonstration. Final deadlines and rules must always be verified on scholarships.gov.in.'}
            </p>
          </div>
        </aside>
      ) : (
        <aside
          role="note"
          aria-label="Verified entry status"
          className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex items-center gap-2.5 text-xs font-medium"
        >
          <ShieldCheck size={18} className="text-teal-700 shrink-0" aria-hidden="true" />
          <div>
            <span className="badge badge-xs bg-teal-200 text-teal-900 font-bold uppercase tracking-wider mr-2 border border-teal-300">
              VERIFIED
            </span>
            <span>
              {language === 'hi'
                ? 'यह मार्गदर्शन आधिकारिक दिशा-निर्देशों से सत्यापित है।'
                : 'This guidance has been verified against official guidelines by 2 reviewers.'}
            </span>
          </div>
        </aside>
      )}

      {/* Responsibility & Multi-Attribute Fault Badge (P9: text + icon + border + color) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border-2 ${faultConfig.borderColor} border-${faultConfig.borderStyle} bg-white shadow-sm flex items-start gap-3.5 print-card`}
      >
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0 mt-0.5 border border-slate-200">
          {getFaultIcon()}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg text-slate-900">
              {entry.responsibility_label
                ? (language === 'hi' ? entry.responsibility_label.hi : entry.responsibility_label.en)
                : (language === 'hi' ? faultConfig.label.hi : faultConfig.label.en)}
            </span>
            <span className="badge badge-sm bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
              Who Acts: {entry.who_acts}
            </span>
            {getConfidenceBadge()}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {language === 'hi' ? faultConfig.description.hi : faultConfig.description.en}
          </p>
        </div>
      </div>

      {/* Portal Remark Box vs What It Means vs What System Infers */}
      <section className="space-y-3 print-card">
        {/* Exact Portal Remark (Original Message) */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {t('portalStatusLabel')}
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-950 font-mono">
            "{entry.what_the_screen_says}"
          </p>
        </div>

        {/* Evidence-grounded Why-This-Match Box */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-3">
          <Sparkles size={17} className="text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5 flex-1">
            <span className="font-bold text-indigo-950 block">
              {language === 'hi' ? 'यह सुझाव क्यों:' : 'Why this match:'}
            </span>
            <p className="text-indigo-900 leading-relaxed font-medium">
              {language === 'hi' ? whyLine.hi : whyLine.en}
            </p>
          </div>
        </div>

        {/* What the Message Usually Means */}
        <div className="p-4.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1.5 flex items-center gap-1.5">
            <Info size={14} className="text-teal-700" aria-hidden="true" />
            <span>{t('plainMeaningLabel')}</span>
          </p>
          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
            {language === 'hi' ? entry.cause.hi : entry.cause.en}
          </p>
          <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
            {language === 'hi' ? entry.cause.en : entry.cause.hi}
          </p>
        </div>

        {/* What the System Infers */}
        {entry.inferred_meaning && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
              {language === 'hi' ? 'प्रणाली का निष्कर्ष' : 'What the System Infers'}
            </p>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {language === 'hi' ? entry.inferred_meaning.hi : entry.inferred_meaning.en}
            </p>
          </div>
        )}
      </section>

      {/* Ordered Action Steps (<= 5 steps with Where, Carry, Say) */}
      <section className="space-y-3 print-card">
        <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={19} className="text-[#0d9488]" aria-hidden="true" />
          <span>{t('actionStepsHeading')} ({entry.steps.length} Steps)</span>
        </h2>

        <div className="space-y-2.5">
          {entry.steps.map((step) => (
            <div
              key={step.step_number}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                {step.step_number}
              </span>
              <div className="space-y-2 flex-1">
                {/* Where to go */}
                <div>
                  <p className="font-bold text-slate-900">
                    {language === 'hi' ? step.where.hi : step.where.en}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong className="text-slate-700">{language === 'hi' ? 'स्थान / पटल: ' : 'Where: '}</strong>
                    {language === 'hi' ? step.where.hi : step.where.en}
                  </p>
                </div>

                {/* What to carry */}
                {step.carry && step.carry.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-700 mb-1">
                      {language === 'hi' ? 'साथ ले जाने योग्य दस्तावेज / साक्ष्य:' : 'What to Carry / Have Ready:'}
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {step.carry.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What to say */}
                {step.say && (
                  <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
                    <p className="font-semibold text-teal-900 mb-0.5 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-teal-700" aria-hidden="true" />
                      <span>{language === 'hi' ? 'अधिकारी से क्या कहें:' : 'What to Say to the Official:'}</span>
                    </p>
                    <p className="italic text-slate-800">
                      "{language === 'hi' ? step.say.hi : step.say.en}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saffron Fluctuating Deadline Warning Box (P8 Invariant) */}
      <aside
        role="alert"
        aria-label="Portal deadline warning"
        className="p-4 rounded-2xl bg-amber-500/10 border-2 border-[#d97706] text-amber-950 flex items-start gap-3 shadow-xs print-card"
      >
        <Calendar size={20} className="text-[#d97706] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-extrabold text-xs uppercase tracking-wider text-[#b45309]">
            {t('deadlineHeading')}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
            "{t('deadlineNotice')}"
          </p>
          <p className="text-[11px] text-amber-900/80">
            {language === 'hi'
              ? 'पोर्टल की समय-सीमाएं बिना पूर्व सूचना के बदल सकती हैं। अंतिम तिथि जानने के लिए सदैव आधिकारिक पोर्टल देखें।'
              : 'Portal schedules fluctuate dynamically. Always verify the deadline on the official NSP portal directly.'}
          </p>
        </div>
      </aside>

      {/* Official Source & Verification Metadata Box (P5, P6) */}
      <section className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-600 print-card shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
          <ShieldCheck size={16} className="text-teal-700" aria-hidden="true" />
          <span>{t('sourceBoxHeading')}</span>
        </div>
        <div className="space-y-1 pl-1">
          <p>
            <strong className="text-slate-700">{language === 'hi' ? 'नियम संदर्भ: ' : 'Rule Reference: '}</strong>
            {entry.source?.title || entry.source?.issuer || entry.source?.url}
          </p>
          <p>
            <strong className="text-slate-700">{language === 'hi' ? 'सत्यापन तिथि: ' : 'Checked Date: '}</strong>
            {entry.source?.checked_on}
          </p>
          {entry.reviewed_by && (
            <p>
              <strong className="text-slate-700">{language === 'hi' ? 'समीक्षक: ' : 'Reviewed by: '}</strong>
              {entry.reviewed_by.join(', ')}
            </p>
          )}
        </div>
      </section>

      {/* Interactive Helper Toolbar (Audio, Copy, Share, Print, Grievance) */}
      <section className="no-print space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleAudioPlayback}
            className="btn btn-outline border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5"
            aria-label={isPlayingAudio ? 'Stop reading' : 'Read guidance aloud'}
          >
            <Volume2 size={16} className={isPlayingAudio ? 'text-teal-600 animate-pulse' : ''} aria-hidden="true" />
            <span>{isPlayingAudio ? (language === 'hi' ? 'रोकें' : 'Stop') : t('readAloudBtn')}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-outline border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5"
            aria-label="Share this remedy"
          >
            <Share2 size={16} aria-hidden="true" />
            <span>{shareFeedback ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : t('shareBtn')}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5"
            aria-label="Print remedy card"
          >
            <Printer size={16} aria-hidden="true" />
            <span>{t('printBtn')}</span>
          </button>

          {/* Report Inaccuracy Button */}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="btn btn-outline border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5"
            aria-label="Report issue with this card"
          >
            <Flag size={16} className="text-amber-700" aria-hidden="true" />
            <span>Report Error</span>
          </button>
        </div>

        {/* Generate Grievance Button (S10) */}
        <Link
          href={`/card/${entry.id}/grievance`}
          className="btn btn-outline border-teal-600 text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] w-full flex items-center justify-center gap-2"
        >
          <FileText size={17} aria-hidden="true" />
          <span>{t('grievanceDraftBtn')}</span>
        </Link>

        {/* Track in Application Timeline Button */}
        <Link
          href={`/tracker?addCard=${entry.id}`}
          className="btn btn-outline border-indigo-600 text-indigo-800 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] w-full flex items-center justify-center gap-2"
        >
          <Activity size={17} aria-hidden="true" />
          <span>{language === 'hi' ? 'आवेदन टाइमलाइन में यह स्थिति जोड़ें' : 'Add to My Tracked Applications Timeline'}</span>
        </Link>
      </section>

      {/* Mandatory Official Portal Handoff Button (P3 Invariant) */}
      <footer className="pt-2 no-print">
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary bg-[#003366] hover:bg-[#002244] text-white w-full rounded-2xl font-bold text-sm sm:text-base border-0 min-h-[52px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>{officialLabel}</span>
          <ExternalLink size={18} aria-hidden="true" />
        </a>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          {language === 'hi'
            ? 'यह बटन आधिकारिक राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) को नई विंडो में खोलता है।'
            : 'This button opens the official National Scholarship Portal in a new tab.'}
        </p>
      </footer>

      {/* Report Inaccuracy Feedback Modal */}
      {isFeedbackOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Flag size={18} className="text-amber-600" aria-hidden="true" />
                <span>Report Card Inaccuracy</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="btn btn-sm btn-ghost btn-circle"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-1">
                <CheckCircle2 size={24} className="text-teal-700 mx-auto" aria-hidden="true" />
                <p className="font-bold text-sm text-teal-900">Thank you for reporting!</p>
                <p className="text-xs text-teal-700">Your feedback helps our review team keep entries accurate.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Issue Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="select select-sm select-bordered w-full rounded-xl text-xs bg-white text-slate-900"
                  >
                    <option value="wrong_meaning">Wrong meaning or explanation</option>
                    <option value="wrong_step">Incorrect next action steps</option>
                    <option value="out_of_date">Out-of-date portal rules</option>
                    <option value="hard_to_understand">Hard to understand wording</option>
                    <option value="translation">Translation error in Hindi</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Optional Details</span>
                    <span className="text-[11px] font-normal text-slate-400">{feedbackNote.length}/300</span>
                  </div>
                  <textarea
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value.slice(0, 300))}
                    placeholder="Briefly describe what needs correction (never include Aadhaar or phone numbers)..."
                    className="textarea textarea-bordered w-full rounded-xl text-xs bg-slate-50 text-slate-900 h-20 outline-none"
                    maxLength={300}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Personal data is masked automatically before storage.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="btn btn-sm btn-ghost rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold px-4"
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Send Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default function FixCardPage({ params }: FixCardProps) {
  const { entryId } = use(params);
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Loading guidance card...</div>}>
      <FixCardContent entryId={entryId} />
    </Suspense>
  );
}
