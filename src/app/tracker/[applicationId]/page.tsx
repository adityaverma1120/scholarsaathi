'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  getTrackedApplication,
  updateApplicationStatusInStorage,
  deleteTrackedApplication,
} from '@/lib/tracker/storage';
import {
  type TrackedApplication,
  type ApplicationStatusCategory,
  APPLICATION_STATUS_CATEGORIES,
} from '@/lib/tracker/schema';
import { loadProfile } from '@/lib/profile/storage';
import { type StudentProfile } from '@/lib/profile/schema';
import { generateGrievanceDraft, type GrievanceDraft } from '@/lib/tracker/grievance';
import {
  Activity,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  FileText,
  HelpCircle,
  Send,
  Building,
  User,
  AlertTriangle,
} from 'lucide-react';

const STATUS_OPTIONS: { value: ApplicationStatusCategory; labelEn: string; labelHi: string }[] = [
  { value: 'drafting', labelEn: 'Drafting Application', labelHi: 'आवेदन प्रारूप तैयार हो रहा है' },
  { value: 'ready_to_apply', labelEn: 'Ready for Portal Submission', labelHi: 'पोर्टल पर जमा करने हेतु तैयार' },
  { value: 'submitted_pending_institute', labelEn: 'Submitted — Pending Institute Verification', labelHi: 'जमा किया गया — संस्थान सत्यापन हेतु लंबित' },
  { value: 'pending_district_state', labelEn: 'Pending District / State Officer Verification', labelHi: 'ज़िला / राज्य स्तरीय अधिकारी सत्यापन हेतु लंबित' },
  { value: 'defective_correction_needed', labelEn: 'Defective — Correction Required', labelHi: 'दोषपूर्ण — संशोधन आवश्यक' },
  { value: 'rejected', labelEn: 'Application Rejected', labelHi: 'आवेदन निरस्त / अस्वीकृत' },
  { value: 'sanctioned_payment_pending', labelEn: 'Sanctioned — Payment Pending', labelHi: 'छात्रवृत्ति स्वीकृत — भुगतान लंबित' },
  { value: 'payment_disbursed', labelEn: 'Scholarship Disbursed / Paid', labelHi: 'छात्रवृत्ति राशि अंतरित' },
  { value: 'unknown', labelEn: 'Other / Unrecognised Status', labelHi: 'अन्य / अपरिचित स्थिति' },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.applicationId as string;
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';

  const [application, setApplication] = useState<TrackedApplication | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status update modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatusCategory>('submitted_pending_institute');
  const [newRemark, setNewRemark] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Grievance state
  const [showGrievance, setShowGrievance] = useState<boolean>(false);
  const [grievanceDraft, setGrievanceDraft] = useState<GrievanceDraft | null>(null);
  const [grievanceLang, setGrievanceLang] = useState<'en' | 'hi'>('hi');
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [copiedBody, setCopiedBody] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!applicationId) return;
      setIsLoading(true);
      try {
        const [app, prof] = await Promise.all([
          getTrackedApplication(applicationId),
          loadProfile(),
        ]);
        setApplication(app);
        setProfile(prof);
        if (app) {
          setNewStatus(app.currentStatus);
          const draft = generateGrievanceDraft(app, prof);
          setGrievanceDraft(draft);
        }
      } catch (err) {
        console.error('[Tracker Detail] Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [applicationId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    const opt = STATUS_OPTIONS.find(o => o.value === newStatus) || STATUS_OPTIONS[0];
    const updated = await updateApplicationStatusInStorage(
      application.id,
      newStatus,
      opt.labelEn,
      opt.labelHi,
      newRemark || undefined,
      'manual_selection',
      newStatus === 'defective_correction_needed' ? 'nsp_defective_returned' : undefined,
      newNotes || undefined
    );

    if (updated) {
      setApplication(updated);
      setGrievanceDraft(generateGrievanceDraft(updated, profile, newRemark));
      setIsUpdateModalOpen(false);
      setNewRemark('');
      setNewNotes('');
    }
  };

  const handleDeleteApplication = async () => {
    if (!application) return;
    const confirmText =
      lang === 'hi'
        ? 'क्या आप निश्चित रूप से इस आवेदन को टाइमलाइन से हटाना चाहते हैं?'
        : 'Are you sure you want to delete this tracked application from your timeline?';
    if (window.confirm(confirmText)) {
      await deleteTrackedApplication(application.id);
      router.push('/tracker');
    }
  };

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-base-content/50">
        <Activity className="w-8 h-8 animate-spin text-teal-600 mb-2" aria-hidden="true" />
        <p className="text-sm">Loading application history...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-xl font-bold mb-2">Application Not Found</h2>
        <p className="text-sm text-base-content/70 mb-6">
          This application record was not found in your private browser vault.
        </p>
        <Link href="/tracker" className="btn btn-primary min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
          Back to Applications Tracker
        </Link>
      </div>
    );
  }

  let statusBadgeClass = 'badge-neutral';
  let StatusIcon = Clock;
  if (application.currentStatus === 'payment_disbursed') {
    statusBadgeClass = 'badge-success text-white';
    StatusIcon = CheckCircle2;
  } else if (application.currentStatus === 'defective_correction_needed') {
    statusBadgeClass = 'badge-warning text-white';
    StatusIcon = AlertCircle;
  } else if (application.currentStatus === 'rejected') {
    statusBadgeClass = 'badge-error text-white';
    StatusIcon = AlertCircle;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/tracker"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{lang === 'hi' ? 'सभी आवेदन वापस देखें' : 'Back to Applications'}</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-sm badge-outline font-mono text-xs">
              {application.maskedApplicationId}
            </span>
            <span className="text-xs text-base-content/60">
              {application.portalName} • AY {application.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="badge badge-xs badge-neutral text-[10px] py-1 px-1.5">
              Who Acts: {application.whoActs}
            </span>
            <span className={`badge ${statusBadgeClass} gap-1.5 py-3 px-3 font-medium text-xs`}>
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {lang === 'hi' ? application.statusLabelHi : application.statusLabelEn}
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-base-content mb-2">
          {lang === 'hi' ? application.scholarshipNameHi : application.scholarshipNameEn}
        </h1>

        {/* Current Responsibility & Next Action */}
        <div className="p-3 bg-base-200/60 rounded-lg border border-base-200 text-xs sm:text-sm text-base-content/80 mb-3">
          <span className="font-bold text-primary block mb-0.5">
            {lang === 'hi' ? 'अगला कदम / वर्तमान ज़िम्मेदारी:' : 'Next Action / Current Responsibility:'}
          </span>
          <p>{lang === 'hi' ? application.nextActionHi : application.nextActionEn}</p>
        </div>

        {/* Saffron Rule P8 Portal Deadline Box */}
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <strong>{lang === 'hi' ? 'तिथि चेतावनी:' : 'Deadline Warning:'}</strong>{' '}
            {lang === 'hi'
              ? 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें क्योंकि तिथियों में परिवर्तन हो सकता है।'
              : 'Check the date on the official portal as application deadlines fluctuate.'}
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-base-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="btn btn-sm btn-primary min-h-[44px] gap-1.5"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>{lang === 'hi' ? 'नई स्थिति दर्ज करें' : 'Record Status Change'}</span>
            </button>

            {/* Rule P3 External Portal Hand-off Button */}
            <a
              href={application.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline min-h-[44px] gap-1.5"
            >
              <span>{lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Open Official Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrievance(!showGrievance)}
              className={`btn btn-sm ${showGrievance ? 'btn-secondary' : 'btn-outline'} min-h-[44px] gap-1.5`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>{lang === 'hi' ? 'औपचारिक शिकायत प्रारूप' : 'Grievance Draft'}</span>
            </button>

            <button
              onClick={handleDeleteApplication}
              className="btn btn-sm btn-ghost text-error min-h-[44px]"
              title="Delete tracked application"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* If Defective or Rejected: Action Banner linking to Wajah Fix Card */}
      {(application.currentStatus === 'defective_correction_needed' ||
        application.currentStatus === 'rejected') && (
        <div className="card bg-amber-500/10 border border-amber-500/30 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-200">
                {lang === 'hi'
                  ? 'आवेदन में दोष या अस्वीकृति दर्ज की गई है'
                  : 'Action Required: Defective or Rejected Status'}
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300 mt-1">
                {lang === 'hi'
                  ? 'स्कॉलर साथी के 5-चरणीय समाधान कार्ड से जानें कि कौन सी त्रुटि हुई है और पोर्टल पर इसे कैसे ठीक करें।'
                  : 'View ScholarSaathi\'s 5-step Fix Card to understand why your application was flagged and how to resolve it on the portal.'}
              </p>
              <div className="mt-3">
                <Link
                  href={`/card/${application.currentFixCardId || 'nsp_defective_returned'}`}
                  className="btn btn-sm btn-warning text-white min-h-[40px] gap-1.5"
                >
                  <span>{lang === 'hi' ? 'समाधान कार्ड देखें (Fix Card)' : 'View 5-Step Fix Card'}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grievance Assistant Section */}
      {showGrievance && grievanceDraft && (
        <div className="card bg-base-100 shadow-sm border border-secondary/30 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" aria-hidden="true" />
              <h2 className="text-lg font-bold text-base-content">
                {lang === 'hi' ? 'औपचारिक शिकायत / प्रत्यावेदन प्रारूप' : 'Official Grievance / Representation Draft'}
              </h2>
            </div>

            {/* Language toggle for grievance */}
            <div className="flex items-center gap-1 bg-base-200 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setGrievanceLang('hi')}
                className={`px-2.5 py-1 rounded font-medium ${
                  grievanceLang === 'hi' ? 'bg-primary text-white' : 'text-base-content/70'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setGrievanceLang('en')}
                className={`px-2.5 py-1 rounded font-medium ${
                  grievanceLang === 'en' ? 'bg-primary text-white' : 'text-base-content/70'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <p className="text-xs text-base-content/70 mb-4">
            {lang === 'hi'
              ? 'यह प्रारूप आधिकारिक जन शिकायत पोर्टल (CPGRAMS / जनसुनवाई) हेतु तैयार किया गया है। सभी कोष्ठक विवरणों की समीक्षा करें और स्वयं आधिकारिक पोर्टल पर दर्ज करें।'
              : 'This draft is formatted for official public grievance channels (CPGRAMS / Jan Sunwai). Review the bracketed details and submit it yourself on the official portal.'}
          </p>

          {/* Official Routing Information Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-base-200/50 rounded-lg text-xs">
            <div>
              <span className="font-semibold block text-base-content/60">
                {lang === 'hi' ? 'संबंधित प्राधिकारी:' : 'Escalation Authority:'}
              </span>
              <span className="font-medium">
                {grievanceLang === 'hi'
                  ? grievanceDraft.escalationAuthorityHi
                  : grievanceDraft.escalationAuthorityEn}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-base-content/60">
                {lang === 'hi' ? 'आधिकारिक पोर्टल:' : 'Official Grievance Portal:'}
              </span>
              <a
                href={grievanceDraft.officialGrievanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>{grievanceDraft.officialGrievanceUrl}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
            <div>
              <span className="font-semibold block text-base-content/60">
                {lang === 'hi' ? 'हेल्पलाइन नंबर:' : 'Official Helpline:'}
              </span>
              <span className="font-medium">{grievanceDraft.officialHelplineNumber}</span>
            </div>
            <div>
              <span className="font-semibold block text-base-content/60">
                {lang === 'hi' ? 'ईमेल पता:' : 'Helpdesk Email:'}
              </span>
              <span className="font-medium font-mono">{grievanceDraft.officialHelpdeskEmail}</span>
            </div>
          </div>

          {/* Subject Field with Copy */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-base-content/80">
                {lang === 'hi' ? 'विषय (Subject):' : 'Subject:'}
              </label>
              <button
                onClick={() =>
                  copyToClipboard(
                    grievanceLang === 'hi' ? grievanceDraft.subjectHi : grievanceDraft.subjectEn,
                    'subject'
                  )
                }
                className="btn btn-xs btn-ghost gap-1 min-h-[32px]"
              >
                {copiedSubject ? (
                  <>
                    <Check className="w-3 h-3 text-success" aria-hidden="true" />
                    <span className="text-success text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span className="text-[11px]">Copy Subject</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={grievanceLang === 'hi' ? grievanceDraft.subjectHi : grievanceDraft.subjectEn}
              className="input input-bordered input-sm w-full text-xs font-medium bg-base-200/40"
            />
          </div>

          {/* Body Field with Copy */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-base-content/80">
                {lang === 'hi' ? 'शिकायत पत्र पाठ (Letter Body):' : 'Letter Body:'}
              </label>
              <button
                onClick={() =>
                  copyToClipboard(
                    grievanceLang === 'hi' ? grievanceDraft.bodyHi : grievanceDraft.bodyEn,
                    'body'
                  )
                }
                className="btn btn-xs btn-ghost gap-1 min-h-[32px]"
              >
                {copiedBody ? (
                  <>
                    <Check className="w-3 h-3 text-success" aria-hidden="true" />
                    <span className="text-success text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span className="text-[11px]">Copy Body</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={grievanceLang === 'hi' ? grievanceDraft.bodyHi : grievanceDraft.bodyEn}
              className="textarea textarea-bordered w-full text-xs font-mono leading-relaxed bg-base-200/40 p-3"
            />
          </div>

          {/* Attachments checklist */}
          <div className="mb-4 p-3 bg-base-200/40 rounded-lg">
            <h4 className="font-semibold text-xs mb-1.5 text-base-content/90">
              {lang === 'hi' ? 'संलग्न करने योग्य दस्तावेज़:' : 'Recommended Attachments:'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-base-content/70">
              {(grievanceLang === 'hi'
                ? grievanceDraft.requiredAttachmentsHi
                : grievanceDraft.requiredAttachmentsEn
              ).map((att, i) => (
                <li key={i}>{att}</li>
              ))}
            </ul>
          </div>

          {/* Submission Instructions */}
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <h4 className="font-semibold text-xs text-teal-950 dark:text-teal-200 mb-1">
              {lang === 'hi' ? 'जमा करने के निर्देश:' : 'Submission Instructions:'}
            </h4>
            <div className="space-y-1 text-xs text-teal-900/90 dark:text-teal-300">
              {(grievanceLang === 'hi'
                ? grievanceDraft.submissionInstructionsHi
                : grievanceDraft.submissionInstructionsEn
              ).map((ins, i) => (
                <p key={i}>{ins}</p>
              ))}
            </div>
            <div className="mt-3">
              <a
                href={grievanceDraft.officialGrievanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-primary gap-1 min-h-[36px]"
              >
                <span>
                  {lang === 'hi' ? 'आधिकारिक शिकायत पोर्टल खोलें' : 'Open Grievance Portal'}
                </span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Timeline */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-bold text-base-content">
              {lang === 'hi' ? 'आवेदन का इतिहास एवं घटनाक्रम' : 'Application Event History'}
            </h2>
          </div>
          <span className="text-xs text-base-content/60">
            {application.timelineEvents.length} {lang === 'hi' ? 'घटनाएं दर्ज' : 'event(s)'}
          </span>
        </div>

        <div className="relative border-l-2 border-primary/20 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
          {application.timelineEvents.map((event, index) => {
            const isLatest = index === 0;
            return (
              <div key={event.id} className="relative">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[25px] sm:-left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    isLatest
                      ? 'bg-primary border-primary text-white'
                      : 'bg-base-100 border-base-300 text-base-content/50'
                  }`}
                >
                  <Clock className="w-3 h-3" aria-hidden="true" />
                </div>

                {/* Event Card */}
                <div
                  className={`p-3.5 rounded-lg border text-xs sm:text-sm ${
                    isLatest
                      ? 'bg-primary/5 border-primary/30 shadow-xs'
                      : 'bg-base-200/30 border-base-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-base-content text-sm sm:text-base">
                      {lang === 'hi' ? event.statusLabelHi : event.statusLabelEn}
                    </span>
                    <span className="text-xs text-base-content/60 font-mono">
                      {new Date(event.recordedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-xs badge-neutral text-[10px]">
                      Who Acts: {event.whoActs}
                    </span>
                    <span className="text-[11px] text-base-content/60 capitalize">
                      Recorded via: {event.inputMethod.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {event.rawRemark && (
                    <div className="p-2 bg-base-100 rounded border border-base-200 font-mono text-xs text-base-content/80 mb-2">
                      <span className="font-semibold block text-[10px] text-base-content/50">
                        {lang === 'hi' ? 'पोर्टल टिप्पणी / रिमार्क:' : 'Portal Remark:'}
                      </span>
                      {event.rawRemark}
                    </div>
                  )}

                  {event.notes && (
                    <p className="text-xs text-base-content/70 italic">
                      &quot;{event.notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Status Change Modal */}
      {isUpdateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-5 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl">
            <h3 className="font-bold text-lg mb-3 text-slate-900">
              {lang === 'hi' ? 'नई स्थिति दर्ज करें' : 'Record Status Change'}
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5">
              <div>
                <label htmlFor="update-new-status" className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'नई स्थिति चुनें' : 'Select New Status'}
                </label>
                <select
                  id="update-new-status"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ApplicationStatusCategory)}
                  className="select select-bordered select-sm w-full min-h-[44px] text-xs bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  required
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="update-portal-remark" className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'पोर्टल टिप्पणी / रिमार्क (वैकल्पिक)' : 'Portal Remark (Optional)'}
                </label>
                <textarea
                  id="update-portal-remark"
                  value={newRemark}
                  onChange={e => setNewRemark(e.target.value)}
                  placeholder="e.g. Returned with defect: Bonafide certificate missing stamp"
                  rows={2}
                  className="textarea textarea-bordered textarea-sm w-full text-xs bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label htmlFor="update-personal-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'निजी नोट्स (वैकल्पिक)' : 'Personal Notes (Optional)'}
                </label>
                <textarea
                  id="update-personal-notes"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Visited college nodal desk on Tuesday; gave updated certificate."
                  rows={2}
                  className="textarea textarea-bordered textarea-sm w-full text-xs bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="modal-action mt-4 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="btn btn-sm btn-ghost min-h-[40px] text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white min-h-[40px] rounded-xl font-bold px-4"
                >
                  {lang === 'hi' ? 'स्थिति अपडेट करें' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

