'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  AlertTriangle,
  FileText,
  Sparkles,
  Loader2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { sanitiseText } from '../../../../lib/sanitise/sanitiser';
import libraryData from '../../../../../data/library.json' with { type: 'json' };
import type { LibraryEntry } from '../../../../lib/library/types';

interface GrievancePageProps {
  params: Promise<{ entryId: string }>;
}

export default function GrievancePage({ params }: GrievancePageProps) {
  const { entryId } = use(params);
  const { t, language } = useLanguage();

  const entries = libraryData as unknown as LibraryEntry[];
  const entry = entries.find((e) => e.id === entryId) || entries[0];

  // Form Inputs (Client transient memory only)
  const [studentName, setStudentName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [appId, setAppId] = useState('');

  // AI Assistant Customization Slots
  const [notes, setNotes] = useState('');
  const [daysSince, setDaysSince] = useState<number | ''>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiCustomized, setAiCustomized] = useState(false);
  const [isSimulatedAi, setIsSimulatedAi] = useState(false);
  const [aiSlots, setAiSlots] = useState<{
    grievance_cause?: string;
    actions_summary?: string;
    requested_relief?: string;
  } | null>(null);

  const [hasReviewed, setHasReviewed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const actionOptions = [
    {
      id: 'doc_uploaded',
      en: 'Uploaded corrected or re-scanned document',
      hi: 'संशोधित या पुनः स्कैन किया गया दस्तावेज अपलोड किया',
    },
    {
      id: 'met_officer',
      en: 'Met Institute Nodal Officer / Principal',
      hi: 'संस्थान नोडल अधिकारी / प्राचार्य से व्यक्तिगत भेंट की',
    },
    {
      id: 'bank_seeding',
      en: 'Verified Aadhaar-Bank DBT account seeding',
      hi: 'आधार-बैंक खाता डीबीटी सीडिंग की पुष्टि की',
    },
    {
      id: 'hardcopy_submitted',
      en: 'Submitted physical acknowledgment copy to college',
      hi: 'महाविद्यालय में भौतिक पावती प्रति जमा की',
    },
  ];

  const handleActionToggle = (actionText: string) => {
    setSelectedActions(prev =>
      prev.includes(actionText)
        ? prev.filter(a => a !== actionText)
        : [...prev, actionText]
    );
  };

  const handleAiDraftAssist = async () => {
    setIsDraftingAi(true);
    try {
      // Sanitise client-side before sending
      const cleanNotes = sanitiseText(notes).maskedText.slice(0, 300);

      const res = await fetch('/api/grievance-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: entry.id,
          notes: cleanNotes,
          actions_done: selectedActions,
          days_since: daysSince ? Number(daysSince) : undefined,
          language: language === 'hi' ? 'hi' : 'en',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.slots) {
          setAiSlots(data.slots);
          setAiCustomized(true);
          setIsSimulatedAi(Boolean(data.is_simulated));
        }
      }
    } catch {
      // Fallback: continue with static template
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleResetDraft = () => {
    setAiSlots(null);
    setAiCustomized(false);
    setNotes('');
    setDaysSince('');
    setSelectedActions([]);
  };

  // Generate formal letter text
  const letterSubject = language === 'hi'
    ? `विषय: राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर आवेदन स्थिति "${entry.what_the_screen_says}" के संबंध में औपचारिक प्रतिवेदन।`
    : `Subject: Formal Representation Regarding NSP Application Status - "${entry.what_the_screen_says}"`;

  // Letter Body (Dynamic slots from AI Assistant or Standard reviewed template)
  const causeSection = aiSlots?.grievance_cause || (language === 'hi' ? entry.cause.hi : entry.cause.en);
  const actionsSection = aiSlots?.actions_summary || (language === 'hi'
    ? 'मैंने अपने सभी मूल दस्तावेज एवं आवेदन पत्र का पुनः सत्यापन कर लिया है।'
    : 'I have verified all my physical credentials and certificates as instructed.');
  const reliefSection = aiSlots?.requested_relief || (language === 'hi'
    ? 'अतः आपसे विनम्र अनुरोध है कि कृपया मेरे दस्तावेजों एवं आवेदन का सत्यापन करने की कृपा करें ताकि निर्धारित समय सीमा के भीतर प्रक्रिया पूर्ण हो सके।'
    : 'I kindly request you to examine my records and assist in verifying or resolving this pending remark before the official portal deadline.');

  const letterBody = language === 'hi'
    ? `सेवा में,
नोडल अधिकारी / छात्रवृत्ति प्रकोष्ठ,
${instituteName || '[संस्थान / कॉलेज का नाम]'}

महोदय / महोदया,

सादर निवेदन है कि मैंने राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर छात्रवृत्ति हेतु आवेदन किया है। वर्तमान में मेरे आवेदन की स्थिति निम्नानुसार प्रदर्शित हो रही है:
"${entry.what_the_screen_says}"

विश्लेषण एवं स्थिति विवरण:
${causeSection}

की गई कार्रवाई / सत्यापन स्थिति:
${actionsSection}

मेरा विवरण इस प्रकार है:
- आवेदक का नाम: ${studentName || '[विद्यार्थी का नाम]'}
- आवेदन क्रमांक: ${appId || '[NSP आवेदन आईडी]'}
- संस्थान: ${instituteName || '[संस्थान का नाम]'}

प्रार्थना / अनुरोध:
${reliefSection}

धन्यवाद,
भवदीय,
${studentName || '[हस्ताक्षर / नाम]'}`
    : `To,
The Nodal Officer / Scholarship Cell,
${instituteName || '[Institute / College Name]'}

Respected Sir / Madam,

I have submitted my application on the National Scholarship Portal (NSP). The current status displayed on my dashboard is:
"${entry.what_the_screen_says}"

Status Context & Inference:
${causeSection}

Actions Undertaken / Verification Status:
${actionsSection}

My details for verification:
- Student Name: ${studentName || '[Student Name]'}
- Application ID: ${appId || '[NSP Application ID]'}
- Institution: ${instituteName || '[Institute Name]'}

Requested Action:
${reliefSection}

Thank you.

Yours sincerely,
${studentName || '[Student Signature / Name]'}`;

  const fullLetter = `${letterSubject}\n\n${letterBody}`;

  const handleCopy = async () => {
    if (!hasReviewed) return;
    try {
      await navigator.clipboard.writeText(fullLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleDownload = () => {
    if (!hasReviewed) return;
    const blob = new Blob([fullLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NSP_Grievance_Draft_${entry.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!hasReviewed) return;
    window.print();
  };

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Back button */}
      <div className="no-print">
        <Link
          href={`/card/${entry.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Fix Card</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#003366] tracking-tight">
          {t('grievanceHeading')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('grievanceSubheading')}
        </p>
      </header>

      {/* Mandatory Legal Warning Banner (P2, P3 Invariants) */}
      <aside
        role="alert"
        aria-label="Official submission disclaimer"
        className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-950 font-medium shadow-xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          {t('grievanceBanner')}
        </p>
      </aside>

      {/* Student Details (Client Memory Only) */}
      <section className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-xs no-print">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <FileText size={16} className="text-teal-700" aria-hidden="true" />
          <span>Fill in your details (Optional — stays only in your browser)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t('studentNameLabel')}
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t('instituteNameLabel')}
            </label>
            <input
              type="text"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              placeholder="e.g. Government Degree College"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              {t('applicationIdLabel')}
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="e.g. DL2026..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900 font-mono"
            />
          </div>
        </div>
      </section>

      {/* AI Representation Drafting Assistant (S10 AI Layer) */}
      <section className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3.5 shadow-xs no-print">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" aria-hidden="true" />
            <span>AI Draft Assistant (Customize Representation)</span>
          </h2>
          {aiCustomized && (
            <button
              type="button"
              onClick={handleResetDraft}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-950"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <p className="text-xs text-indigo-900/80 leading-relaxed">
          Select actions you have already taken and provide context. The assistant will format respectful, structured paragraphs for your official representation.
        </p>

        {/* Action Checkboxes */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-slate-700 block">Actions already taken:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {actionOptions.map((opt) => {
              const label = language === 'hi' ? opt.hi : opt.en;
              const isChecked = selectedActions.includes(label);
              return (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-indigo-100/70 border-indigo-400 text-indigo-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleActionToggle(label)}
                    className="checkbox checkbox-xs checkbox-primary rounded mt-0.5"
                  />
                  <span className="leading-tight">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Days Pending & Circumstances Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Days in this status:
            </label>
            <input
              type="number"
              min={0}
              max={365}
              value={daysSince}
              onChange={(e) => setDaysSince(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="e.g. 15"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none text-slate-900 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Additional circumstances (Optional):
              </label>
              <span className="text-[10px] text-slate-400">{notes.length}/300</span>
            </div>
            <input
              type="text"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Principal signed verification but not uploaded on portal..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Trigger AI Assistant Button */}
        <div className="pt-1 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAiDraftAssist}
            disabled={isDraftingAi}
            className="btn btn-sm bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold border-0 min-h-[40px] px-4 flex items-center gap-2 disabled:opacity-50"
          >
            {isDraftingAi ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                <span>Formatting representation...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} aria-hidden="true" />
                <span>{language === 'hi' ? 'एआई सहायक से प्रारूप बनाएं' : 'Format with AI Draft Assistant'}</span>
              </>
            )}
          </button>

          {aiCustomized && (
            <span className="badge badge-sm bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} className="text-indigo-600" aria-hidden="true" />
              <span>
                {isSimulatedAi
                  ? 'Template-based Assistant (Identified Fallback · Zero Personal Data Persisted)'
                  : 'Enhanced with AI Assistant (Zero Personal Data Persisted)'}
              </span>
            </span>
          )}
        </div>
      </section>

      {/* Generated Formal Draft Preview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Generated Draft Letter</h2>
          {aiCustomized && (
            <span className="text-[11px] font-bold text-indigo-700">
              Personalized Representation Ready
            </span>
          )}
        </div>
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-xs overflow-x-auto print-card">
          {fullLetter}
        </div>
      </section>

      {/* Mandatory Review Gate Checkbox */}
      <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition-colors shadow-xs no-print">
        <input
          type="checkbox"
          checked={hasReviewed}
          onChange={(e) => setHasReviewed(e.target.checked)}
          className="checkbox checkbox-sm checkbox-primary rounded mt-0.5"
        />
        <span className="text-xs text-slate-700 font-medium leading-relaxed">
          {t('reviewCheckboxLabel')}
        </span>
      </label>

      {/* Action Toolbar (Copy, Download, Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasReviewed}
          className="btn btn-primary bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold text-xs sm:text-sm border-0 min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {isCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{isCopied ? t('copiedBtn') : t('copyDraftBtn')}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasReviewed}
          className="btn btn-outline border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Download size={16} aria-hidden="true" />
          <span>{t('downloadTxtBtn')}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!hasReviewed}
          className="btn btn-outline border-slate-300 text-slate-800 bg-white hover:bg-slate-100 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Printer size={16} aria-hidden="true" />
          <span>{t('printBtn')}</span>
        </button>
      </div>

      {/* External Portal Hand-off */}
      <div className="pt-2 text-center no-print">
        <a
          href="https://pgportal.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold underline min-h-[44px]"
        >
          <span>Open Official Central Grievance Portal (CPGRAMS)</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
