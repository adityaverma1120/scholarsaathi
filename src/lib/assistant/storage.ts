/**
 * Scholarship Form Preparation Workspace Private Storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Form preparation drafts and candidate values MUST use IndexedDB.
 */

import { type ApplicationPreparationForm } from './schema';
import { updateFieldValueInForm } from './engine';

const DB_NAME = 'scholarsaathi_assistant';
const DB_VERSION = 1;
const STORE_NAME = 'prepared_forms';

function openAssistantDB(): Promise<IDBDatabase> {
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
 * Saves or updates a prepared application form in IndexedDB
 */
export async function savePreparedForm(form: ApplicationPreparationForm): Promise<boolean> {
  try {
    const db = await openAssistantDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(form);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Assistant Storage] Failed to save prepared form:', err);
    return false;
  }
}

/**
 * Retrieves a prepared form by scholarship ID
 */
export async function getPreparedForm(scholarshipId: string): Promise<ApplicationPreparationForm | null> {
  try {
    const db = await openAssistantDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(scholarshipId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[Assistant Storage] Failed to get prepared form for ${scholarshipId}:`, err);
    return null;
  }
}

/**
 * Retrieves all stored form preparations
 */
export async function getAllPreparedForms(): Promise<ApplicationPreparationForm[]> {
  try {
    const db = await openAssistantDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Assistant Storage] Failed to get all prepared forms:', err);
    return [];
  }
}

/**
 * Updates a specific field value and saves to storage
 */
export async function updateFieldValueInStorage(
  scholarshipId: string,
  fieldId: string,
  newValue: string,
  isConfirmed: boolean = true
): Promise<ApplicationPreparationForm | null> {
  try {
    const existing = await getPreparedForm(scholarshipId);
    if (!existing) return null;

    const updated = updateFieldValueInForm(existing, fieldId, newValue, isConfirmed);
    await savePreparedForm(updated);
    return updated;
  } catch (err) {
    console.error(`[Assistant Storage] Failed to update field ${fieldId}:`, err);
    return null;
  }
}

/**
 * Updates the final review checklist items for a form
 */
export async function updateReviewChecklist(
  scholarshipId: string,
  checklistUpdates: Partial<ApplicationPreparationForm['finalReviewChecklist']>
): Promise<ApplicationPreparationForm | null> {
  try {
    const existing = await getPreparedForm(scholarshipId);
    if (!existing) return null;

    const updatedChecklist = {
      ...existing.finalReviewChecklist,
      ...checklistUpdates,
    };

    const allChecked = Object.values(updatedChecklist).every(Boolean);

    const updated: ApplicationPreparationForm = {
      ...existing,
      finalReviewChecklist: updatedChecklist,
      status: allChecked ? 'confirmed_by_student' : existing.status,
      reviewedAt: allChecked ? new Date().toISOString() : existing.reviewedAt,
      updatedAt: new Date().toISOString(),
    };

    await savePreparedForm(updated);
    return updated;
  } catch (err) {
    console.error(`[Assistant Storage] Failed to update review checklist for ${scholarshipId}:`, err);
    return null;
  }
}

/**
 * Clears all prepared form workspaces
 */
export async function clearAllPreparedForms(): Promise<boolean> {
  try {
    const db = await openAssistantDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('[Assistant Storage] Failed to clear forms:', err);
    return false;
  }
}

