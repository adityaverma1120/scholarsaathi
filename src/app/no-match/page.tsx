'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, HelpCircle, ListFilter, ExternalLink, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { sanitiseText } from '../../lib/sanitise/sanitiser';

function NoMatchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [text, setText] = useState(initialQuery);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitMiss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || !text.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const sanitised = sanitiseText(text);
      const res = await fetch('/api/miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_masked: sanitised.maskedText.slice(0, 200),
          consent: true,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Failed to submit remark. Please try again later.');
      }
    } catch {
      setError('Network error. Could not submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 py-2">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm mt-2">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
          <HelpCircle size={24} aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            We Could Not Find a Verified Match
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            ScholarSaathi only shows reviewed guidance backed by official sources. We never guess when we are uncertain.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left space-y-1">
          <p className="font-semibold text-slate-800">Possible reasons:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            <li>Your message may belong to a state-specific scholarship portal (e.g. MahaDBT, SSP).</li>
            <li>The wording may have minor typos or unreviewed administrative phrasing.</li>
            <li>We do not have a verified Fix Card for this specific condition yet.</li>
          </ul>
        </div>

        {/* Primary Navigation Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/decode/pick"
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ListFilter size={16} aria-hidden="true" />
            <span>Browse Common Statuses (Tap List)</span>
          </Link>

          <a
            href="https://scholarships.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline border-slate-300 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>Visit Official NSP Helpdesk</span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Opt-in Miss Log Submission (POST /api/miss) */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Send size={16} className="text-teal-700" aria-hidden="true" />
          <h2 className="font-bold text-slate-900 text-sm">
            Help Improve ScholarSaathi: Submit Unmatched Remark
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          If your remark is official, you can submit it anonymously for team review. Personal identifiers are masked automatically before submission, and logs expire after 30 days.
        </p>

        {submitted ? (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2.5 font-medium">
            <CheckCircle2 size={18} className="text-teal-600 shrink-0" aria-hidden="true" />
            <span>Thank you. Your masked remark has been recorded for content review and will automatically expire in 30 days.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitMiss} className="space-y-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 200))}
              placeholder="e.g. Application marked pending at special committee"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-600"
              maxLength={200}
              required
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Zero raw student text: numbers and emails will be masked.</span>
              <span>{text.length}/200</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="checkbox checkbox-xs checkbox-primary rounded mt-0.5"
              />
              <span>
                I agree to submit this masked remark for anonymous content review.
              </span>
            </label>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={!consent || !text.trim() || submitting}
              className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white rounded-xl min-h-[40px] px-4 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{submitting ? 'Submitting...' : 'Submit Anonymous Remark'}</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function NoMatchPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading...</div>}>
      <NoMatchContent />
    </Suspense>
  );
}
