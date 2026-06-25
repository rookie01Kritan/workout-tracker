// src/hooks/useAudioDB.js
// ============================================================
// IndexedDB helper for storing audio files permanently
// in the browser. No backend needed.
//
// Database name : WorkoutAudioDB
// Store name    : audioFiles
// Key           : exercise id (number)
// Value         : { id, file (Blob), fileName, type }
// ============================================================

const DB_NAME    = "WorkoutAudioDB";
const DB_VERSION = 1;
const STORE_NAME = "audioFiles";

// ── Open (or create) the database ────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Runs once when DB is first created or version changes
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror   = (event) => reject(event.target.error);
  });
}

// ── Save audio file to IndexedDB ─────────────────────────────
// id       — exercise id (used as key)
// file     — the raw File object from input[type=file]
export async function saveAudioFile(id, file) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        file:     file,          // raw Blob/File — stored as-is
        fileName: file.name,
        type:     file.type,
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror   = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("saveAudioFile failed:", err);
    return false;
  }
}

// ── Load audio file from IndexedDB ───────────────────────────
// Returns a blob URL string you can pass to new Audio()
// Returns null if nothing found
export async function loadAudioFile(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx      = db.transaction(STORE_NAME, "readonly");
      const store   = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const record = event.target.result;
        if (!record) {
          resolve(null);
          return;
        }
        // Convert stored Blob back to a fresh blob URL
        const blobUrl = URL.createObjectURL(record.file);
        resolve(blobUrl);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("loadAudioFile failed:", err);
    return null;
  }
}

// ── Delete audio file from IndexedDB ─────────────────────────
// Call this when exercise is deleted
export async function deleteAudioFile(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx      = db.transaction(STORE_NAME, "readwrite");
      const store   = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror   = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("deleteAudioFile failed:", err);
    return false;
  }
}

// ── Check if audio exists for an exercise ────────────────────
export async function hasAudioFile(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx      = db.transaction(STORE_NAME, "readonly");
      const store   = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event) => resolve(!!event.target.result);
      request.onerror   = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("hasAudioFile failed:", err);
    return false;
  }
}