/**
 * Profile storage using IndexedDB.
 *
 * CRITICAL: localStorage is restricted to exactly 3 keys by AGENTS.md:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Profile data MUST use IndexedDB.
 *
 * No raw PII (Aadhaar, bank details, passwords) is ever stored.
 */

const DB_NAME = 'scholarsaathi_profile';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';

function openDB(): Promise<IDBDatabase> {
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

// The single profile ID for MVP (no user accounts)
const PROFILE_KEY = 'default_profile';

import { StudentProfile, StudentProfileSchema, calculateCompletion, type UpdateProfileRequest } from './schema';

export async function loadProfile(): Promise<StudentProfile | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(PROFILE_KEY);
      request.onsuccess = () => {
        const data = request.result;
        if (!data) { resolve(null); return; }
        const parsed = StudentProfileSchema.safeParse(data);
        resolve(parsed.success ? parsed.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveProfile(profile: StudentProfile): Promise<boolean> {
  try {
    // Recalculate completion before saving
    profile.completion = calculateCompletion(profile);
    profile.updatedAt = new Date().toISOString();

    const validated = StudentProfileSchema.parse(profile);
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(validated);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function createEmptyProfile(): Promise<StudentProfile> {
  const now = new Date().toISOString();
  const profile: StudentProfile = {
    id: PROFILE_KEY,
    version: 1,
    basic: {
      displayName: '',
      preferredLanguage: 'en',
    },
    academicRecords: [],
    completion: { basic: 'not_started', academic: 'not_started', schemeDependent: 'not_started' },
    createdAt: now,
    updatedAt: now,
  };
  return profile;
}

export async function updateProfile(updates: UpdateProfileRequest): Promise<StudentProfile | null> {
  let profile = await loadProfile();
  if (!profile) {
    profile = await createEmptyProfile();
  }

  if (updates.basic) {
    profile.basic = { ...profile.basic, ...updates.basic };
  }
  if (updates.academicRecords) {
    profile.academicRecords = updates.academicRecords;
  }
  if (updates.schemeDependent) {
    profile.schemeDependent = {
      triggeredBySchemes: [],
      ...profile.schemeDependent,
      ...updates.schemeDependent,
    };
  }

  const saved = await saveProfile(profile);
  return saved ? profile : null;
}

export async function deleteProfile(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(PROFILE_KEY);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function exportProfileAsJson(): Promise<string | null> {
  const profile = await loadProfile();
  if (!profile) return null;
  // Strip internal id before export
  const { id, ...exportData } = profile;
  return JSON.stringify(exportData, null, 2);
}
