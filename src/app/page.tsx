'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CheckCircle2,
  Sparkles,
  ListFilter,
  ClipboardPaste,
  ShieldCheck,
  ArrowRight,
  User,
  FolderLock,
  FileSpreadsheet,
  FileEdit,
  Activity,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="flex flex-col gap-6 py-2 overflow-x-clip">
      {/* 1. Hero Section */}
      <section className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003366] text-xs font-bold tracking-wide">
          <BookOpen className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
          <span>{isHi ? 'विद्यार्थी छात्रवृत्ति सहायता मंच' : 'Student Scholarship Lifecycle Assistant'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight max-w-xl mx-auto leading-tight">
          {isHi
            ? 'छात्रवृत्तियां खोजें, पात्रता जांचें और आवेदन ट्रैक करें'
            : 'Find, Verify & Track Your Scholarships'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {isHi
            ? 'केंद्रीय एवं राज्य छात्रवृत्तियों के लिए संपूर्ण मार्गदर्शिका — पात्रता नियमों की जांच करें, दस्तावेज़ों का मिलान करें, और अस्वीकृत टिप्पणियों को समझें।'
            : 'Plain-language guidance for Indian scholarship students across Central & State schemes. Verify eligibility, prepare documents safely, and decode portal remarks.'}
        </p>
      </section>

      {/* 2. Primary Student Journeys (3 Primary Hero Cards) */}
      <section aria-label="Primary Actions" className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-0.5">
          {isHi ? 'मुख्य सेवाएं' : 'Start Your Scholarship Journey'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Journey 1: Find Scholarships */}
          <Link
            href="/discovery"
            className="group p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] text-left"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                {isHi ? 'छात्रवृत्तियां खोजें' : 'Find Scholarships'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isHi
                  ? 'केंद्रीय, राज्य एवं निजी छात्रवृत्तियों के सत्यापित नियम और विवरण देखें।'
                  : 'Browse verified Central, State, and private schemes with official criteria.'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-700">
              <span>{isHi ? 'योजनाएं देखें' : 'Explore Schemes'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>

          {/* Journey 2: Check Eligibility */}
          <Link
            href="/eligibility"
            className="group p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] text-left"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                {isHi ? 'पात्रता जांचें' : 'Check Eligibility'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isHi
                  ? 'अपनी कक्षा, श्रेणी और आय के आधार पर पारदर्शी नियम सत्यापन।'
                  : 'Deterministic rule checks based on your education, category, state, and income.'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <span>{isHi ? 'पात्रता जांचें' : 'Check My Rules'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>

          {/* Journey 3: Application Readiness & Checklist */}
          <Link
            href="/readiness"
            className="group p-5 rounded-2xl bg-gradient-to-br from-[#003366] to-teal-900 text-white hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] text-left border-0"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-white/15 text-teal-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {isHi ? 'आवेदन तैयारी चेकलिस्ट' : 'Application Readiness'}
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {isHi
                  ? 'योजना-वार आवश्यक दस्तावेज़ों की स्पष्टता, वैधता और 6-चरणीय चेकलिस्ट की जांच करें।'
                  : 'Verify document clarity, eligibility requirements, and readiness before submitting on the portal.'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <span>{isHi ? 'तैयारी जांचें' : 'Check Readiness'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Rejection & Problem Solver Section (For students with existing portal issues) */}
      <section
        aria-label="Portal Remark Decoder"
        className="p-5 rounded-2xl bg-slate-100 border border-slate-300 space-y-3.5"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isHi
                ? 'पोर्टल आवेदन में कोई त्रुटि या टिप्पणी आई है?'
                : 'Facing a Defective, Pending, or Rejected Status?'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {isHi
                ? 'पोर्टल की जटिल टिप्पणियों को सरल भाषा में समझें कि किसे कार्रवाई करनी है (विद्यार्थी, कॉलेज, बैंक) और आगे क्या करना है।'
                : 'Decode confusing remarks into plain language. Find out who must act (You, Institute, Bank, or State) and what steps to take.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/decode/pick"
            className="btn btn-outline bg-white hover:bg-slate-50 border-slate-300 text-slate-800 text-xs font-bold rounded-xl justify-between h-auto py-3 px-4 min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <ListFilter className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
              <span>{isHi ? 'सामान्य टिप्पणियां देखें' : 'Browse Common Remarks'}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </Link>

          <Link
            href="/decode/paste"
            className="btn btn-outline bg-white hover:bg-slate-50 border-slate-300 text-slate-800 text-xs font-bold rounded-xl justify-between h-auto py-3 px-4 min-h-[48px]"
          >
            <div className="flex items-center gap-2.5">
              <ClipboardPaste className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
              <span>{isHi ? 'पोर्टल टिप्पणी पेस्ट करें' : 'Paste Remark Text'}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. Student Toolkit & Preparation (Secondary Tools) */}
      <section aria-label="Student Toolkit" className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-0.5">
          {isHi ? 'छात्र उपकरण एवं तैयारी' : 'Student Toolkit & Preparation'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Tool 1: Student Profile */}
          <Link
            href="/profile"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                {isHi ? 'विद्यार्थी प्रोफ़ाइल' : 'Student Profile'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'व्यक्तिगत एवं शैक्षणिक विवरण जो केवल आपकी डिवाइस पर सुरक्षित रहते हैं।'
                  : 'Manage basic and academic details stored privately on your device.'}
              </p>
            </div>
          </Link>

          {/* Tool 2: Document Vault */}
          <Link
            href="/vault"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
              <FolderLock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {isHi ? 'दस्तावेज़ वॉल्ट' : 'Document Vault'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'अंकतालिका, आय व जाति प्रमाण पत्र की स्पष्टता एवं वैधता जांच।'
                  : 'Upload marksheet, income & caste certificates with clarity checks.'}
              </p>
            </div>
          </Link>

          {/* Tool 3: Cross-Document Checker */}
          <Link
            href="/checker"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                {isHi ? 'दस्तावेज़ मिलान परीक्षक' : 'Document Consistency'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'आधार, 10वीं अंकतालिका और बैंक पासबुक में नाम व जन्मतिथि की एकरूपता जांचें।'
                  : 'Catch spelling and date-of-birth discrepancies before portal submission.'}
              </p>
            </div>
          </Link>

          {/* Tool 4: Application Readiness */}
          <Link
            href="/readiness"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-violet-700 transition-colors">
                {isHi ? 'आवेदन तैयारी चेकलिस्ट' : 'Readiness Checklist'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'प्रत्येक योजना के लिए आवश्यक दस्तावेज़ों एवं शर्तों की चरणबद्ध तैयारी।'
                  : 'Comprehensive scheme-specific readiness and requirement tracking.'}
              </p>
            </div>
          </Link>

          {/* Tool 5: Status Tracker */}
          <Link
            href="/tracker"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                {isHi ? 'स्थिति ट्रैकर एवं शिकायत' : 'Status & Grievance'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'आवेदन की समय-सीमा ट्रैक करें और औपचारिक प्रतिवेदन प्रारूप तैयार करें।'
                  : 'Track application lifecycle and generate formal grievance drafts.'}
              </p>
            </div>
          </Link>

          {/* Tool 6: Deadlines Calendar */}
          <Link
            href="/calendar"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-3 text-left group min-h-[48px]"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-700 transition-colors">
                {isHi ? 'अंतिम तिथियां एवं कैलेंडर' : 'Deadlines & Calendar'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {isHi
                  ? 'सत्यापित पोर्टल तिथियां, सुधार अवधि और व्यक्तिगत अनुस्मारक।'
                  : 'Official portal timelines, correction windows, and .ics calendar sync.'}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Privacy & Zero-Trust Notice (Mandatory P4 / P10) */}
      <aside
        aria-label="Privacy notice"
        className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm shadow-xs"
      >
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            {isHi ? 'गोपनीयता सुरक्षा एवं शून्य डेटा संग्रह' : 'Zero-Trust Privacy & Device Security'}
          </p>
          <p className="text-amber-800 leading-relaxed text-xs">
            {isHi
              ? 'कृपया आधार संख्या, बैंक पासवर्ड, ओटीपी कभी साझा न करें। आपकी व्यक्तिगत प्रोफ़ाइल और दस्तावेज़ केवल आपके ब्राउज़र की निजी मेमोरी में रहते हैं।'
              : 'Never enter Aadhaar numbers, bank account numbers, passwords, or OTP. Your profile and vault documents remain strictly on your device inside encrypted browser storage.'}
          </p>
        </div>
      </aside>

      {/* 6. Fluctuating Deadlines Notice (Rule P8) */}
      <aside
        aria-label="Portal Deadline Notice"
        className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5"
      >
        <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <p className="leading-snug">
          <strong className="text-slate-800">{isHi ? 'महत्वपूर्ण: ' : 'Important: '}</strong>
          {isHi
            ? 'पोर्टल पर तारीख की जांच अवश्य करें। आवेदन की अंतिम तिथियां बदलती रहती हैं।'
            : 'Check the date on the official portal. Application deadlines fluctuate throughout the academic cycle.'}
        </p>
      </aside>

      {/* 7. Footer Quick Navigation */}
      <nav aria-label="Footer Navigation" className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 pb-1">
        <Link href="/about" className="hover:text-slate-800 underline font-medium">
          {isHi ? 'परिचय एवं कार्यप्रणाली' : 'About & How It Works'}
        </Link>
        <span>•</span>
        <Link href="/dashboard" className="hover:text-slate-800 underline font-medium">
          {isHi ? 'विश्लेषण डैशबोर्ड' : 'Community Trends Dashboard'}
        </Link>
        <span>•</span>
        <a
          href="https://scholarships.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-800 underline font-medium"
        >
          {isHi ? 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) ↗' : 'Official NSP Portal ↗'}
        </a>
      </nav>
    </div>
  );
}
