'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  type Scholarship,
  type TargetEducationLevel,
  type TargetCategory,
  type ApplicationStatus,
} from '@/lib/catalogue/schema';
import {
  getAllScholarships,
  filterScholarships,
  calculateSchemeMatchRelevance,
  CATALOGUE_COVERAGE_STATEMENT,
} from '@/lib/catalogue/engine';
import { loadProfile } from '@/lib/profile/storage';
import { type StudentProfile } from '@/lib/profile/schema';
import {
  GraduationCap,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  X,
  RotateCcw,
} from 'lucide-react';

const DISCOVERY_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: { en: 'Verified Scholarship Discovery', hi: 'सत्यापित छात्रवृत्ति खोज' },
  subtitle: {
    en: 'Find genuine Central and State government scholarships verified against official notifications.',
    hi: 'आधिकारिक अधिसूचनाओं द्वारा सत्यापित वास्तविक केंद्रीय और राज्य सरकारी छात्रवृत्तियां खोजें।',
  },
  searchPlaceholder: {
    en: 'Search by name, acronym, course or ministry...',
    hi: 'योजना का नाम, संक्षिप्त नाम या मंत्रालय द्वारा खोजें...',
  },
  filterState: { en: 'State / Domicile', hi: 'राज्य / अधिवास' },
  filterLevel: { en: 'Education Level', hi: 'शिक्षा स्तर' },
  filterCategory: { en: 'Category', hi: 'वर्ग / जाति' },
  filterStatus: { en: 'Status', hi: 'स्थिति' },
  allStates: { en: 'All States (Including All-India)', hi: 'सभी राज्य (अखिल भारतीय सहित)' },
  allLevels: { en: 'All Education Levels', hi: 'सभी शिक्षा स्तर' },
  allCategories: { en: 'All Categories', hi: 'सभी वर्ग' },
  allStatuses: { en: 'All Statuses', hi: 'सभी स्थितियाँ' },
  useProfile: { en: 'Filter by My Profile', hi: 'मेरी प्रोफ़ाइल के अनुसार छाँटें' },
  resultsCount: { en: 'verified schemes found', hi: 'सत्यापित योजनाएं मिलीं' },
  noResultsTitle: { en: 'No matching scholarships found', hi: 'कोई छात्रवृत्ति नहीं मिली' },
  noResultsDesc: {
    en: 'Try clearing your filters or searching for general scholarship terms.',
    hi: 'अपने फ़िल्टर हटाकर पुनः प्रयास करें या सामान्य नाम से खोजें।',
  },
  viewDetails: { en: 'View Details', hi: 'विवरण देखें' },
  officialPortal: { en: 'Official Portal', hi: 'आधिकारिक पोर्टल' },
  maxIncome: { en: 'Max Income', hi: 'अधिकतम आय' },
  portalDateWarning: {
    en: 'Deadlines fluctuate. Always check the active date on scholarships.gov.in before applying.',
    hi: 'अंतिम तिथियाँ बदलती रहती हैं। आवेदन से पूर्व आधिकारिक पोर्टल पर सक्रिय तिथि अवश्य देखें।',
  },
};

const EDUCATION_LEVEL_OPTIONS: { value: TargetEducationLevel; labelEn: string; labelHi: string }[] = [
  { value: 'class_9_10', labelEn: 'Class 9–10', labelHi: 'कक्षा 9–10' },
  { value: 'class_11_12', labelEn: 'Class 11–12', labelHi: 'कक्षा 11–12' },
  { value: 'diploma', labelEn: 'Diploma / Polytechnic', labelHi: 'डिप्लोमा / पॉलिटेक्निक' },
  { value: 'undergraduate', labelEn: 'Undergraduate (UG)', labelHi: 'स्नातक (UG)' },
  { value: 'postgraduate', labelEn: 'Postgraduate (PG)', labelHi: 'स्नातकोत्तर (PG)' },
  { value: 'phd', labelEn: 'PhD / Doctoral', labelHi: 'पीएचडी' },
];

const CATEGORY_OPTIONS: { value: TargetCategory; labelEn: string; labelHi: string }[] = [
  { value: 'sc', labelEn: 'SC (Scheduled Caste)', labelHi: 'अनुसूचित जाति (SC)' },
  { value: 'st', labelEn: 'ST (Scheduled Tribe)', labelHi: 'अनुसूचित जनजाति (ST)' },
  { value: 'obc', labelEn: 'OBC (Other Backward Class)', labelHi: 'अन्य पिछड़ा वर्ग (OBC)' },
  { value: 'minority', labelEn: 'Minority Communities', labelHi: 'अल्पसंख्यक समुदाय' },
  { value: 'general', labelEn: 'General / Open', labelHi: 'सामान्य (General)' },
];

export default function DiscoveryPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const dl = (key: string) => DISCOVERY_LABELS[key]?.[lang] || DISCOVERY_LABELS[key]?.en || key;

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<TargetEducationLevel | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<TargetCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [useProfileFilter, setUseProfileFilter] = useState(false);

  useEffect(() => {
    (async () => {
      // In client mode, load from engine (which reads data/scholarships.json)
      const list = getAllScholarships();
      setScholarships(list);

      const p = await loadProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const handleToggleProfileFilter = () => {
    if (!useProfileFilter && profile) {
      if (profile.basic.domicileState) setSelectedState(profile.basic.domicileState);
      if (profile.schemeDependent?.category) setSelectedCategory(profile.schemeDependent.category as TargetCategory);
      setUseProfileFilter(true);
    } else {
      setSelectedState('');
      setSelectedCategory('');
      setUseProfileFilter(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedStatus('');
    setUseProfileFilter(false);
  };

  const isFiltered = Boolean(searchQuery || selectedLevel || selectedCategory || selectedState || selectedStatus || useProfileFilter);

  const filteredSchemes = useMemo(() => {
    return filterScholarships({
      q: searchQuery || undefined,
      state: selectedState || undefined,
      educationLevel: selectedLevel || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
    });
  }, [searchQuery, selectedState, selectedLevel, selectedCategory, selectedStatus]);

  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
            OPEN
          </span>
        );
      case 'upcoming':
        return (
          <span className="badge badge-sm bg-blue-100 text-blue-800 border-blue-300 font-extrabold gap-1">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            UPCOMING
          </span>
        );
      case 'closed':
        return (
          <span className="badge badge-sm bg-slate-100 text-slate-600 border-slate-300 font-semibold">
            CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2 max-w-2xl mx-auto w-full">
      {/* Header */}
      <section className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
          <GraduationCap className="w-4 h-4 text-indigo-700" aria-hidden="true" />
          <span>ScholarSaathi Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
          {dl('title')}
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {dl('subtitle')}
        </p>
      </section>

      {/* Coverage Statement Badge (Spec 07 Section 7) */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 text-xs text-indigo-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold">Official Coverage Statement: </span>
          <span>{CATALOGUE_COVERAGE_STATEMENT[lang]}</span>
        </div>
      </div>

      {/* SEARCH & FILTERS BOX */}
      <section className="card bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="scheme-search" className="sr-only">
            {dl('searchPlaceholder')}
          </label>
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
          <input
            id="scheme-search"
            type="text"
            className="input input-bordered w-full pl-11 pr-10 min-h-[48px] text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl"
            placeholder={dl('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-full min-h-[24px]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label htmlFor="filter-level" className="block text-xs font-semibold text-slate-700 mb-1">
              {dl('filterLevel')}
            </label>
            <select
              id="filter-level"
              className="select select-bordered select-sm w-full min-h-[44px] bg-white text-slate-900 border-slate-300 rounded-xl text-xs sm:text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value as TargetEducationLevel)}
            >
              <option value="">{dl('allLevels')}</option>
              {EDUCATION_LEVEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt[lang === 'hi' ? 'labelHi' : 'labelEn']}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-category" className="block text-xs font-semibold text-slate-700 mb-1">
              {dl('filterCategory')}
            </label>
            <select
              id="filter-category"
              className="select select-bordered select-sm w-full min-h-[44px] bg-white text-slate-900 border-slate-300 rounded-xl text-xs sm:text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as TargetCategory)}
            >
              <option value="">{dl('allCategories')}</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt[lang === 'hi' ? 'labelHi' : 'labelEn']}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions Bar (Profile Filter + Reset + Count) */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {profile?.basic?.displayName && (
              <button
                type="button"
                className={`btn btn-xs min-h-[36px] px-3 gap-1.5 rounded-xl font-semibold transition-all ${
                  useProfileFilter
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
                    : 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={handleToggleProfileFilter}
              >
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{dl('useProfile')} ({profile.basic.domicileState || 'Profile Active'})</span>
              </button>
            )}

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-xs btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[36px] gap-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>{lang === 'hi' ? 'फ़िल्टर हटाएं' : 'Reset'}</span>
              </button>
            )}
          </div>

          <span className="text-xs font-medium text-slate-500">
            <strong className="text-slate-800">{filteredSchemes.length}</strong> {dl('resultsCount')}
          </span>
        </div>
      </section>

      {/* SCHOLARSHIP CARDS LIST */}
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner text-[#003366]" />
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="card bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-3 shadow-xs">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
          <h2 className="font-bold text-slate-800 text-base">{dl('noResultsTitle')}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{dl('noResultsDesc')}</p>
          {isFiltered && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white rounded-xl text-xs font-bold px-4 min-h-[40px]"
              >
                {lang === 'hi' ? 'सभी फ़िल्टर साफ़ करें' : 'Clear All Filters'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredSchemes.map(scheme => {
            const relevance = calculateSchemeMatchRelevance(scheme, profile);

            return (
              <div
                key={scheme.id}
                className="card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 transition-all p-5 space-y-3"
              >
                {/* Header: Title & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-sm bg-slate-100 text-slate-700 border-0 font-bold text-[11px]">
                        {scheme.code}
                      </span>
                      <span className="badge badge-sm bg-teal-50 text-teal-800 border-teal-200 font-semibold text-[11px]">
                        {scheme.governmentLevel === 'central' ? 'Central Gov' : scheme.state}
                      </span>
                      {renderStatusBadge(scheme.applicationWindow.status)}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[#003366] leading-snug">
                      <Link href={`/discovery/${scheme.id}`} className="hover:underline">
                        {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {lang === 'hi' ? scheme.providerHi : scheme.providerEn}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
                </p>

                {/* Key Criteria Pills */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  {scheme.maxAnnualIncome !== undefined && (
                    <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
                      Income &le; ₹{(scheme.maxAnnualIncome / 100000).toFixed(1)} Lakh/yr
                    </span>
                  )}
                  <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
                    Academic Year: {scheme.academicYear}
                  </span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
                    Target: {scheme.targetCategories.map(c => c.toUpperCase()).join(', ')}
                  </span>
                </div>

                {/* Profile Relevance Why-Match Note */}
                {profile?.basic?.displayName && relevance.matchReasonsEn.length > 0 && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-950 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="leading-relaxed">
                      <strong>Why this matches: </strong>
                      {lang === 'hi' ? relevance.matchReasonsHi.join(' ') : relevance.matchReasonsEn.join(' ')}
                    </p>
                  </div>
                )}

                {/* Rule P8 Portal Deadline Warning Box */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
                  <span>{dl('portalDateWarning')}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    href={`/discovery/${scheme.id}`}
                    className="btn btn-sm btn-ghost text-[#003366] hover:bg-slate-100 min-h-[44px] px-3 font-bold text-xs gap-1"
                  >
                    <span>{dl('viewDetails')}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={scheme.officialSource.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white min-h-[44px] px-4 font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <span>{dl('officialPortal')}</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

