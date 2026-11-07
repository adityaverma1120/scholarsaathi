'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, ExternalLink, Check, Database } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t, language } = useLanguage();
  const [statsConsent, setStatsConsent] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('wajah.consent.stats');
      setStatsConsent(consent === 'true');
    } catch {}
  }, []);

  const handleConsentToggle = (checked: boolean) => {
    setStatsConsent(checked);
    try {
      localStorage.setItem('wajah.consent.stats', checked ? 'true' : 'false');
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t('backToHome')}</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#003366] tracking-tight">
          About ScholarSaathi (स्कॉलर साथी)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Your complete independent scholarship assistant — discover, check, prepare, apply, and track.
        </p>
      </header>

      {/* Principle P1 Banner */}
      <section className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs sm:text-sm space-y-1.5 shadow-xs">
        <p className="font-bold text-amber-400">Independent Prototype • Not an Official Government Service</p>
        <p className="leading-relaxed">
          ScholarSaathi (evolved from the WAJAH prototype) is an independent student-support platform.
          It is not affiliated with the National Scholarship Portal (NSP), the Ministry of Electronics and IT (MeitY),
          state scholarship departments, or any government ministry.
        </p>
      </section>

      {/* Core Operational Principles */}
      <section className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck size={18} className="text-teal-700" aria-hidden="true" />
          <span>Core Operational Invariants</span>
        </h2>
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <p className="font-bold text-slate-900">1. Explains, Never Decides (P2)</p>
            <p className="text-slate-600 leading-relaxed">
              ScholarSaathi explains portal remarks and published eligibility rules. It never determines official approval, promises financial sanctions, or predicts payment disbursement dates.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <p className="font-bold text-slate-900">2. Official Hand-Off (P3)</p>
            <p className="text-slate-600 leading-relaxed">
              Every Fix Card and application guide directs students to official portal actions on <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">scholarships.gov.in</code> or state portals. ScholarSaathi never logs in, edits, or submits forms for students.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <p className="font-bold text-slate-900">3. Human-Reviewed Guidance Only (P5, P6)</p>
            <p className="text-slate-600 leading-relaxed">
              All guidance comes from a reviewed static library with official sources and checked dates. AI never authors scholarship advice.
            </p>
          </div>
        </div>
      </section>

      {/* Zero-Trust Privacy & Consent Toggle */}
      <section id="privacy" className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Lock size={18} className="text-teal-700" aria-hidden="true" />
          <span>Zero-Trust Privacy & Data Governance (DPDP Alignment)</span>
        </h2>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-600 space-y-3 shadow-xs">
          <p className="leading-relaxed">
            ScholarSaathi stores zero student passwords, OTPs, Aadhaar numbers, or bank account details.
            Sensitive identifiers are sanitized and masked in your browser before processing.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <p className="font-bold text-slate-800">Browser Storage Allowlist (Strictly 3 Keys):</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-xs">
              <li>wajah.lang (Language preference: "en" | "hi")</li>
              <li>wajah.notice.v1 (First-run notice acknowledgment)</li>
              <li>wajah.consent.stats (Anonymous telemetry opt-in)</li>
            </ul>
          </div>

          {/* Telemetry Consent Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statsConsent}
                onChange={(e) => handleConsentToggle(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary rounded mt-0.5"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-slate-900 block">
                  Allow anonymous aggregate status counts
                </span>
                <span className="text-slate-500 block">
                  Only records which scholarship remark was matched (at weekly granularity). No personal data or text is ever shared.
                </span>
                {savedFeedback && (
                  <span className="text-teal-700 font-semibold flex items-center gap-1 mt-1">
                    <Check size={14} aria-hidden="true" />
                    Preference saved to browser
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Official Sources Register */}
      <section className="space-y-2">
        <h2 className="font-bold text-sm text-slate-900">Official Government Portals Referenced</h2>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-2 shadow-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="font-semibold text-slate-800">National Scholarship Portal (NSP)</span>
            <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline flex items-center gap-1">
              scholarships.gov.in <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="font-semibold text-slate-800">Public Financial Management System (PFMS)</span>
            <a href="https://pfms.nic.in" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline flex items-center gap-1">
              pfms.nic.in <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-800">Central Grievance Portal (CPGRAMS)</span>
            <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline flex items-center gap-1">
              pgportal.gov.in <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
