/**
 * Scholarship Application Readiness Private Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * All readiness reports and checklist states MUST use IndexedDB.
 */

import { type ScholarshipReadinessReport } from './schema';

const DB_NAME = 'scholarsaathi_readiness';
const DB_VERSION = 1;
const STORE_NAME = 'readiness_reports';

function openReadinessDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'scholarshipId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates a scholarship readiness report
 */
export async function saveReadinessReport(report: ScholarshipReadinessReport): Promise<boolean> {
  try {
    const db = await openReadinessDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(report);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Readiness Storage] Failed to save readiness report', err);
    return false;
  }
}

/**
 * Retrieves a readiness report for a specific scholarship
 */
export async function getReadinessReport(scholarshipId: string): Promise<ScholarshipReadinessReport | null> {
  try {
    const db = await openReadinessDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(scholarshipId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Readiness Storage] Failed to load report for ${scholarshipId}`, err);
    return null;
  }
}

/**
 * Retrieves all stored readiness reports
 */
export async function getAllReadinessReports(): Promise<ScholarshipReadinessReport[]> {
  try {
    const db = await openReadinessDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Readiness Storage] Failed to load all reports', err);
    return [];
  }
}

/**
 * Updates student confirmation for a readiness report
 */
export async function updateStudentConfirmation(
  scholarshipId: string,
  isConfirmed: boolean,
  notes?: string
): Promise<ScholarshipReadinessReport | null> {
  try {
    const existing = await getReadinessReport(scholarshipId);
    if (!existing) return null;

    const updated: ScholarshipReadinessReport = {
      ...existing,
      overallState: isConfirmed ? 'STUDENT_CONFIRMED_READY' : (existing.blockers.length > 0 ? 'BLOCKED' : 'READY_FOR_STUDENT_REVIEW'),
      sections: {
        ...existing.sections,
        studentReview: {
          isConfirmed,
          confirmedAt: isConfirmed ? new Date().toISOString() : undefined,
          studentNotes: notes || existing.sections.studentReview.studentNotes,
        },
      },
      evaluatedAt: new Date().toISOString(),
    };

    await saveReadinessReport(updated);
    return updated;
  } catch (err) {
    console.error(`[Readiness Storage] Failed to update student confirmation for ${scholarshipId}`, err);
    return null;
  }
}

/**
 * Clears all stored readiness reports
 */
export async function clearAllReadinessReports(): Promise<boolean> {
  try {
    const db = await openReadinessDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Readiness Storage] Failed to clear reports', err);
    return false;
  }
}

