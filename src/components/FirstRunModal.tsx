'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, AlertCircle, Check, X } from 'lucide-react';

export default function FirstRunModal() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [consentStats, setConsentStats] = useState(false);

  useEffect(() => {
    try {
      const noticeAcknowledged = localStorage.getItem('wajah.notice.v1');
      if (!noticeAcknowledged) {
        setIsOpen(true);
      }
    } catch {
      // Storage unavailable, do not block
    }
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem('wajah.notice.v1', 'true');
      localStorage.setItem('wajah.consent.stats', consentStats ? 'true' : 'false');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-slideUp">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 id="modal-title" className="font-bold text-lg text-slate-900 leading-tight">
              {t('firstRunHeading')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ScholarSaathi • Scholarship Assistant
            </p>
          </div>
        </div>

        {/* Language Selection Buttons */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-700">Choose Language / भाषा चुनें:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`btn btn-xs px-3 font-semibold rounded-lg ${language === 'en' ? 'btn-primary bg-[#003366] text-white' : 'btn-ghost text-slate-700'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`btn btn-xs px-3 font-semibold rounded-lg ${language === 'hi' ? 'btn-primary bg-[#003366] text-white' : 'btn-ghost text-slate-700'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* 3 Core Points */}
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
            <p className="leading-relaxed">{t('firstRunPoint1')}</p>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
            <p className="leading-relaxed">{t('firstRunPoint2')}</p>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
            <p className="leading-relaxed">{t('firstRunPoint3')}</p>
          </div>
        </div>

        {/* Anonymous stats consent (Default OFF) */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={consentStats}
            onChange={(e) => setConsentStats(e.target.checked)}
            className="checkbox checkbox-sm checkbox-primary rounded mt-0.5"
          />
          <div className="text-xs text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-900">{t('firstRunStatsLabel')}</p>
            <p className="text-slate-500">{t('firstRunConsentDesc')}</p>
          </div>
        </label>

        {/* Primary Confirmation Action */}
        <button
          type="button"
          onClick={handleConfirm}
          className="btn btn-primary w-full bg-[#003366] hover:bg-[#002244] text-white rounded-xl shadow-md border-0 min-h-[48px] font-bold text-sm tracking-wide"
        >
          {t('firstRunConfirmBtn')}
        </button>
      </div>
    </div>
  );
}

