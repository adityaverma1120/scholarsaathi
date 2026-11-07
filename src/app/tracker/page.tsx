'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getAllTrackedApplications, saveTrackedApplication } from '@/lib/tracker/storage';
import { type TrackedApplication, maskApplicationId } from '@/lib/tracker/schema';
import { getAllScholarships } from '@/lib/catalogue/engine';
import { type Scholarship } from '@/lib/catalogue/schema';
import {
  Activity,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  MessageSquare,
  FileText,
  Calendar,
} from 'lucide-react';

const TRACKER_OVERVIEW_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Application Status Tracker & Timeline', hi: 'आवेदन स्थिति ट्रैकर एवं समय-सीमा' },
  subtitle: {
    en: 'Track your submitted applications, record portal status changes, and generate formal grievance drafts.',
    hi: 'अपने जमा किए गए आवेदनों को ट्रैक करें, स्थिति परिवर्तन दर्ज करें, और औपचारिक शिकायत प्रारूप तैयार करें।',
  },
  disclaimer: {
    en: 'Student-Recorded Status: Timelines are based on information recorded by you or decoded from your portal remarks. ScholarSaathi does not access your portal account.',
    hi: 'छात्र-दर्ज स्थिति: यह समय-सीमा आपके द्वारा दर्ज या पोर्टल टिप्पणी से डिकोड की गई जानकारी पर आधारित है। स्कॉलर साथी आपके खाते में लॉगिन नहीं करती।',
  },
  trackNewBtn: { en: 'Track an Application', hi: 'नया आवेदन जोड़ें' },
  decodeRemarkBtn: { en: 'Decode a Portal Remark', hi: 'पोर्टल टिप्पणी डिकोड करें' },
  noApplications: {
    en: 'No applications tracked yet. Add an application or decode a portal remark to start your timeline.',
    hi: 'अभी कोई आवेदन ट्रैक नहीं किया गया है। टाइमलाइन शुरू करने के लिए आवेदन जोड़ें या टिप्पणी डिकोड करें।',
  },
  viewTimeline: { en: 'View Detailed Lifecycle Timeline', hi: 'विस्तृत टाइमलाइन देखें' },
  portalDateNotice: {
    en: 'Check the date on the portal as application deadlines fluctuate.',
    hi: 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।',
  },
};

function TrackerOverviewContent() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const searchParams = useSearchParams();
  const addCardParam = searchParams?.get('addCard');
  const tl = (key: string) => TRACKER_OVERVIEW_LABELS[key]?.[lang] || TRACKER_OVERVIEW_LABELS[key]?.en || key;

  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [rawAppId, setRawAppId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const apps = await getAllTrackedApplications();
        const schemes = getAllScholarships();
        setApplications(apps);
        setScholarships(schemes);
        if (schemes.length > 0) {
          setSelectedSchemeId(schemes[0].id);
        }
        if (addCardParam) {
          setIsAddModalOpen(true);
        }
      } catch (err) {
        console.error('[Tracker Overview] Failed to load tracked applications:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addCardParam]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheme = scholarships.find(s => s.id === selectedSchemeId);
    if (!scheme) return;

    const now = new Date().toISOString();
    const maskedId = maskApplicationId(rawAppId);

    const initialStatus = addCardParam ? 'defective_correction_needed' : 'submitted_pending_institute';
    const statusLabelEn = addCardParam
      ? 'Defective — Correction Required'
      : 'Pending for Institute Verification';
    const statusLabelHi = addCardParam
      ? 'दोषपूर्ण — संशोधन आवश्यक'
      : 'संस्थान स्तर पर सत्यापन हेतु लंबित';

    const newApp: TrackedApplication = {
      id: `app_${scheme.id}_${Date.now()}`,
      scholarshipId: scheme.id,
      scholarshipCode: scheme.code,
      scholarshipNameEn: scheme.nameEn,
      scholarshipNameHi: scheme.nameHi,
      portalName: scheme.state === 'Uttar Pradesh' ? 'UP Scholarship Portal' : 'National Scholarship Portal (NSP)',
      portalUrl: scheme.officialSource.applicationUrl,
      academicYear: scheme.academicYear,
      maskedApplicationId: maskedId,
      currentStatus: initialStatus,
      statusLabelEn,
      statusLabelHi,
      whoActs: addCardParam ? 'STUDENT' : 'INSTITUTE',
      currentFixCardId: addCardParam || undefined,
      inputMethod: addCardParam ? 'pasted_remark' : 'manual_selection',
      isLiveLookup: false,
      timelineEvents: [
        {
          id: `evt_init_${Date.now()}`,
          status: initialStatus,
          statusLabelEn,
          statusLabelHi,
          recordedAt: now,
          whoActs: addCardParam ? 'STUDENT' : 'INSTITUTE',
          fixCardId: addCardParam || undefined,
          notes: addCardParam ? 'Linked from Fix Card guidance.' : 'Application registered on the portal.',
          inputMethod: addCardParam ? 'pasted_remark' : 'manual_selection',
        },
      ],
      nextActionEn: addCardParam
        ? 'Review defective fields using Fix Card guidance and re-submit on portal.'
        : 'Submit printed form and document copies to your College Nodal Officer.',
      nextActionHi: addCardParam
        ? 'समाधान कार्ड की सहायता से त्रुटिपूर्ण विवरण सुधारें तथा पोर्टल पर पुनः जमा करें।'
        : 'कॉलेज नोडल अधिकारी के पास आवेदन की प्रति एवं दस्तावेज़ जमा करें।',
      officialHelpdeskUrl: scheme.officialSource.applicationUrl,
      officialGrievanceUrl: scheme.state === 'Uttar Pradesh' ? 'https://jansunwai.up.nic.in' : 'https://pgportal.gov.in',
      createdAt: now,
      updatedAt: now,
    };

    await saveTrackedApplication(newApp);
    setApplications(prev => [newApp, ...prev]);
    setIsAddModalOpen(false);
    setRawAppId('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-7 h-7 text-teal-600" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
            {tl('title')}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-base-content/70">
          {tl('subtitle')}
        </p>

        {/* Rule P2/P3 Boundary Notice */}
        <div className="mt-3 p-3.5 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-200">
            <strong>{lang === 'hi' ? 'महत्वपूर्ण सूचना:' : 'Notice:'}</strong> {tl('disclaimer')}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary gap-1.5 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>{tl('trackNewBtn')}</span>
        </button>

        <div className="flex items-center gap-2">
          <Link href="/decode/paste" className="btn btn-outline min-h-[44px] gap-1.5">
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>{tl('decodeRemarkBtn')}</span>
          </Link>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-base-content/50">
          <Activity className="w-8 h-8 animate-spin text-teal-600 mb-2" aria-hidden="true" />
          <p className="text-sm">Loading application timeline records...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 text-center p-8">
          <Clock className="w-10 h-10 text-base-content/40 mx-auto mb-2" aria-hidden="true" />
          <h3 className="font-semibold text-base mb-1">{tl('noApplications')}</h3>
          <p className="text-xs text-base-content/60 max-w-md mx-auto mb-4">
            Record application IDs and portal remarks to track verification progress across institute, district, and state desks.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-sm btn-primary min-h-[40px]"
            >
              {tl('trackNewBtn')}
            </button>
            <Link href="/decode/paste" className="btn btn-sm btn-outline min-h-[40px]">
              {tl('decodeRemarkBtn')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            let statusBadgeClass = 'badge-neutral';
            let StatusIcon = Clock;
            let borderClass = 'border-base-200';

            if (app.currentStatus === 'payment_disbursed') {
              statusBadgeClass = 'badge-success text-white';
              StatusIcon = CheckCircle2;
              borderClass = 'border-emerald-500/40 bg-emerald-50/10';
            } else if (app.currentStatus === 'defective_correction_needed') {
              statusBadgeClass = 'badge-warning text-white';
              StatusIcon = AlertCircle;
              borderClass = 'border-amber-500/40 bg-amber-50/10';
            } else if (app.currentStatus === 'rejected') {
              statusBadgeClass = 'badge-error text-white';
              StatusIcon = AlertCircle;
              borderClass = 'border-rose-500/30 bg-rose-50/10';
            }

            return (
              <div
                key={app.id}
                className={`card bg-base-100 shadow-sm border ${borderClass} transition-colors`}
              >
                <div className="card-body p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm badge-outline font-mono text-xs">
                        {app.maskedApplicationId}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {app.portalName} • AY {app.academicYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-xs badge-neutral text-[10px] py-1 px-1.5">
                        Who Acts: {app.whoActs}
                      </span>
                      <span className={`badge ${statusBadgeClass} gap-1.5 py-3 px-3 font-medium text-xs`}>
                        <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {lang === 'hi' ? app.statusLabelHi : app.statusLabelEn}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-base-content mt-1">
                    {lang === 'hi' ? app.scholarshipNameHi : app.scholarshipNameEn}
                  </h2>

                  {/* Next Action Box */}
                  <div className="mt-2 p-2.5 bg-base-200/50 rounded-lg border border-base-200 text-xs text-base-content/80">
                    <span className="font-bold text-primary block mb-0.5">
                      {lang === 'hi' ? 'अगला कदम / आवश्यक कार्रवाई:' : 'Next Action / Responsibility:'}
                    </span>
                    <span>{lang === 'hi' ? app.nextActionHi : app.nextActionEn}</span>
                  </div>

                  {/* Timeline event count */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-base-content/60">
                    <span>{app.timelineEvents.length} event(s) recorded in timeline</span>
                    <span>•</span>
                    <span>Updated: {new Date(app.updatedAt).toLocaleDateString('en-IN')}</span>
                  </div>

                  {/* Saffron Deadline Warning Box (Rule P8) */}
                  <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <p className="text-[11px] text-amber-900 dark:text-amber-200">
                      {tl('portalDateNotice')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-base-200">
                    <Link
                      href={`/tracker/${app.id}`}
                      className="btn btn-sm btn-primary gap-1.5 min-h-[44px]"
                    >
                      <span>{tl('viewTimeline')}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track Application Modal */}
      {isAddModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-5 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl">
            <h3 className="font-bold text-lg mb-3 text-slate-900">
              {lang === 'hi' ? 'छात्रवृत्ति आवेदन ट्रैक करें' : 'Track Scholarship Application'}
            </h3>

            {addCardParam && (
              <div className="mb-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900">
                <strong>Linking Fix Card:</strong> {addCardParam}
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-3.5">
              <div>
                <label htmlFor="tracker-select-scheme" className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'छात्रवृत्ति योजना चुनें' : 'Select Scholarship Scheme'}
                </label>
                <select
                  id="tracker-select-scheme"
                  value={selectedSchemeId}
                  onChange={e => setSelectedSchemeId(e.target.value)}
                  className="select select-bordered select-sm w-full min-h-[44px] text-xs bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  required
                >
                  {scholarships.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tracker-app-id" className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'आवेदन संदर्भ संख्या (वैकल्पिक)' : 'Application Reference ID (Optional)'}
                </label>
                <input
                  id="tracker-app-id"
                  type="text"
                  value={rawAppId}
                  onChange={e => setRawAppId(e.target.value)}
                  placeholder="e.g. UP202612345678"
                  className="input input-bordered input-sm w-full min-h-[44px] text-xs font-mono bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Numbers are automatically masked in the UI for privacy (e.g. UP2026****5678).
                </span>
              </div>

              <div className="modal-action mt-4 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-sm btn-ghost min-h-[40px] text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white min-h-[40px] rounded-xl font-bold px-4"
                >
                  {lang === 'hi' ? 'टाइमलाइन में जोड़ें' : 'Add to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackerOverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading applications...</div>}>
      <TrackerOverviewContent />
    </Suspense>
  );
}
