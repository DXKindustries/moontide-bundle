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

function listKeys(prefix = ''): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) {
        keys.push(k.slice(PREFIX.length));
      }
    }
  } catch {
    for (const k of Object.keys(memoryStore)) {
      if (k.startsWith(prefix)) keys.push(k);
    }
  }
  return keys;
}

/*───────────────────────────────────────────────────────────*/
/*  Public API                                               */
/*───────────────────────────────────────────────────────────*/

export const safeLocalStorage = {
  get: safeGet,
  set: safeSet,
  keys: listKeys,
} as {
  get: typeof safeGet;
  set: typeof safeSet;
  keys: typeof listKeys;
  getItem?: typeof safeGet;
  setItem?: typeof safeSet;
};

// ── legacy method aliases ───────────────────────────────────
safeLocalStorage.getItem = safeGet;
safeLocalStorage.setItem = safeSet;

// helpful TypeScript alias if other files want it
export type SafeLocalStorage = typeof safeLocalStorage;
