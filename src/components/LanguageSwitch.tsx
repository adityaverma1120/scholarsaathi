'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * C-LANG: Interactive Language Switcher (English | हिन्दी)
 * Instant bilingual reactive toggle.
 */
export default function LanguageSwitch() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="btn btn-sm btn-ghost gap-2 border border-slate-300 min-h-[44px] px-3.5 bg-white text-slate-800 hover:bg-slate-100 shadow-xs"
      aria-label={`Current language: ${language === 'en' ? 'English' : 'हिन्दी'}. Tap to switch language.`}
    >
      <Languages size={17} className="text-teal-700" aria-hidden="true" />
      <span className="font-bold text-xs tracking-wider">
        {language === 'en' ? 'English' : 'हिन्दी'}
      </span>
    </button>
  );
}
