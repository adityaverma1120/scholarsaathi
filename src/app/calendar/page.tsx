'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  FileText,
  Bookmark,
  Activity,
  PlusCircle,
  Download,
  Settings,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import {
  getVerifiedOfficialCalendarEvents,
  reminderToCalendarEvent,
  filterCalendarEvents,
} from '@/lib/calendar/engine';
import {
  savePersonalReminder,
  getAllPersonalReminders,
  toggleReminderCompletion,
  deletePersonalReminder,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/calendar/storage';
import {
  type CalendarEvent,
  type CalendarEventType,
  type PersonalReminder,
  type NotificationPreferences,
  CALENDAR_EVENT_TYPES,
} from '@/lib/calendar/schema';
import { getAllScholarships } from '@/lib/catalogue/engine';
import { type Scholarship } from '@/lib/catalogue/schema';

const CALENDAR_LABELS: Record<string, Record<'en' | 'hi', string>> = {
  title: {
    en: 'Scholarship Application Calendar & Deadlines',
    hi: 'छात्रवृत्ति आवेदन कैलेंडर एवं अंतिम तिथियां',
  },
  subtitle: {
    en: 'Verified portal dates for NSP and State schemes with personal reminders and calendar sync.',
    hi: 'एनएसपी और राज्य योजनाओं की सत्यापित तिथियां, व्यक्तिगत अनुस्मारक एवं कैलेंडर सिंक।',
  },
  portalWarning: {
    en: 'Check the date on the portal. Application deadlines fluctuate; verify all dates directly on the official portal before acting.',
    hi: 'आधिकारिक पोर्टल पर अंतिम तिथि की जाँच अवश्य करें। आवेदन की तिथियों में परिवर्तन हो सकता है; किसी भी कार्रवाई से पहले पोर्टल पर सीधे पुष्टि करें।',
  },
  addReminderBtn: {
    en: 'Add Personal Reminder',
    hi: 'व्यक्तिगत अनुस्मारक जोड़ें',
  },
  exportIcsBtn: {
    en: 'Export (.ics)',
    hi: 'कैलेंडर डाउनलोड (.ics)',
  },
  settingsBtn: {
    en: 'Notification Settings',
    hi: 'सूचना सेटिंग',
  },
  tabAll: { en: 'All Events', hi: 'सभी कार्यक्रम' },
  tabUpcoming: { en: 'Upcoming Deadlines', hi: 'आगामी तिथियां' },
  tabCorrection: { en: 'Correction Windows', hi: 'सुधार अवधि' },
  tabReminders: { en: 'My Reminders', hi: 'मेरे अनुस्मारक' },
  tabClosed: { en: 'Closed Schemes', hi: 'समाप्त योजनाएं' },
  noEvents: {
    en: 'No events match the selected filter.',
    hi: 'चयनित फ़िल्टर के लिए कोई कार्यक्रम नहीं मिला।',
  },
  verifiedOfficial: {
    en: 'Verified Official Date',
    hi: 'सत्यापित आधिकारिक तिथि',
  },
  visitPortal: {
    en: 'Visit Official Portal',
    hi: 'आधिकारिक पोर्टल पर जाएं',
  },
  newReminderTitle: {
    en: 'Set Personal Scholarship Reminder',
    hi: 'नया छात्रवृत्ति अनुस्मारक सेट करें',
  },
  reminderTitleLabel: {
    en: 'Reminder Title',
    hi: 'अनुस्मारक शीर्षक',
  },
  reminderCategoryLabel: {
    en: 'Category',
    hi: 'श्रेणी',
  },
  reminderDueDateLabel: {
    en: 'Due Date',
    hi: 'अंतिम तिथि',
  },
  reminderDueTimeLabel: {
    en: 'Time (Optional)',
    hi: 'समय (वैकल्पिक)',
  },
  reminderSchemeLabel: {
    en: 'Associated Scheme (Optional)',
    hi: 'संबंधित योजना (वैकल्पिक)',
  },
  reminderNotesLabel: {
    en: 'Notes / To-Do Items',
    hi: 'टिप्पणी / कार्य विवरण',
  },
  saveBtn: {
    en: 'Save Reminder',
    hi: 'अनुस्मारक सहेजें',
  },
  cancelBtn: {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  exportSuccess: {
    en: 'Calendar (.ics) downloaded! You can open it in Google Calendar, Apple Calendar, or Outlook.',
    hi: 'कैलेंडर (.ics) डाउनलोड हो गया! आप इसे गूगल कैलेंडर या आउटलुक में खोल सकते हैं।',
  },
};

export default function CalendarPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'hi';
  const cl = (key: string) => CALENDAR_LABELS[key]?.[lang] || CALENDAR_LABELS[key]?.en || key;

  // Active tab filter
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'correction' | 'reminders' | 'closed'>('upcoming');
  const [officialEvents, setOfficialEvents] = useState<CalendarEvent[]>([]);
  const [personalReminders, setPersonalReminders] = useState<PersonalReminder[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // New Reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CalendarEventType>('personal_followup');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newSchemeId, setNewSchemeId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Preferences state
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabledCategories: [...CALENDAR_EVENT_TYPES],
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    language: 'en',
    privacyMode: true,
  });

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      try {
        const official = getVerifiedOfficialCalendarEvents('2026-27');
        const reminders = await getAllPersonalReminders();
        const schemes = getAllScholarships();
        const loadedPrefs = await loadNotificationPreferences();

        setOfficialEvents(official);
        setPersonalReminders(reminders);
        setScholarships(schemes);
        setPrefs(loadedPrefs);
      } catch (err) {
        console.error('[CalendarPage] Failed to load calendar data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Compute displayed events based on active tab
  const reminderEvents = personalReminders.map(reminderToCalendarEvent);
  const allCombinedEvents = [...officialEvents, ...reminderEvents].sort((a, b) => a.date.localeCompare(b.date));

  let displayedEvents: CalendarEvent[] = [];
  if (activeTab === 'all') {
    displayedEvents = allCombinedEvents;
  } else if (activeTab === 'upcoming') {
    displayedEvents = filterCalendarEvents(allCombinedEvents, undefined, 'upcoming');
  } else if (activeTab === 'correction') {
    displayedEvents = allCombinedEvents.filter(e => e.eventType === 'correction_window');
  } else if (activeTab === 'reminders') {
    displayedEvents = reminderEvents;
  } else if (activeTab === 'closed') {
    displayedEvents = filterCalendarEvents(allCombinedEvents, undefined, 'closed');
  }

  // Handle Save Reminder
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError(lang === 'hi' ? 'कृपया शीर्षक दर्ज करें।' : 'Please enter a title.');
      return;
    }
    if (!newDueDate) {
      setFormError(lang === 'hi' ? 'कृपया अंतिम तिथि चुनें।' : 'Please select a due date.');
      return;
    }

    try {
      const res = await fetch('/api/calendar/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          dueDate: newDueDate,
          dueTime: newDueTime || undefined,
          schemeId: newSchemeId || undefined,
          notes: newNotes.trim() || undefined,
          remindBeforeDays: 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to create reminder');
      }

      const { reminder } = await res.json();
      await savePersonalReminder(reminder);

      const updated = await getAllPersonalReminders();
      setPersonalReminders(updated);

      // Reset form and close modal
      setNewTitle('');
      setNewDueDate('');
      setNewDueTime('');
      setNewSchemeId('');
      setNewNotes('');
      setFormError(null);
      setIsAddModalOpen(false);

      setNotificationMsg(lang === 'hi' ? 'अनुस्मारक सफलतापूर्वक जोड़ा गया!' : 'Reminder added successfully!');
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creating reminder');
    }
  };

  // Handle Toggle Completion
  const handleToggleComplete = async (id: string) => {
    const cleanId = id.replace('evt_rem_', '');
    await toggleReminderCompletion(cleanId);
    const updated = await getAllPersonalReminders();
    setPersonalReminders(updated);
  };

  // Handle Delete Reminder
  const handleDeleteReminder = async (id: string) => {
    const cleanId = id.replace('evt_rem_', '');
    await deletePersonalReminder(cleanId);
    const updated = await getAllPersonalReminders();
    setPersonalReminders(updated);
  };

  // Handle Export .ics
  const handleExportIcs = async () => {
    try {
      const res = await fetch('/api/calendar/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeOfficialDeadlines: true,
          academicYear: '2026-27',
          personalReminders,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to export calendar');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scholarship_deadlines_2026_27.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotificationMsg(cl('exportSuccess'));
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch (err) {
      console.error('[Calendar Export] Error:', err);
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async () => {
    await saveNotificationPreferences(prefs);
    setIsSettingsModalOpen(false);
    setNotificationMsg(lang === 'hi' ? 'सूचना प्राथमिकताएं सहेज ली गईं!' : 'Preferences saved successfully!');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'application_opening':
        return (
          <span className="badge badge-sm bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold gap-1 py-2 px-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'hi' ? 'आवेदन प्रारंभ' : 'Opening'}
          </span>
        );
      case 'application_deadline':
        return (
          <span className="badge badge-sm bg-rose-50 text-rose-800 border-rose-300 font-semibold gap-1 py-2 px-2.5">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            {lang === 'hi' ? 'अंतिम तिथि' : 'Deadline'}
          </span>
        );
      case 'correction_window':
        return (
          <span className="badge badge-sm bg-amber-50 text-amber-900 border-amber-300 font-semibold gap-1 py-2 px-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {lang === 'hi' ? 'सुधार अवधि' : 'Correction Window'}
          </span>
        );
      case 'renewal_deadline':
        return (
          <span className="badge badge-sm bg-purple-50 text-purple-800 border-purple-300 font-semibold gap-1 py-2 px-2.5">
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            {lang === 'hi' ? 'नवीनीकरण' : 'Renewal'}
          </span>
        );
      case 'certificate_expiry':
        return (
          <span className="badge badge-sm bg-orange-50 text-orange-800 border-orange-300 font-semibold gap-1 py-2 px-2.5">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            {lang === 'hi' ? 'प्रमाणपत्र समाप्ति' : 'Certificate Expiry'}
          </span>
        );
      case 'personal_followup':
        return (
          <span className="badge badge-sm bg-sky-50 text-sky-800 border-sky-300 font-semibold gap-1 py-2 px-2.5">
            <Bookmark className="w-3.5 h-3.5 text-sky-600" />
            {lang === 'hi' ? 'अनुस्मारक' : 'Reminder'}
          </span>
        );
      case 'status_check':
        return (
          <span className="badge badge-sm bg-teal-50 text-teal-800 border-teal-300 font-semibold gap-1 py-2 px-2.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            {lang === 'hi' ? 'स्थिति जाँच' : 'Status Check'}
          </span>
        );
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-5 py-2 max-w-2xl mx-auto w-full">
      {/* Header */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2 text-orange-700">
          <Calendar className="w-6 h-6" aria-hidden="true" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#003366] tracking-tight">
            {cl('title')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {cl('subtitle')}
        </p>
      </section>

      {/* Saffron Rule P8 Alert Box */}
      <aside
        aria-label="Portal Deadline Warning"
        className="bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm shadow-xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">
            {lang === 'hi' ? 'पोर्टल अंतिम तिथि चेतावनी (नियम P8)' : 'Official Portal Notice (Rule P8)'}
          </p>
          <p className="text-amber-800 leading-relaxed">
            {cl('portalWarning')}
          </p>
        </div>
      </aside>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-0 gap-1.5 rounded-xl min-h-[44px] px-3 font-semibold shadow-xs"
          aria-label="Add Personal Reminder"
        >
          <PlusCircle className="w-4 h-4" />
          {cl('addReminderBtn')}
        </button>

        <button
          onClick={handleExportIcs}
          className="btn btn-sm btn-outline border-slate-300 hover:border-slate-400 text-slate-700 gap-1.5 rounded-xl min-h-[44px] px-3 font-semibold"
          aria-label="Export iCalendar (.ics)"
        >
          <Download className="w-4 h-4 text-slate-500" />
          {cl('exportIcsBtn')}
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="btn btn-sm btn-ghost text-slate-600 hover:text-slate-900 gap-1.5 rounded-xl min-h-[44px] px-2.5 font-medium ml-auto"
          aria-label="Notification Settings"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">{cl('settingsBtn')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <nav aria-label="Calendar event filters" className="flex overflow-x-auto gap-1.5 pb-1 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn btn-sm rounded-xl px-3 min-h-[40px] text-xs font-semibold whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-[#003366] text-white border-0'
              : 'btn-ghost text-slate-600 hover:text-slate-900'
          }`}
        >
          {cl('tabUpcoming')}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`btn btn-sm rounded-xl px-3 min-h-[40px] text-xs font-semibold whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#003366] text-white border-0'
              : 'btn-ghost text-slate-600 hover:text-slate-900'
          }`}
        >
          {cl('tabAll')}
        </button>

        <button
          onClick={() => setActiveTab('correction')}
          className={`btn btn-sm rounded-xl px-3 min-h-[40px] text-xs font-semibold whitespace-nowrap ${
            activeTab === 'correction'
              ? 'bg-[#003366] text-white border-0'
              : 'btn-ghost text-slate-600 hover:text-slate-900'
          }`}
        >
          {cl('tabCorrection')}
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`btn btn-sm rounded-xl px-3 min-h-[40px] text-xs font-semibold whitespace-nowrap ${
            activeTab === 'reminders'
              ? 'bg-[#003366] text-white border-0'
              : 'btn-ghost text-slate-600 hover:text-slate-900'
          }`}
        >
          {cl('tabReminders')}
          {personalReminders.length > 0 && (
            <span className="ml-1 badge badge-xs bg-orange-100 text-orange-800 border-0">
              {personalReminders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`btn btn-sm rounded-xl px-3 min-h-[40px] text-xs font-semibold whitespace-nowrap ${
            activeTab === 'closed'
              ? 'bg-[#003366] text-white border-0'
              : 'btn-ghost text-slate-600 hover:text-slate-900'
          }`}
        >
          {cl('tabClosed')}
        </button>
      </nav>

      {/* Events List */}
      <section className="space-y-3.5">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <span className="loading loading-spinner loading-md text-orange-600"></span>
            <p className="mt-2">{lang === 'hi' ? 'कैलेंडर लोड हो रहा है...' : 'Loading calendar events...'}</p>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{cl('noEvents')}</p>
            <p className="text-xs text-slate-500">
              {activeTab === 'reminders'
                ? (lang === 'hi' ? 'नया अनुस्मारक जोड़ने के लिए ऊपर बटन दबाएं।' : 'Click "Add Personal Reminder" above to set a date.')
                : (lang === 'hi' ? 'अन्य फ़िल्टर विकल्प चुनकर देखें।' : 'Try selecting another filter view.')}
            </p>
          </div>
        ) : (
          displayedEvents.map(event => {
            const isPersonal = event.isPersonal;
            const isClosed = event.dateStatus === 'closed';

            return (
              <div
                key={event.id}
                className={`card bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                  isClosed
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-300 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Row: Date, Badge, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-slate-900">
                          {formatDateDisplay(event.date)}
                        </span>
                        {event.time && (
                          <span className="text-xs font-semibold text-slate-500">
                            {event.time} IST
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {event.portalName}
                        </span>
                        <span>•</span>
                        <span>{event.academicYear}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {getEventBadge(event.eventType)}
                      {event.dateStatus === 'provisional' && (
                        <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-300 font-medium">
                          {lang === 'hi' ? 'अनंतिम' : 'Provisional'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div className="space-y-1">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {lang === 'hi' ? event.titleHi : event.titleEn}
                    </h2>
                    {(event.notesEn || event.notesHi) && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {lang === 'hi' ? event.notesHi : event.notesEn}
                      </p>
                    )}
                  </div>

                  {/* Verification & Action Hand-off Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{cl('verifiedOfficial')}</span>
                      <span>({event.lastVerifiedDate})</span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {isPersonal ? (
                        <>
                          <button
                            onClick={() => handleToggleComplete(event.id)}
                            className="btn btn-xs btn-outline border-slate-300 text-slate-700 rounded-lg min-h-[32px] px-2.5 font-semibold"
                            aria-label="Toggle Complete"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {lang === 'hi' ? 'पूर्ण मार्क करें' : 'Done'}
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(event.id)}
                            className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 rounded-lg min-h-[32px] px-2"
                            aria-label="Delete Reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <a
                          href={event.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-orange-900 border border-slate-300 hover:border-orange-300 rounded-lg min-h-[32px] px-2.5 font-semibold flex items-center gap-1"
                        >
                          <span>{cl('visitPortal')}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-orange-600" />
                {cl('newReminderTitle')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-sm btn-ghost btn-circle text-slate-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveReminder} className="space-y-3.5">
              {/* Reminder Title */}
              <div>
                <label htmlFor="reminder-title-input" className="block text-xs font-bold text-slate-700 mb-1">
                  {cl('reminderTitleLabel')} *
                </label>
                <input
                  id="reminder-title-input"
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. कॉलेज नोडल अधिकारी से सत्यापन कराएं' : 'e.g. Verify bonafide certificate with College Desk'}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input input-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs sm:text-sm h-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label htmlFor="reminder-category-select" className="block text-xs font-bold text-slate-700 mb-1">
                  {cl('reminderCategoryLabel')}
                </label>
                <select
                  id="reminder-category-select"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as CalendarEventType)}
                  className="select select-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs sm:text-sm h-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="personal_followup">{lang === 'hi' ? 'व्यक्तिगत अनुवर्ती (Follow-up)' : 'Personal Follow-up'}</option>
                  <option value="application_deadline">{lang === 'hi' ? 'आवेदन अंतिम तिथि' : 'Application Deadline'}</option>
                  <option value="correction_window">{lang === 'hi' ? 'दोषपूर्ण फॉर्म सुधार' : 'Correction Window'}</option>
                  <option value="renewal_deadline">{lang === 'hi' ? 'नवीनीकरण तिथि' : 'Renewal Deadline'}</option>
                  <option value="certificate_expiry">{lang === 'hi' ? 'प्रमाणपत्र नवीनीकरण' : 'Certificate Renewal'}</option>
                  <option value="status_check">{lang === 'hi' ? 'पोर्टल स्थिति जाँच' : 'Portal Status Check'}</option>
                </select>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reminder-due-date-input" className="block text-xs font-bold text-slate-700 mb-1">
                    {cl('reminderDueDateLabel')} *
                  </label>
                  <input
                    id="reminder-due-date-input"
                    type="date"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="input input-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs h-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label htmlFor="reminder-due-time-input" className="block text-xs font-bold text-slate-700 mb-1">
                    {cl('reminderDueTimeLabel')}
                  </label>
                  <input
                    id="reminder-due-time-input"
                    type="time"
                    value={newDueTime}
                    onChange={e => setNewDueTime(e.target.value)}
                    className="input input-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs h-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Associated Scheme */}
              <div>
                <label htmlFor="reminder-scheme-select" className="block text-xs font-bold text-slate-700 mb-1">
                  {cl('reminderSchemeLabel')}
                </label>
                <select
                  id="reminder-scheme-select"
                  value={newSchemeId}
                  onChange={e => setNewSchemeId(e.target.value)}
                  className="select select-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs h-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">{lang === 'hi' ? '-- सामान्य / कोई योजना नहीं --' : '-- General / None --'}</option>
                  {scholarships.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {lang === 'hi' ? s.nameHi : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="reminder-notes-textarea" className="block text-xs font-bold text-slate-700 mb-1">
                  {cl('reminderNotesLabel')}
                </label>
                <textarea
                  id="reminder-notes-textarea"
                  rows={2}
                  maxLength={500}
                  placeholder={lang === 'hi' ? 'आवश्यक दस्तावेज़ या याद रखने योग्य बिंदु...' : 'Required documents or key things to remember...'}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="textarea textarea-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-sm btn-ghost rounded-xl min-h-[40px] px-3 font-semibold text-slate-600"
                >
                  {cl('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-xl min-h-[40px] px-4 font-semibold shadow-xs"
                >
                  {cl('saveBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" />
                {cl('settingsBtn')}
              </h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost text-slate-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              {/* Quiet Hours */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-900">
                  {lang === 'hi' ? 'शांत समय (Quiet Hours)' : 'Quiet Hours'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? 'इस समय के दौरान कोई अनुस्मारक सूचना नहीं भेजी जाएगी।' : 'No notification sounds will be triggered during these hours.'}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label htmlFor="quiet-hours-start" className="block text-xs text-slate-600 mb-0.5">{lang === 'hi' ? 'प्रारंभ:' : 'Start:'}</label>
                    <input
                      id="quiet-hours-start"
                      type="time"
                      value={prefs.quietHoursStart}
                      onChange={e => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                      className="input input-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs h-9 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="quiet-hours-end" className="block text-xs text-slate-600 mb-0.5">{lang === 'hi' ? 'समाप्त:' : 'End:'}</label>
                    <input
                      id="quiet-hours-end"
                      type="time"
                      value={prefs.quietHoursEnd}
                      onChange={e => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                      className="input input-sm w-full bg-white text-slate-900 border-slate-300 rounded-xl text-xs h-9 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Mode */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {lang === 'hi' ? 'गोपनीयता मोड (Privacy Mode)' : 'Lockscreen Privacy Mode'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === 'hi'
                      ? 'लॉकस्क्रीन सूचनाओं में संवेदनशील श्रेणी या योजना का नाम छिपाएं।'
                      : 'Mask sensitive scholarship categories on lock screen alerts.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.privacyMode}
                  onChange={e => setPrefs({ ...prefs, privacyMode: e.target.checked })}
                  className="checkbox checkbox-sm checkbox-warning"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="btn btn-sm btn-ghost rounded-xl min-h-[40px] px-3 font-semibold text-slate-600"
              >
                {cl('cancelBtn')}
              </button>
              <button
                onClick={handleSavePreferences}
                className="btn btn-sm bg-[#003366] hover:bg-[#002244] text-white border-0 rounded-xl min-h-[40px] px-4 font-semibold shadow-xs"
              >
                {cl('saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

