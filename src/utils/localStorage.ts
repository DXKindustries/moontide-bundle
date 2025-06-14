//--------------------------------------------------------------
// src/utils/localStorage.ts
//--------------------------------------------------------------

/**
 * A bullet-proof wrapper around browser localStorage.
 *
 * • All keys are prefixed with "moon:" so we never collide with
 *   other libraries.
 * • Falls back to an in-memory object when running in private
 *   mode or when quota errors occur.
 * • Exposes both modern helpers (get / set) **and** legacy
 *   aliases (getItem / setItem) so older components keep working.
 */

const PREFIX = 'moon:';

// fallback store for Safari-private, incognito, etc.
const memoryStore: Record<string, string> = {};

/*───────────────────────────────────────────────────────────*/
/*  Internal helpers                                         */
/*───────────────────────────────────────────────────────────*/

function safeGet(key: string): any {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // quota exceeded or privacy-mode
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  }
}

function safeSet(key: string, value: any) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    memoryStore[key] = raw; // fallback
  }
}

/*───────────────────────────────────────────────────────────*/
/*  Public API                                               */
/*───────────────────────────────────────────────────────────*/

export const safeLocalStorage: {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  /** legacy aliases so older code (getItem / setItem) still works */
  getItem?: (key: string) => any;
  setItem?: (key: string, value: any) => void;
} = {
  get: safeGet,
  set: safeSet,
};

// ── legacy method aliases ───────────────────────────────────
safeLocalStorage.getItem = safeGet;
safeLocalStorage.setItem = safeSet;

// helpful TypeScript alias if other files want it
export type SafeLocalStorage = typeof safeLocalStorage;
