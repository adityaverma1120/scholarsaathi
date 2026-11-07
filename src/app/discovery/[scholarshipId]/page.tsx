import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScholarshipById } from '@/lib/catalogue/engine';
import {
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  FileText,
  IndianRupee,
  Users,
  FolderLock,
} from 'lucide-react';

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ scholarshipId: string }>;
}) {
  const { scholarshipId } = await params;
  const scholarship = getScholarshipById(scholarshipId);

  if (!scholarship) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-2 max-w-2xl mx-auto w-full">
      {/* Back Link */}
      <div>
        <Link
          href="/discovery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Scholarships</span>
        </Link>
      </div>

      {/* Header Section */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-sm bg-slate-100 text-slate-700 border-0 font-bold">
            {scholarship.code}
          </span>
          <span className="badge badge-sm bg-teal-50 text-teal-800 border-teal-200 font-semibold">
            {scholarship.governmentLevel === 'central' ? 'Central Scheme (All India)' : scholarship.state}
          </span>
          <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 font-bold uppercase">
            {scholarship.applicationWindow.status}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#003366] leading-tight">
          {scholarship.nameEn}
        </h1>
        <p className="text-sm font-semibold text-slate-700">
          {scholarship.nameHi}
        </p>
        <p className="text-xs text-slate-500 font-medium">
          Provider: {scholarship.providerEn} ({scholarship.providerHi})
        </p>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {scholarship.descriptionEn}
        </p>
      </section>

      {/* Mandatory Portal Deadline Warning (Rule P8) */}
      <aside
        aria-label="Portal deadline notice"
        className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm shadow-xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Official Portal Deadline Reminder (Rule P8)</p>
          <p className="text-amber-800 leading-relaxed">
            {scholarship.applicationWindow.portalNoticeEn} Deadlines and portal windows can change at any time.
          </p>
        </div>
      </aside>

      {/* Benefits Breakdown */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Scholarship Benefits & Allowances
        </h2>
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm text-emerald-950 space-y-2">
          <p className="font-medium leading-relaxed">{scholarship.benefits.summaryEn}</p>
          <p className="font-medium leading-relaxed text-emerald-800">{scholarship.benefits.summaryHi}</p>
        </div>
      </section>

      {/* Eligibility Conditions Table */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-[#003366]" aria-hidden="true" />
          Key Eligibility Criteria
        </h2>
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <tbody>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-700 w-1/3">Target Education Level</td>
                <td className="p-3 text-slate-800">
                  {scholarship.targetEducationLevels.map(l => l.replace('_', ' ').toUpperCase()).join(', ')}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-semibold text-slate-700">Eligible Categories</td>
                <td className="p-3 text-slate-800">
                  {scholarship.targetCategories.map(c => c.toUpperCase()).join(', ')}
                </td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-700">Annual Family Income Ceiling</td>
                <td className="p-3 text-slate-800">
                  {scholarship.maxAnnualIncome !== undefined
                    ? `₹${scholarship.maxAnnualIncome.toLocaleString('en-IN')} per year`
                    : 'No specific income cap'}
                </td>
              </tr>
              {scholarship.minPercentageMarks !== undefined && (
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold text-slate-700">Minimum Qualifying Marks</td>
                  <td className="p-3 text-slate-800">{scholarship.minPercentageMarks}% in previous exam</td>
                </tr>
              )}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-semibold text-slate-700">Domicile Requirement</td>
                <td className="p-3 text-slate-800">{scholarship.state}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-700">Application Mode</td>
                <td className="p-3 text-slate-800 uppercase">{scholarship.freshRenewal} (Fresh & Renewal)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Required Vault Documents */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-700" aria-hidden="true" />
          Required Documents
        </h2>
        <p className="text-xs text-slate-500">
          Prepare and verify these documents in your Document Vault before applying:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {scholarship.requiredDocuments.map((docKey, i) => (
            <li key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
              <span className="capitalize">{docKey.replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
        <div className="pt-1">
          <Link href="/vault" className="btn btn-sm btn-outline border-teal-600 text-teal-800 hover:bg-teal-50 min-h-[44px]">
            Open Document Vault
          </Link>
        </div>
      </section>

      {/* Verified Source Hierarchy (Spec 07 Section 3 & 4) */}
      <section className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-700" aria-hidden="true" />
          Verified Source Information
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">Review Status:</span>
            <span className="badge badge-xs bg-emerald-100 text-emerald-800 font-bold uppercase">
              {scholarship.officialSource.reviewStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">Last Verified On:</span>
            <span className="font-medium">{scholarship.officialSource.lastCheckedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">Verified By:</span>
            <span className="font-medium">{scholarship.officialSource.verifiedBy.join(' & ')}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
            <a
              href={scholarship.officialSource.guidelineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Download Official Ministry Guideline (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Application Readiness Checklist Link */}
      <div className="pt-2">
        <Link
          href={`/readiness/${scholarship.id}`}
          className="btn w-full bg-teal-600 hover:bg-teal-700 text-white min-h-[48px] text-sm font-bold gap-2 shadow-sm"
        >
          <FolderLock className="w-4 h-4" aria-hidden="true" />
          <span>Check Application Readiness & Document Checklist</span>
        </Link>
      </div>

      {/* Official Hand-Off Action (Rule P3) */}
      <div className="pt-2">
        <a
          href={scholarship.officialSource.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-full bg-[#003366] hover:bg-[#002244] text-white min-h-[48px] text-sm font-bold gap-2 shadow-sm"
        >
          <span>Apply on Official Portal ({scholarship.officialSource.applicationUrl.replace('https://', '')})</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
        <p className="text-[11px] text-slate-500 text-center mt-2">
          You will leave ScholarSaathi. ScholarSaathi never logs in or edits applications on your behalf (Rule P3).
        </p>
      </div>
    </div>
  );
}

