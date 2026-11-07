/**
 * Document Vault private storage using IndexedDB.
 * 
 * CRITICAL RULE (AGENTS.md Section 7):
 * localStorage is restricted strictly to 3 keys:
 * wajah.lang, wajah.notice.v1, wajah.consent.stats
 * Document metadata and files MUST use IndexedDB.
 * 
 * No raw PII or unencrypted documents are sent to external databases.
 */

import { type DocumentMetadata, DocumentMetadataSchema } from './schema';

const DB_NAME = 'scholarsaathi_vault';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

function openVaultDB(): Promise<IDBDatabase> {
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

export async function loadAllDocuments(): Promise<DocumentMetadata[]> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result || [];
        const validated = results
          .map(item => DocumentMetadataSchema.safeParse(item))
          .filter(p => p.success)
          .map(p => p.data!);
        resolve(validated);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function loadDocument(id: string): Promise<DocumentMetadata | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        const data = request.result;
        if (!data) {
          resolve(null);
          return;
        }
        const parsed = DocumentMetadataSchema.safeParse(data);
        resolve(parsed.success ? parsed.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveDocument(doc: DocumentMetadata): Promise<boolean> {
  try {
    doc.updatedAt = new Date().toISOString();
    const validated = DocumentMetadataSchema.parse(doc);
    const db = await openVaultDB();
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

export async function updateExtractedField(
  documentId: string,
  fieldId: string,
  userValue: string
): Promise<boolean> {
  const doc = await loadDocument(documentId);
  if (!doc) return false;

  const now = new Date().toISOString();
  doc.extractedFields = doc.extractedFields.map(f => {
    if (f.id === fieldId) {
      return {
        ...f,
        userConfirmedValue: userValue,
        userConfirmedAt: now,
      };
    }
    return f;
  });

  return saveDocument(doc);
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function clearAllDocuments(): Promise<boolean> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

export async function exportVaultSummary(): Promise<string | null> {
  const docs = await loadAllDocuments();
  if (docs.length === 0) return null;

  // Safe export omitting any binary data
  const summary = docs.map(d => ({
    id: d.id,
    category: d.category,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    processingState: d.processingState,
    uploadedAt: d.uploadedAt,
    readabilityScore: d.readabilityScore,
    checksCount: d.checks.length,
    passedChecks: d.checks.filter(c => c.result === 'pass').length,
    warningChecks: d.checks.filter(c => c.result === 'warning').length,
    failedChecks: d.checks.filter(c => c.result === 'fail').length,
    confirmedFields: d.extractedFields.filter(f => !!f.userConfirmedValue).length,
  }));

  return JSON.stringify({ vaultSummary: summary, exportedAt: new Date().toISOString() }, null, 2);
}
