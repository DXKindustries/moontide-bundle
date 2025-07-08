//--------------------------------------------------------------
// src/utils/localStorage.ts
//--------------------------------------------------------------

/**
 * A bullet-proof wrapper around local storage.
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

function safeGet<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // quota exceeded or privacy-mode
    return memoryStore[key] ? (JSON.parse(memoryStore[key]) as T) : null;
  }
}

function safeSet<T>(key: string, value: T): void {
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

export const safeLocalStorage = {
  get: safeGet,
  set: safeSet,
} as {
  get: typeof safeGet;
  set: typeof safeSet;
  getItem?: typeof safeGet;
  setItem?: typeof safeSet;
};

// ── legacy method aliases ───────────────────────────────────
safeLocalStorage.getItem = safeGet;
safeLocalStorage.setItem = safeSet;

// helpful TypeScript alias if other files want it
export type SafeLocalStorage = typeof safeLocalStorage;
