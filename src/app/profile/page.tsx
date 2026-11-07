'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  INDIAN_STATES,
  type StudentProfile,
  type AcademicRecord,
  calculateCompletion,
} from '@/lib/profile/schema';
import {
  loadProfile,
  saveProfile,
  createEmptyProfile,
  deleteProfile,
  exportProfileAsJson,
} from '@/lib/profile/storage';
import {
  User,
  GraduationCap,
  FileText,
  Save,
  Trash2,
  Download,
  Plus,
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PROFILE_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  pageTitle: { en: 'Student Profile', hi: 'छात्र प्रोफ़ाइल' },
  pageSubtitle: {
    en: 'Save your academic information locally on your device. This is not an official form.',
    hi: 'अपनी शैक्षणिक जानकारी अपने डिवाइस पर सहेजें। यह कोई आधिकारिक फॉर्म नहीं है।',
  },
  basicSection: { en: 'Basic Information', hi: 'मूलभूत जानकारी' },
  academicSection: { en: 'Academic Records', hi: 'शैक्षणिक रिकॉर्ड' },
  schemeSection: { en: 'Scheme-Dependent Fields', hi: 'योजना-विशिष्ट जानकारी' },
  schemeSectionNote: {
    en: 'These fields are only needed when a specific scholarship scheme requires them.',
    hi: 'ये फ़ील्ड केवल तभी आवश्यक हैं जब कोई विशिष्ट छात्रवृत्ति योजना इनकी माँग करे।',
  },
  displayName: { en: 'Display Name', hi: 'प्रदर्शन नाम' },
  dateOfBirth: { en: 'Date of Birth (optional)', hi: 'जन्म तिथि (वैकल्पिक)' },
  domicileState: { en: 'Domicile State', hi: 'अधिवास राज्य' },
  domicileDistrict: { en: 'District (optional)', hi: 'जिला (वैकल्पिक)' },
  selectState: { en: '-- Select State --', hi: '-- राज्य चुनें --' },
  educationLevel: { en: 'Education Level', hi: 'शिक्षा स्तर' },
  board: { en: 'Board / University', hi: 'बोर्ड / विश्वविद्यालय' },
  institution: { en: 'Institution Name', hi: 'संस्था का नाम' },
  course: { en: 'Course / Stream', hi: 'पाठ्यक्रम / स्ट्रीम' },
  passingYear: { en: 'Passing Year', hi: 'उत्तीर्ण वर्ष' },
  marks: { en: 'Marks Obtained', hi: 'प्राप्तांक' },
  maxMarks: { en: 'Maximum Marks', hi: 'पूर्णांक' },
  percentage: { en: 'Percentage', hi: 'प्रतिशत' },
  cgpa: { en: 'CGPA (if applicable)', hi: 'सीजीपीए (यदि लागू)' },
  addRecord: { en: 'Add Academic Record', hi: 'शैक्षणिक रिकॉर्ड जोड़ें' },
  removeRecord: { en: 'Remove', hi: 'हटाएँ' },
  familyIncome: { en: 'Annual Family Income (₹)', hi: 'वार्षिक पारिवारिक आय (₹)' },
  category: { en: 'Category', hi: 'वर्ग' },
  minorityStatus: { en: 'Minority Status', hi: 'अल्पसंख्यक स्थिति' },
  hostellerStatus: { en: 'Hosteller / Day Scholar', hi: 'छात्रावास / दिन का छात्र' },
  saveProfile: { en: 'Save Profile', hi: 'प्रोफ़ाइल सहेजें' },
  deleteProfile: { en: 'Delete All Profile Data', hi: 'सभी प्रोफ़ाइल डेटा हटाएँ' },
  exportProfile: { en: 'Export as JSON', hi: 'JSON के रूप में निर्यात करें' },
  saved: { en: 'Profile saved!', hi: 'प्रोफ़ाइल सहेजी गई!' },
  deleted: { en: 'Profile deleted.', hi: 'प्रोफ़ाइल हटा दी गई।' },
  deleteConfirm: {
    en: 'Are you sure you want to delete all profile data? This cannot be undone.',
    hi: 'क्या आप वाकई सभी प्रोफ़ाइल डेटा हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।',
  },
  completionNotStarted: { en: 'Not started', hi: 'शुरू नहीं हुआ' },
  completionPartial: { en: 'Partial', hi: 'आंशिक' },
  completionComplete: { en: 'Complete', hi: 'पूर्ण' },
  privacyNote: {
    en: 'Your profile data is stored only on this device using IndexedDB. Nothing is sent to any server.',
    hi: 'आपका प्रोफ़ाइल डेटा केवल इस डिवाइस पर IndexedDB में संग्रहीत है। कुछ भी किसी सर्वर पर नहीं भेजा जाता।',
  },
  noEligibilityNote: {
    en: 'This profile does not determine scholarship eligibility. Check the official portal for eligibility.',
    hi: 'यह प्रोफ़ाइल छात्रवृत्ति पात्रता निर्धारित नहीं करती। पात्रता के लिए आधिकारिक पोर्टल देखें।',
  },
};

const EDUCATION_LEVELS: Record<string, Record<'en' | 'hi', string>> = {
  class_10: { en: 'Class 10', hi: 'कक्षा 10' },
  class_12: { en: 'Class 12', hi: 'कक्षा 12' },
  diploma: { en: 'Diploma', hi: 'डिप्लोमा' },
  undergraduate: { en: 'Undergraduate', hi: 'स्नातक' },
  postgraduate: { en: 'Postgraduate', hi: 'स्नातकोत्तर' },
  phd: { en: 'PhD', hi: 'पीएचडी' },
  other: { en: 'Other', hi: 'अन्य' },
};

const CATEGORY_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  general: { en: 'General', hi: 'सामान्य' },
  sc: { en: 'SC', hi: 'अनुसूचित जाति' },
  st: { en: 'ST', hi: 'अनुसूचित जनजाति' },
  obc: { en: 'OBC', hi: 'ओबीसी' },
  ews: { en: 'EWS', hi: 'ईडब्ल्यूएस' },
  other: { en: 'Other', hi: 'अन्य' },
  prefer_not_to_say: { en: 'Prefer not to say', hi: 'बताना नहीं चाहता/चाहती' },
};

function SectionStatusBadge({ status, lang }: { status: string; lang: 'en' | 'hi' }) {
  if (status === 'complete') {
    return (
      <span className="badge badge-sm bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        {PROFILE_LABELS.completionComplete[lang]}
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="badge badge-sm bg-amber-100 text-amber-800 border-amber-300 gap-1 font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        {PROFILE_LABELS.completionPartial[lang]}
      </span>
    );
  }
  return (
    <span className="badge badge-sm bg-slate-100 text-slate-600 border-slate-300 gap-1 font-semibold">
      <Circle className="w-3.5 h-3.5" aria-hidden="true" />
      {PROFILE_LABELS.completionNotStarted[lang]}
    </span>
  );
}

export default function ProfilePage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const tl = (key: string) => PROFILE_LABELS[key]?.[lang] || PROFILE_LABELS[key]?.en || key;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    academic: false,
    scheme: false,
  });

  useEffect(() => {
    (async () => {
      const loaded = await loadProfile();
      if (loaded) {
        setProfile(loaded);
        // Auto-expand sections with data
        setExpandedSections({
          basic: true,
          academic: loaded.academicRecords.length > 0,
          scheme: !!loaded.schemeDependent?.category,
        });
      } else {
        const empty = await createEmptyProfile();
        setProfile(empty);
      }
      setLoading(false);
    })();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = useCallback(async () => {
    if (!profile) return;
    profile.completion = calculateCompletion(profile);
    const success = await saveProfile(profile);
    setSaveMessage(success ? tl('saved') : 'Error saving profile.');
    setTimeout(() => setSaveMessage(null), 3000);
  }, [profile, lang]);

  const handleDelete = useCallback(async () => {
    if (!confirm(tl('deleteConfirm'))) return;
    await deleteProfile();
    const empty = await createEmptyProfile();
    setProfile(empty);
    setSaveMessage(tl('deleted'));
    setTimeout(() => setSaveMessage(null), 3000);
  }, [lang]);

  const handleExport = useCallback(async () => {
    const json = await exportProfileAsJson();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarsaathi-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const updateBasicField = (field: string, value: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      basic: { ...profile.basic, [field]: value || undefined },
    });
  };

  const addAcademicRecord = () => {
    if (!profile) return;
    const newRecord: AcademicRecord = {
      id: crypto.randomUUID(),
      level: 'class_10',
      sourceType: 'user_input',
    };
    setProfile({
      ...profile,
      academicRecords: [...profile.academicRecords, newRecord],
    });
    setExpandedSections(prev => ({ ...prev, academic: true }));
  };

  const updateAcademicRecord = (index: number, field: string, value: string | number | undefined) => {
    if (!profile) return;
    const records = [...profile.academicRecords];
    records[index] = { ...records[index], [field]: value };
    setProfile({ ...profile, academicRecords: records });
  };

  const removeAcademicRecord = (index: number) => {
    if (!profile) return;
    const records = profile.academicRecords.filter((_, i) => i !== index);
    setProfile({ ...profile, academicRecords: records });
  };

  const updateSchemeField = (field: string, value: string | number | boolean | undefined) => {
    if (!profile) return;
    setProfile({
      ...profile,
      schemeDependent: {
        ...profile.schemeDependent,
        triggeredBySchemes: profile.schemeDependent?.triggeredBySchemes || [],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-[#003366]" />
      </div>
    );
  }

  if (!profile) return null;

  const completion = calculateCompletion(profile);

  return (
    <div className="flex flex-col gap-5 py-2 max-w-2xl mx-auto w-full">
      {/* Header */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
          {tl('pageTitle')}
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {tl('pageSubtitle')}
        </p>
      </section>

      {/* Privacy notice */}
      <aside className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1.5">
        <p className="font-semibold">{tl('privacyNote')}</p>
        <p className="text-blue-700">{tl('noEligibilityNote')}</p>
      </aside>

      {/* Completion overview */}
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-700">{tl('basicSection')}:</span>
          <SectionStatusBadge status={completion.basic} lang={lang} />
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-700">{tl('academicSection')}:</span>
          <SectionStatusBadge status={completion.academic} lang={lang} />
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-700">{tl('schemeSection')}:</span>
          <SectionStatusBadge status={completion.schemeDependent} lang={lang} />
        </div>
      </div>

      {/* BASIC SECTION */}
      <section className="card bg-white border border-slate-200 shadow-xs">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 min-h-[48px] text-left"
          onClick={() => toggleSection('basic')}
          aria-expanded={expandedSections.basic}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#003366]" aria-hidden="true" />
            <span className="font-bold text-[#003366]">{tl('basicSection')}</span>
          </div>
          {expandedSections.basic ? (
            <ChevronUp className="w-5 h-5 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
          )}
        </button>
        {expandedSections.basic && (
          <div className="p-4 pt-0 space-y-4">
            <div>
              <label htmlFor="profile-display-name" className="block text-xs font-semibold text-slate-700 mb-1">{tl('displayName')}</label>
              <input
                id="profile-display-name"
                type="text"
                className="input input-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.basic.displayName}
                onChange={e => updateBasicField('displayName', e.target.value)}
                maxLength={100}
                placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
              />
            </div>
            <div>
              <label htmlFor="profile-dob" className="block text-xs font-semibold text-slate-700 mb-1">{tl('dateOfBirth')}</label>
              <input
                id="profile-dob"
                type="date"
                className="input input-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.basic.dateOfBirth || ''}
                onChange={e => updateBasicField('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-domicile-state" className="block text-xs font-semibold text-slate-700 mb-1">{tl('domicileState')}</label>
              <select
                id="profile-domicile-state"
                className="select select-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.basic.domicileState || ''}
                onChange={e => updateBasicField('domicileState', e.target.value)}
              >
                <option value="">{tl('selectState')}</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-domicile-district" className="block text-xs font-semibold text-slate-700 mb-1">{tl('domicileDistrict')}</label>
              <input
                id="profile-domicile-district"
                type="text"
                className="input input-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.basic.domicileDistrict || ''}
                onChange={e => updateBasicField('domicileDistrict', e.target.value)}
                maxLength={100}
                placeholder={lang === 'hi' ? 'जिला का नाम' : 'District name'}
              />
            </div>
          </div>
        )}
      </section>

      {/* ACADEMIC RECORDS SECTION */}
      <section className="card bg-white border border-slate-200 shadow-xs">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 min-h-[48px] text-left"
          onClick={() => toggleSection('academic')}
          aria-expanded={expandedSections.academic}
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-[#003366]" aria-hidden="true" />
            <span className="font-bold text-[#003366]">{tl('academicSection')}</span>
            <span className="badge badge-sm bg-slate-100 text-slate-600 border-0">{profile.academicRecords.length}</span>
          </div>
          {expandedSections.academic ? (
            <ChevronUp className="w-5 h-5 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
          )}
        </button>
        {expandedSections.academic && (
          <div className="p-4 pt-0 space-y-4">
            {profile.academicRecords.map((record, index) => (
              <div key={record.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">
                    {EDUCATION_LEVELS[record.level]?.[lang] || record.level} #{index + 1}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-red-600 min-h-[44px] min-w-[44px]"
                    onClick={() => removeAcademicRecord(index)}
                    aria-label={tl('removeRecord')}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('educationLevel')}</label>
                    <select
                      className="select select-bordered w-full select-sm min-h-[44px]"
                      value={record.level}
                      onChange={e => updateAcademicRecord(index, 'level', e.target.value)}
                    >
                      {Object.entries(EDUCATION_LEVELS).map(([key, labels]) => (
                        <option key={key} value={key}>{labels[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('board')}</label>
                    <input
                      type="text"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.board || ''}
                      onChange={e => updateAcademicRecord(index, 'board', e.target.value || undefined)}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('institution')}</label>
                    <input
                      type="text"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.institution || ''}
                      onChange={e => updateAcademicRecord(index, 'institution', e.target.value || undefined)}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('course')}</label>
                    <input
                      type="text"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.course || ''}
                      onChange={e => updateAcademicRecord(index, 'course', e.target.value || undefined)}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('passingYear')}</label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.passingYear || ''}
                      onChange={e => updateAcademicRecord(index, 'passingYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      min={1990}
                      max={2030}
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('marks')}</label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.marks ?? ''}
                      onChange={e => updateAcademicRecord(index, 'marks', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('maxMarks')}</label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.maxMarks ?? ''}
                      onChange={e => updateAcademicRecord(index, 'maxMarks', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('percentage')}</label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.percentage ?? ''}
                      onChange={e => updateAcademicRecord(index, 'percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min={0}
                      max={100}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold text-slate-700">{tl('cgpa')}</label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm min-h-[44px]"
                      value={record.cgpa ?? ''}
                      onChange={e => updateAcademicRecord(index, 'cgpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min={0}
                      max={10}
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline border-dashed border-2 border-slate-300 w-full min-h-[48px] text-slate-600 hover:bg-slate-50"
              onClick={addAcademicRecord}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              {tl('addRecord')}
            </button>
          </div>
        )}
      </section>

      {/* SCHEME-DEPENDENT SECTION */}
      <section className="card bg-white border border-slate-200 shadow-xs">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 min-h-[48px] text-left"
          onClick={() => toggleSection('scheme')}
          aria-expanded={expandedSections.scheme}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#003366]" aria-hidden="true" />
            <span className="font-bold text-[#003366]">{tl('schemeSection')}</span>
          </div>
          {expandedSections.scheme ? (
            <ChevronUp className="w-5 h-5 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
          )}
        </button>
        {expandedSections.scheme && (
          <div className="p-4 pt-0 space-y-4">
            <p className="text-xs text-slate-500 italic">{tl('schemeSectionNote')}</p>
            <div>
              <label htmlFor="profile-family-income" className="block text-xs font-semibold text-slate-700 mb-1">{tl('familyIncome')}</label>
              <input
                id="profile-family-income"
                type="number"
                className="input input-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.schemeDependent?.familyIncome ?? ''}
                onChange={e => updateSchemeField('familyIncome', e.target.value ? parseFloat(e.target.value) : undefined)}
                min={0}
                step={1000}
              />
            </div>
            <div>
              <label htmlFor="profile-social-category" className="block text-xs font-semibold text-slate-700 mb-1">{tl('category')}</label>
              <select
                id="profile-social-category"
                className="select select-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.schemeDependent?.category || ''}
                onChange={e => updateSchemeField('category', e.target.value || undefined)}
              >
                <option value="">--</option>
                {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                  <option key={key} value={key}>{labels[lang]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 min-h-[48px]">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary rounded"
                id="minority-status"
                checked={profile.schemeDependent?.minorityStatus || false}
                onChange={e => updateSchemeField('minorityStatus', e.target.checked || undefined)}
              />
              <label htmlFor="minority-status" className="text-sm font-medium text-slate-700 cursor-pointer">{tl('minorityStatus')}</label>
            </div>
            <div>
              <label htmlFor="profile-hosteller-status" className="block text-xs font-semibold text-slate-700 mb-1">{tl('hostellerStatus')}</label>
              <select
                id="profile-hosteller-status"
                className="select select-bordered w-full min-h-[48px] bg-white text-slate-900 border-slate-300 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={profile.schemeDependent?.hostellerStatus || ''}
                onChange={e => updateSchemeField('hostellerStatus', e.target.value || undefined)}
              >
                <option value="">--</option>
                <option value="hosteller">{lang === 'hi' ? 'छात्रावासी' : 'Hosteller'}</option>
                <option value="day_scholar">{lang === 'hi' ? 'दिन का छात्र' : 'Day Scholar'}</option>
                <option value="not_applicable">{lang === 'hi' ? 'लागू नहीं' : 'Not Applicable'}</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          className="btn bg-[#003366] hover:bg-[#002244] text-white flex-1 min-h-[48px]"
          onClick={handleSave}
        >
          <Save className="w-5 h-5" aria-hidden="true" />
          {tl('saveProfile')}
        </button>
        <button
          type="button"
          className="btn btn-outline border-slate-300 text-slate-700 min-h-[48px]"
          onClick={handleExport}
        >
          <Download className="w-5 h-5" aria-hidden="true" />
          {tl('exportProfile')}
        </button>
        <button
          type="button"
          className="btn btn-outline border-red-300 text-red-600 hover:bg-red-50 min-h-[48px]"
          onClick={handleDelete}
        >
          <Trash2 className="w-5 h-5" aria-hidden="true" />
          {tl('deleteProfile')}
        </button>
      </div>

      {/* Save message toast */}
      {saveMessage && (
        <div className="toast toast-center toast-top z-50">
          <div className="alert bg-emerald-100 text-emerald-900 border-emerald-300 shadow-lg">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

