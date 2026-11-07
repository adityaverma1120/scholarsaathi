/**
 * Application Lifecycle Tracker Private Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Application history, timeline events, and status records MUST use IndexedDB.
 */

import {
  type TrackedApplication,
  type ApplicationStatusCategory,
  type StatusInputMethod,
  type TimelineEvent,
  maskApplicationId,
} from './schema';

const DB_NAME = 'scholarsaathi_tracker';
const DB_VERSION = 1;
const STORE_NAME = 'applications';

function openTrackerDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates a tracked application
 */
export async function saveTrackedApplication(app: TrackedApplication): Promise<boolean> {
  try {
    const db = await openTrackerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(app);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Tracker Storage] Failed to save tracked application:', err);
    return false;
  }
}

/**
 * Retrieves a tracked application by its ID
 */
export async function getTrackedApplication(id: string): Promise<TrackedApplication | null> {
  try {
    const db = await openTrackerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Tracker Storage] Failed to get application ${id}:`, err);
    return null;
  }
}

/**
 * Retrieves all tracked applications
 */
export async function getAllTrackedApplications(): Promise<TrackedApplication[]> {
  try {
    const db = await openTrackerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result || []) as TrackedApplication[];
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Tracker Storage] Failed to get all applications:', err);
    return [];
  }
}

/**
 * Updates application status and appends a timeline event
 */
export async function updateApplicationStatusInStorage(
  id: string,
  newStatus: ApplicationStatusCategory,
  statusLabelEn: string,
  statusLabelHi: string,
  rawRemark?: string,
  inputMethod: StatusInputMethod = 'manual_selection',
  fixCardId?: string,
  notes?: string
): Promise<TrackedApplication | null> {
  try {
    const existing = await getTrackedApplication(id);
    if (!existing) return null;

    const newEvent: TimelineEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: newStatus,
      statusLabelEn,
      statusLabelHi,
      recordedAt: new Date().toISOString(),
      rawRemark,
      whoActs:
        newStatus === 'defective_correction_needed' || newStatus === 'rejected'
          ? 'STUDENT'
          : newStatus === 'submitted_pending_institute'
          ? 'INSTITUTE'
          : newStatus === 'pending_district_state'
          ? 'DISTRICT_STATE'
          : newStatus === 'sanctioned_payment_pending'
          ? 'BANK'
          : 'PORTAL',
      fixCardId,
      notes,
      inputMethod,
    };

    const updated: TrackedApplication = {
      ...existing,
      currentStatus: newStatus,
      statusLabelEn,
      statusLabelHi,
      whoActs: newEvent.whoActs,
      currentFixCardId: fixCardId || existing.currentFixCardId,
      inputMethod,
      timelineEvents: [newEvent, ...existing.timelineEvents],
      updatedAt: new Date().toISOString(),
    };

    await saveTrackedApplication(updated);
    return updated;
  } catch (err) {
    console.error(`[Tracker Storage] Failed to update status for ${id}:`, err);
    return null;
  }
}

/**
 * Deletes a tracked application by ID
 */
export async function deleteTrackedApplication(id: string): Promise<boolean> {
  try {
    const db = await openTrackerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Tracker Storage] Failed to delete application ${id}:`, err);
    return false;
  }
}

/**
 * Clears all tracked applications
 */
export async function clearAllTrackedApplications(): Promise<boolean> {
  try {
    const db = await openTrackerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Tracker Storage] Failed to clear applications:', err);
    return false;
  }
}

