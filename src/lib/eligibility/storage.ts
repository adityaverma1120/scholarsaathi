/**
 * Deterministic Eligibility Evaluation Private Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * All evaluation results and traces MUST use IndexedDB.
 */

import { type EligibilityEvaluationBatch } from './schema';

const DB_NAME = 'scholarsaathi_eligibility';
const DB_VERSION = 1;
const STORE_NAME = 'evaluations';

function openEligibilityDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is only available in browser environments'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'evaluationId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves an eligibility evaluation batch to private client IndexedDB
 */
export async function saveEvaluationBatch(batch: EligibilityEvaluationBatch): Promise<boolean> {
  try {
    const db = await openEligibilityDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(batch);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Eligibility Storage] Failed to save evaluation batch', err);
    return false;
  }
}

/**
 * Retrieves the most recent evaluation batch from IndexedDB
 */
export async function getLatestEvaluationBatch(): Promise<EligibilityEvaluationBatch | null> {
  try {
    const db = await openEligibilityDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as EligibilityEvaluationBatch[];
        if (!results || results.length === 0) {
          resolve(null);
          return;
        }
        // Sort descending by evaluatedAt
        results.sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
        resolve(results[0]);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Eligibility Storage] Failed to load latest evaluation', err);
    return null;
  }
}

/**
 * Clears all stored eligibility evaluations
 */
export async function clearAllEvaluations(): Promise<boolean> {
  try {
    const db = await openEligibilityDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Eligibility Storage] Failed to clear evaluations', err);
    return false;
  }
}

