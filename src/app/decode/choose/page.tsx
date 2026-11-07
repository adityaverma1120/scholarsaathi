'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { scoreEntries } from '../../../lib/matcher/scorer';
import { composeWhyLine, type MatchPathType, type AgreementType } from '../../../lib/ai/why';
import libraryData from '../../../../data/library.json' with { type: 'json' };
import type { LibraryEntry } from '../../../lib/library/types';

function ChooseCandidateContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const pathParam = (searchParams.get('path') as MatchPathType) || 'chosen';
  const agreeParam = (searchParams.get('agree') as AgreementType) || 'local_only';
  const { t, language } = useLanguage();
  const allEntries = libraryData as unknown as LibraryEntry[];

  // If query is present, run matcher to get ambiguous candidates (up to 3)
  let candidates: LibraryEntry[] = [];
  if (query) {
    const outcome = scoreEntries(query, allEntries);
    if (outcome.candidates && outcome.candidates.length > 0) {
      candidates = outcome.candidates.map(c => c.entry);
    }
  }

  // Fallback to top 3 entries if no query provided
  if (candidates.length === 0) {
    candidates = allEntries.slice(0, 3);
  }

  const isDisagreement = agreeParam === 'disagree';

  return (
    <div className="flex flex-col gap-5 py-2">
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
          {language === 'hi' ? 'निकटतम संदेश चुनें' : 'Choose the Closest Message'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {language === 'hi'
            ? 'आपके संदेश के एक से अधिक संभावित अर्थ हैं। कृपया वह टिप्पणी चुनें जो आपके पोर्टल से मेल खाती है।'
            : 'Your message has more than one plausible interpretation. Please select the remark that corresponds to your portal dashboard.'}
        </p>
      </header>

      {/* Disagreement Notice when Local and AI had conflicting opinions */}
      {isDisagreement && (
        <aside
          role="note"
          aria-label="Multiple interpretations notice"
          className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5 text-xs leading-relaxed"
        >
          <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold block text-amber-950">
              {language === 'hi' ? 'एकाधिक संभावित व्याख्याएं' : 'Multiple Interpretations Found'}
            </span>
            <p className="text-amber-900 mt-0.5">
              {language === 'hi'
                ? 'स्थानीय खोज और एआई सहायक ने अलग-अलग व्याख्याएं सुझाईं। छात्र हित में प्रणाली ने किसी एक को स्वतः चुनने के बजाय दोनों विकल्प आपके समक्ष रखे हैं।'
                : 'Local matching and AI analysis suggested alternative reasons. Following WAJAH safety principles, we present both interpretations so you can select the exact remark shown on your portal.'}
            </p>
          </div>
        </aside>
      )}

      {/* "What We Understood" Context Chips */}
      {query && (
        <section className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" aria-hidden="true" />
            {language === 'hi' ? 'प्राप्त संदेश:' : 'Interpreted Remark:'}
          </span>
          <span className="badge badge-sm bg-white text-indigo-900 border border-indigo-200 font-semibold max-w-full truncate">
            "{query}"
          </span>
        </section>
      )}

      {/* Candidate Cards (Max 3, strictly NO raw percentages or scores per MAT-07 / G5) */}
      <section className="space-y-3 mt-1" aria-label="Possible matches">
        {candidates.slice(0, 3).map((entry, index) => {
          const matchedTerms = (entry.triggers || []).slice(0, 2);
          const whyLine = composeWhyLine({
            match_path: 'chosen',
            agreement: agreeParam,
            matched_terms: matchedTerms,
            entry_category: entry.category,
            who_acts: entry.who_acts,
          });

          return (
            <Link
              key={entry.id}
              href={`/card/${entry.id}?path=chosen&agree=${agreeParam}&why=${encodeURIComponent(matchedTerms.join(','))}`}
              className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex items-start justify-between shadow-xs block group"
            >
              <div className="space-y-2 pr-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                    {entry.who_acts} action
                  </span>
                  {/* Qualitative Confidence Badge (Never raw numbers or %) */}
                  <span className="badge badge-xs bg-teal-50 text-teal-800 border-teal-200 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-teal-600" aria-hidden="true" />
                    <span>{language === 'hi' ? 'संभावित मिलान' : 'Possible Match'}</span>
                  </span>
                  {entry.status === 'draft' && (
                    <span className="badge badge-xs bg-amber-100 text-amber-800 border-amber-300 font-bold">
                      DRAFT
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-950 text-sm sm:text-base group-hover:text-teal-900 transition-colors">
                  "{entry.what_the_screen_says}"
                </p>

                {entry.inferred_meaning && (
                  <p className="text-xs text-slate-700 font-medium">
                    <span className="text-slate-500 font-normal">
                      {language === 'hi' ? 'संभावित अर्थ: ' : 'Inference: '}
                    </span>
                    {language === 'hi' ? entry.inferred_meaning.hi : entry.inferred_meaning.en}
                  </p>
                )}

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? entry.cause.hi : entry.cause.en}
                </p>

                {/* Evidence-grounded Why-This-Match line */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 mt-1">
                  <Sparkles size={13} className="text-teal-700 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    <strong className="text-slate-800">{language === 'hi' ? 'कारण: ' : 'Why: '}</strong>
                    {language === 'hi' ? whyLine.hi : whyLine.en}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0 mt-1"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </section>

      {/* Fallback to Safe Uncertainty (S09) */}
      <div className="text-center pt-3">
        <Link
          href="/no-match"
          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
        >
          {language === 'hi' ? 'इनमें से कोई भी मेरे संदेश से मेल नहीं खाता' : 'None of these match my message'}
        </Link>
      </div>
    </div>
  );
}

export default function ChooseCandidatePage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Loading candidates...</div>}>
      <ChooseCandidateContent />
    </Suspense>
  );
}
