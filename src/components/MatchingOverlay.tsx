'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Loader2, ShieldCheck, ListFilter, X } from 'lucide-react';
import Link from 'next/link';

interface MatchingOverlayProps {
  isOpen: boolean;
  onCancel: () => void;
}

export default function MatchingOverlay({ isOpen, onCancel }: MatchingOverlayProps) {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Masking sensitive numbers and personal identifiers...',
    'Matching keywords against reviewed scholarship library...',
    'Identifying responsible action party (Student, College, Bank)...',
    'Preparing verified Fix Card...',
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-busy="true"
      aria-label="Matching progress"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl border border-slate-200">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-200 shadow-inner">
          <Loader2 size={32} className="animate-spin text-teal-700" aria-hidden="true" />
        </div>

        {/* Status Text */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">
            {t('matchingOverlayTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium h-6 transition-all">
            {steps[stepIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#003366] h-full transition-all duration-300 rounded-full"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Safety Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldCheck size={16} className="text-teal-600" aria-hidden="true" />
          <span>Local deterministic engine active</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-sm btn-ghost text-slate-600 hover:text-slate-900 min-h-[44px]"
          >
            {t('matchingOverlayCancel')}
          </button>
          <Link
            href="/decode/pick"
            className="text-xs text-teal-700 hover:underline font-semibold"
          >
            Or browse common statuses in the Tap List →
          </Link>
        </div>
      </div>
    </div>
  );
}

