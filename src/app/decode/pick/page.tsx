'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, XCircle, ChevronRight, Search, ListFilter } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import libraryData from '../../../../data/library.json' with { type: 'json' };
import type { LibraryEntry } from '../../../lib/library/types';

export default function TapListPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'returned' | 'waiting' | 'not_approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = libraryData as unknown as LibraryEntry[];

  const filteredEntries = entries.filter((entry) => {
    const matchesTab = activeTab === 'all' || entry.category === activeTab;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTab;
    const textMatch =
      entry.what_the_screen_says.toLowerCase().includes(query) ||
      entry.cause.en.toLowerCase().includes(query) ||
      entry.cause.hi.includes(query);
    return matchesTab && textMatch;
  });

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
          Common Scholarship Remarks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tap the remark that closely matches what appears on your portal screen.
        </p>
      </header>

      {/* Search Filter Box */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by keyword (e.g. defective, pending, rejected)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 shadow-xs"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`btn btn-xs rounded-xl font-bold px-3.5 min-h-[36px] ${
            activeTab === 'all'
              ? 'bg-[#003366] text-white border-0'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All ({entries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returned')}
          className={`btn btn-xs rounded-xl font-bold px-3.5 min-h-[36px] ${
            activeTab === 'returned'
              ? 'bg-amber-600 text-white border-0'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Defective / Returned
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('waiting')}
          className={`btn btn-xs rounded-xl font-bold px-3.5 min-h-[36px] ${
            activeTab === 'waiting'
              ? 'bg-indigo-600 text-white border-0'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Pending
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('not_approved')}
          className={`btn btn-xs rounded-xl font-bold px-3.5 min-h-[36px] ${
            activeTab === 'not_approved'
              ? 'bg-rose-600 text-white border-0'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Filtered Entry Rows */}
      <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-500 text-xs sm:text-sm">
            <p>No remarks match your filter.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="text-teal-700 underline font-semibold"
            >
              Reset filter
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/card/${entry.id}`}
              className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-teal-50/30 transition-colors group"
            >
              <div className="space-y-1.5 pr-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    entry.category === 'returned' ? 'bg-amber-100 text-amber-900' :
                    entry.category === 'waiting' ? 'bg-indigo-100 text-indigo-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {entry.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    {entry.who_acts}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-800 transition-colors">
                  {entry.what_the_screen_says}
                </p>
                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                  {language === 'hi' ? entry.cause.hi : entry.cause.en}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" aria-hidden="true" />
            </Link>
          ))
        )}
      </div>

      {/* Fallback to Paste Door */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Can't find your exact message?{' '}
          <Link href="/decode/paste" className="text-teal-700 font-semibold underline">
            Paste your remark here
          </Link>
        </p>
      </div>
    </div>
  );
}
