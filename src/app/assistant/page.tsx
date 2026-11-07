'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getAllScholarships } from '@/lib/catalogue/engine';
import { type Scholarship } from '@/lib/catalogue/schema';
import { loadProfile } from '@/lib/profile/storage';
import { loadAllDocuments } from '@/lib/vault/storage';
import { generateApplicationPreparationForm } from '@/lib/assistant/engine';
import { getPreparedForm, getAllPreparedForms, savePreparedForm } from '@/lib/assistant/storage';
import { type ApplicationPreparationForm } from '@/lib/assistant/schema';
import {
  FileEdit,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ClipboardCopy,
  AlertTriangle,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

const ASSISTANT_OVERVIEW_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Form-Filling Assistant & Safe Review', hi: 'फॉर्म-सहायक एवं सुरक्षित समीक्षा' },
  subtitle: {
    en: 'Review official application fields, copy verified values with one click, and prepare for error-free submission.',
    hi: 'आधिकारिक आवेदन फ़ील्ड्स समझें, एक क्लिक में सत्यापित मान कॉपी करें, और त्रुटिहीन आवेदन हेतु तैयार रहें।',
  },
  disclaimer: {
    en: 'Safe Form Assistant: Prepares verified candidate values for quick manual entry. ScholarSaathi never logs in or auto-submits forms (Rule P3).',
    hi: 'सुरक्षित फॉर्म सहायक: त्वरित प्रविष्टि हेतु सत्यापित मान तैयार करता है। स्कॉलर साथी कभी भी स्वतः फॉर्म सबमिट नहीं करती (नियम P3)।',
  },
  openWorkspace: { en: 'Open Form Preparation Workspace', hi: 'फॉर्म तैयारी कार्यक्षेत्र खोलें' },
  portalDateNotice: {
    en: 'Check the date on the portal as application deadlines fluctuate.',
    hi: 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।',
  },
};

export default function AssistantOverviewPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const al = (key: string) => ASSISTANT_OVERVIEW_LABELS[key]?.[lang] || ASSISTANT_OVERVIEW_LABELS[key]?.en || key;

  const [forms, setForms] = useState<ApplicationPreparationForm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initForms() {
      setIsLoading(true);
      try {
        const profile = await loadProfile();
        const docs = await loadAllDocuments();
        const scholarships = getAllScholarships();

        const preparedList: ApplicationPreparationForm[] = [];
        for (const scheme of scholarships) {
          const existing = await getPreparedForm(scheme.id);
          const generated = generateApplicationPreparationForm(scheme, profile, docs, existing);
          await savePreparedForm(generated);
          preparedList.push(generated);
        }
        setForms(preparedList);
      } catch (err) {
        console.error('[Assistant Overview] Failed to load forms:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initForms();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FileEdit className="w-7 h-7 text-indigo-600" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
            {al('title')}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-base-content/70">
          {al('subtitle')}
        </p>

        {/* Rule P3 Boundary Notice */}
        <div className="mt-3 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
            <strong>{lang === 'hi' ? 'सुरक्षा नियम:' : 'Safety Invariant:'}</strong> {al('disclaimer')}
          </p>
        </div>
      </div>

      {/* Forms List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-base-content/50">
          <FileEdit className="w-8 h-8 animate-pulse text-indigo-600 mb-2" aria-hidden="true" />
          <p className="text-sm">Mapping official application fields to your student profile...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map(form => {
            let statusBadge = 'badge-neutral';
            let statusText = lang === 'hi' ? 'प्रारूप' : 'Draft';
            let StatusIcon = Clock;

            if (form.status === 'confirmed_by_student') {
              statusBadge = 'badge-success text-white';
              statusText = lang === 'hi' ? 'छात्र द्वारा सत्यापित' : 'Confirmed Ready';
              StatusIcon = CheckCircle2;
            } else if (form.status === 'in_review') {
              statusBadge = 'badge-warning text-white';
              statusText = lang === 'hi' ? 'समीक्षाधीन' : 'In Review';
              StatusIcon = Clock;
            }

            return (
              <div
                key={form.scholarshipId}
                className="card bg-base-100 shadow-sm border border-base-200 hover:border-indigo-300 transition-colors"
              >
                <div className="card-body p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm badge-outline font-mono text-xs">
                        {form.scholarshipCode}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {form.portalName} • AY {form.academicYear}
                      </span>
                    </div>
                    <span className={`badge ${statusBadge} gap-1.5 py-3 px-3 font-medium text-xs`}>
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {statusText}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-base-content mt-1">
                    {lang === 'hi' ? form.scholarshipNameHi : form.scholarshipNameEn}
                  </h2>

                  {/* Summary Metric Counters */}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {form.summary.preparedCount} / {form.summary.totalFields} Fields Prepared
                    </span>
                    <span className="text-base-content/40">•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      ✓ {form.summary.confirmedCount} Confirmed
                    </span>
                    {form.summary.missingCount > 0 && (
                      <>
                        <span className="text-base-content/40">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {form.summary.missingCount} Missing
                        </span>
                      </>
                    )}
                    {form.summary.conflictCount > 0 && (
                      <>
                        <span className="text-base-content/40">•</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {form.summary.conflictCount} Conflict(s)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Saffron Deadline Warning Box (Rule P8) */}
                  <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      {al('portalDateNotice')}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-base-200">
                    <Link
                      href={`/assistant/${form.scholarshipId}`}
                      className="btn btn-sm btn-primary gap-1.5 min-h-[44px]"
                    >
                      <span>{al('openWorkspace')}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

