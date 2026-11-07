'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Database,
  Building2,
  UserCheck,
  CreditCard,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TopMessage {
  entry_id: string;
  title: string;
  fault_label: string;
  count: number | null;
  count_display: string;
  suppressed: boolean;
  suggested_fix?: string;
}

interface DashboardData {
  mock: boolean;
  notice: string;
  data_source: string;
  min_group_size: number;
  total_events?: number;
  top_confusing_messages: TopMessage[];
  fault_split: {
    student: number;
    institute_officer: number;
    bank: number;
    unsure: number;
  };
  weekly_trends: {
    week_start: string;
    count: number | null;
    count_display: string;
    suppressed: boolean;
  }[];
  storage_status: {
    storage: string;
    connected: boolean;
    note: string;
  };
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading dashboard metrics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-red-600">
        Unable to load dashboard data.
      </div>
    );
  }

  const isMock = data.mock === true;

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
        <h1 className="text-xl sm:text-2xl font-bold text-[#003366] tracking-tight flex items-center gap-2">
          <BarChart3 size={24} className="text-teal-700" aria-hidden="true" />
          <span>Analytics & Trend Dashboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Anonymous aggregate metrics of frequent scholarship remarks and fault distribution.
        </p>
      </header>

      {/* Prominent MOCK DATA Banner (P6 / Mandatory Prohibition 6) */}
      {isMock ? (
        <aside
          role="alert"
          aria-label="Mock data banner"
          className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold border-2 border-amber-600 shadow-sm flex items-start gap-3 text-xs sm:text-sm"
        >
          <AlertTriangle size={22} className="shrink-0 text-slate-950 mt-0.5" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="badge badge-sm bg-slate-950 text-white font-extrabold uppercase tracking-widest border-0">
                MOCK DATA
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold">
                SIMULATED DATASET
              </span>
            </div>
            <p className="font-semibold text-slate-950/90 leading-relaxed text-xs">
              {data.notice || 'This dashboard is displaying synthetic demo data. It does not represent real NSP portal statistics or official government records.'}
            </p>
          </div>
        </aside>
      ) : (
        <aside
          role="note"
          aria-label="Live aggregate banner"
          className="p-3.5 rounded-2xl bg-teal-50 text-teal-950 border border-teal-300 shadow-xs flex items-center gap-2.5 text-xs"
        >
          <Database size={18} className="shrink-0 text-teal-700" aria-hidden="true" />
          <span>{data.notice}</span>
        </aside>
      )}

      {/* Fault Split Cards */}
      <section className="space-y-2">
        <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
          Fault Distribution (Who Needs to Act)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
              <UserCheck size={16} className="text-teal-700" aria-hidden="true" />
              <span>Student</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {data.fault_split.student}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Student correction</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
              <Building2 size={16} className="text-indigo-700" aria-hidden="true" />
              <span>Institute</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {data.fault_split.institute_officer}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">College verification</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
              <CreditCard size={16} className="text-amber-700" aria-hidden="true" />
              <span>Bank</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {data.fault_split.bank}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">DBT / Account issue</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
              <HelpCircle size={16} className="text-slate-500" aria-hidden="true" />
              <span>Unsure / State</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {data.fault_split.unsure}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">District / State</p>
          </div>
        </div>
      </section>

      {/* Top 5 Confusing Messages */}
      <section className="space-y-2.5">
        <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
          Top 5 Most Frequent Scholarship Remarks
        </h2>
        {data.top_confusing_messages.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No Rejection Remarks Recorded Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Decodes run privately on-device by default. When students opt in to anonymous statistics, frequent community remarks will appear here with strict k-anonymity privacy protection.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.top_confusing_messages.map((item, idx) => (
              <div
                key={item.entry_id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="badge badge-xs bg-slate-100 text-slate-700 font-bold uppercase">
                      {item.fault_label}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-teal-800">
                    {item.count_display} reports
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  "{item.title || item.entry_id}"
                </p>
                {item.suggested_fix && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">Team guidance: </span>
                    {item.suggested_fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly Trends */}
      <section className="space-y-2">
        <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={16} className="text-indigo-700" aria-hidden="true" />
          <span>Weekly Event Activity</span>
        </h2>
        {data.weekly_trends.length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <p className="text-xs text-slate-500">No weekly trends recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.weekly_trends.map((w) => (
              <div
                key={w.week_start}
                className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs text-center"
              >
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Week of {w.week_start}
                </p>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {w.count_display}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Zero-Trust Privacy & Architecture Card */}
      <section className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldAlert size={16} className="text-slate-700" aria-hidden="true" />
          <span>Privacy & Aggregation Protection</span>
        </div>
        <p>
          • <strong>Zero Identity:</strong> No user accounts, IP addresses, cookies, or device IDs are ever stored.
        </p>
        <p>
          • <strong>$k$-Anonymity Suppression:</strong> Any group with fewer than {data.min_group_size || 10} events is suppressed server-side to prevent identity deduction.
        </p>
        <p>
          • <strong>Backend Status:</strong> {data.storage_status?.note || 'Local development repository'}
        </p>
      </section>
    </div>
  );
}

