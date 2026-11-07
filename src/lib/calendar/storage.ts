/**
 * Scholarship Calendar & Reminder Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Personal reminders and notification settings MUST use IndexedDB.
 */

import {
  type PersonalReminder,
  type NotificationPreferences,
  CALENDAR_EVENT_TYPES,
} from './schema';

const DB_NAME = 'scholarsaathi_calendar';
const DB_VERSION = 1;
const REMINDERS_STORE = 'reminders';
const PREFERENCES_STORE = 'preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabledCategories: [...CALENDAR_EVENT_TYPES],
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  language: 'en',
  privacyMode: true,
};

function openCalendarDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REMINDERS_STORE)) {
        db.createObjectStore(REMINDERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
        db.createObjectStore(PREFERENCES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a personal reminder
 */
export async function savePersonalReminder(reminder: PersonalReminder): Promise<boolean> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REMINDERS_STORE, 'readwrite');
      const store = tx.objectStore(REMINDERS_STORE);
      const request = store.put(reminder);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Calendar Storage] Failed to save reminder:', err);
    return false;
  }
}

/**
 * Gets a personal reminder by ID
 */
export async function getPersonalReminder(id: string): Promise<PersonalReminder | null> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REMINDERS_STORE, 'readonly');
      const store = tx.objectStore(REMINDERS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Calendar Storage] Failed to get reminder ${id}:`, err);
    return null;
  }
}

/**
 * Retrieves all personal reminders, sorted by due date
 */
export async function getAllPersonalReminders(): Promise<PersonalReminder[]> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REMINDERS_STORE, 'readonly');
      const store = tx.objectStore(REMINDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result || []) as PersonalReminder[];
        results.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Calendar Storage] Failed to get all reminders:', err);
    return [];
  }
}

/**
 * Toggles completion status of a personal reminder
 */
export async function toggleReminderCompletion(id: string): Promise<boolean> {
  try {
    const existing = await getPersonalReminder(id);
    if (!existing) return false;

    const updated: PersonalReminder = {
      ...existing,
      isCompleted: !existing.isCompleted,
      updatedAt: new Date().toISOString(),
    };

    return savePersonalReminder(updated);
  } catch (err) {
    console.error(`[Calendar Storage] Failed to toggle reminder completion ${id}:`, err);
    return false;
  }
}

/**
 * Deletes a personal reminder by ID
 */
export async function deletePersonalReminder(id: string): Promise<boolean> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REMINDERS_STORE, 'readwrite');
      const store = tx.objectStore(REMINDERS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Calendar Storage] Failed to delete reminder ${id}:`, err);
    return false;
  }
}

/**
 * Clears all personal reminders
 */
export async function clearAllPersonalReminders(): Promise<boolean> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REMINDERS_STORE, 'readwrite');
      const store = tx.objectStore(REMINDERS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Calendar Storage] Failed to clear all reminders:', err);
    return false;
  }
}

/**
 * Loads notification preferences
 */
export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const db = await openCalendarDB();
    return new Promise(resolve => {
      const tx = db.transaction(PREFERENCES_STORE, 'readonly');
      const store = tx.objectStore(PREFERENCES_STORE);
      const request = store.get('user_preferences');

      request.onsuccess = () => {
        if (request.result && request.result.prefs) {
          resolve(request.result.prefs);
        } else {
          resolve(DEFAULT_PREFERENCES);
        }
      };
      request.onerror = () => resolve(DEFAULT_PREFERENCES);
    });
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Saves notification preferences
 */
export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
  try {
    const db = await openCalendarDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PREFERENCES_STORE, 'readwrite');
      const store = tx.objectStore(PREFERENCES_STORE);
      const request = store.put({ id: 'user_preferences', prefs });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Calendar Storage] Failed to save preferences:', err);
    return false;
  }
}

