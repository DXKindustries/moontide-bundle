//--------------------------------------------------------------
// src/utils/localStorage.ts
//--------------------------------------------------------------

/**
 * A super-simple wrapper that:
 *  • Prefixes all keys with 'moon:' so we don’t collide
 *  • Catches quota / privacy errors and falls back to memory
 */

const PREFIX = 'moon:';
const memoryStore: Record<string, string> = {};

function safeGet(key: string): any {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  }
}

function safeSet(key: string, value: any) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    memoryStore[key] = raw; // privacy-mode or quota
  }
}

export const safeLocalStorage = { get: safeGet, set: safeSet };
export type SafeLocalStorage = typeof safeLocalStorage;
