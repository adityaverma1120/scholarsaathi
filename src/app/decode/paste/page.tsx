'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Sparkles, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { sanitiseText } from '../../../lib/sanitise/sanitiser';
import { scoreEntries } from '../../../lib/matcher/scorer';
import { reconcileMatches } from '../../../lib/ai/reconcile';
import MatchingOverlay from '../../../components/MatchingOverlay';
import libraryData from '../../../../data/library.json' with { type: 'json' };

const SAMPLE_REMARKS = [
  'Application marked defective by Institute Nodal Officer',
  'Pending for Verification at Institute Level',
  'Application Rejected by Institute Nodal Officer',
  'Bank Account Validation Failed: Name mismatch or IFSC invalid',
  'Income certificate document not clear please re-upload'
];

export default function PasteDecodePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [piiConfirmed, setPiiConfirmed] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const charCount = input.length;
  const isTooShort = charCount > 0 && charCount < 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (val.length > 1000) {
      val = val.slice(0, 1000);
      setWarningMessage('Remarks over 1000 characters are automatically truncated.');
    } else {
      setWarningMessage(null);
    }
    setInput(val);
  };

  const handleSampleClick = (sample: string) => {
    setInput(sample);
    setWarningMessage(null);
    setPiiConfirmed(false);
  };

  const handleDecode = () => {
    if (charCount < 3) return;

    // 1. Sanitize text for PII (Runs before everything)
    const sanitised = sanitiseText(input);

    if (sanitised.hasPii && !piiConfirmed) {
      setWarningMessage(
        `Personal identifiers (${sanitised.piiTypes.join(', ')}) were masked in-place with [ID] / [NUM]. Please review and tap again to confirm.`
      );
      setInput(sanitised.maskedText);
      setPiiConfirmed(true);
      return;
    }

    // 2. Open matching progress overlay (S06)
    setIsMatching(true);

    // 3. Local scoring
    const localOutcome = scoreEntries(sanitised.maskedText, libraryData as any);

    // 4. Asynchronous AI request with client UX timeout cap (3.0s)
    const fetchAi = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3.0s cap
        const res = await fetch('/api/understand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sanitised.maskedText }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Ignore AI failure and fall back locally
      }
      return null;
    };

    // Minimum delay for realistic feel (1.0s if local confident, up to 1.8s)
    const minDelay = localOutcome.band === 'CONFIDENT' ? 1000 : 1600;
    const start = Date.now();

    fetchAi().then((aiResult) => {
      const elapsed = Date.now() - start;
      const remainingDelay = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        // Reconcile Local and AI matching decisions
        const reconciled = reconcileMatches(localOutcome, aiResult, libraryData as any);

        if (reconciled.action === 'auto_open' && reconciled.selectedEntryId) {
          router.push(
            `/card/${reconciled.selectedEntryId}?path=${reconciled.match_path}&agree=${reconciled.agreement}&why=${encodeURIComponent(reconciled.why_terms.join(','))}`
          );
        } else if (reconciled.action === 'choose') {
          router.push(
            `/decode/choose?q=${encodeURIComponent(sanitised.maskedText)}&path=${reconciled.match_path}&agree=${reconciled.agreement}`
          );
        } else {
          router.push(`/no-match?q=${encodeURIComponent(sanitised.maskedText)}`);
        }
      }, remainingDelay);
    });
  };

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* S06: Matching Progress Overlay */}
      <MatchingOverlay isOpen={isMatching} onCancel={() => setIsMatching(false)} />

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
          {t('pasteHeading')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('pasteSubheading')}
        </p>
      </header>

      {/* PII Masking Warning Banner */}
      {warningMessage && (
        <aside
          role="alert"
          aria-label="Sensitive data warning"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5"
        >
          <AlertCircle size={17} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-bold block">Sensitive Data Detected</span>
            <p>{warningMessage}</p>
          </div>
        </aside>
      )}

      {/* Textarea Input Form */}
      <section className="space-y-2">
        <label htmlFor="rejection-input" className="sr-only">
          Paste scholarship portal rejection remark
        </label>
        <div className="relative">
          <textarea
            id="rejection-input"
            value={input}
            onChange={handleInputChange}
            placeholder={t('pastePlaceholder')}
            rows={5}
            maxLength={1000}
            className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all shadow-xs resize-none"
          />
          <div className="absolute right-3.5 bottom-3.5 text-[11px] font-mono text-slate-400">
            {charCount}/1000
          </div>
        </div>

        {isTooShort && (
          <p className="text-xs text-amber-700 font-medium">
            Please enter at least 3 characters.
          </p>
        )}
      </section>

      {/* Primary Action Button */}
      <div>
        <button
          type="button"
          onClick={handleDecode}
          disabled={charCount < 3 || isMatching}
          className="btn btn-primary w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-2xl shadow-md border-0 min-h-[52px] font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={18} aria-hidden="true" />
          <span>{piiConfirmed ? 'Confirm & Decode Remark' : t('decodeButton')}</span>
        </button>
      </div>

      {/* Sample Remarks (PRD §8.3: Clickable sample chips) */}
      <section className="space-y-2.5 pt-2" aria-label="Sample portal remarks">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {t('samplesHeading')}
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_REMARKS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="text-left p-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-xs text-slate-700 transition-colors shadow-2xs font-medium"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
