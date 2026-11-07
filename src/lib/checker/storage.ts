/**
 * Cross-Document Discrepancy & Explanation Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Explanations and comparison reviews MUST use IndexedDB.
 * 
 * Original evidence documents are NEVER altered by student explanations.
 */

const DB_NAME = 'scholarsaathi_checker';
const DB_VERSION = 1;
const STORE_NAME = 'explanations';

interface StoredExplanation {
  fieldReportId: string;
  fieldKey: string;
  studentExplanation: string;
  createdAt: string;
  updatedAt: string;
}

function openCheckerDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fieldReportId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStudentExplanation(
  fieldReportId: string,
  fieldKey: string,
  explanationText: string
): Promise<boolean> {
  try {
    const db = await openCheckerDB();
    const now = new Date().toISOString();
    const record: StoredExplanation = {
      fieldReportId,
      fieldKey,
      studentExplanation: explanationText,
      createdAt: now,
      updatedAt: now,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function getStudentExplanation(fieldReportId: string): Promise<string | null> {
  try {
    const db = await openCheckerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(fieldReportId);
      request.onsuccess = () => {
        const data = request.result as StoredExplanation | undefined;
        resolve(data ? data.studentExplanation : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function getAllStudentExplanations(): Promise<Record<string, string>> {
  try {
    const db = await openCheckerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as StoredExplanation[];
        const map: Record<string, string> = {};
        for (const item of results) {
          map[item.fieldReportId] = item.studentExplanation;
        }
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return {};
  }
}

export async function deleteStudentExplanation(fieldReportId: string): Promise<boolean> {
  try {
    const db = await openCheckerDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(fieldReportId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

