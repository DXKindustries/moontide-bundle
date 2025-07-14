/* ──────────────────────────────────────────────────────────────
   src/services/storage/locationHistory.ts
   Consolidates all station / location history logic.
   Guarantees one entry per NOAA station by normalising IDs and
   applying “move-to-front” de-duplication on each save.
   ────────────────────────────────────────────────────────────── */

import { safeLocalStorage } from '../../utils/localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';
import type { Station } from '@/services/tide/stationService';

/* Consistent storage keys used across the entire app */
const LOCATION_HISTORY_KEY = 'moon:location-history';
const STATION_HISTORY_KEY  = 'moon:station-history';

/* ─────────────────────────────── Types */

const NUMERIC_ID_RE = /^\d+$/;

export interface SavedLocation {
  stationId  : string;          // canonical, always numeric
  stationName: string;
  nickname   : string;
  lat        : number;
  lng        : number;
  city?      : string;
  state?     : string;
  zipCode?   : string;
  sourceType : 'station';
  timestamp  : number;
}

/* ─────────────────────────────── Normaliser */

/**
 * Normalise any Station, LocationHistoryEntry, or hybrid object
 * into a strict SavedLocation shape. Ensures `stationId` is always
 * the numeric NOAA ID so de-duplication works reliably.
 */
export function normalizeStation(
  record: Partial<Station & LocationHistoryEntry>,
): SavedLocation {
  const rawId = String(record.stationId ?? record.id ?? '').trim();
  const id    = NUMERIC_ID_RE.test(rawId) ? rawId : '';

  if (!id) {
    throw new Error(`[storage] normalizeStation → invalid NOAA id "${rawId || '<empty>'}"`);
  }

  return {
    stationId  : id,
    stationName: (record.stationName ?? record.name ?? '').trim(),
    nickname   : (record.nickname ?? record.name ?? record.stationName ?? '').trim(),
    lat        : Number(record.lat ?? record.latitude),
    lng        : Number(record.lng ?? record.longitude),
    city       : record.city  ?? '',
    state      : record.state ?? '',
    zipCode    : record.zipCode ?? '',
    sourceType : 'station',
    timestamp  : Date.now(),
  };
}

/* Also export a UK-spelling alias for any new code */
export { normalizeStation as normaliseStation };

/* ─────────────────────────────── Location history (UI dropdown) */

export function getLocationHistory(): SavedLocation[] {
  return safeLocalStorage.get<SavedLocation[]>(LOCATION_HISTORY_KEY) ?? [];
}

export function saveLocationHistory(item: Station | LocationHistoryEntry): void {
  const entry = normalizeStation(item);
  const next  = [entry, ...getLocationHistory().filter(h => h.stationId !== entry.stationId)]
                  .slice(0, 10);
  safeLocalStorage.set(LOCATION_HISTORY_KEY, next);
}

export function clearLocationHistory(): void {
  safeLocalStorage.remove(LOCATION_HISTORY_KEY);
}

/* ─────────────────────────────── Station history (recent stations) */

export type StationHistoryItem = SavedLocation;

export function getStationHistory(): StationHistoryItem[] {
  return safeLocalStorage.get<StationHistoryItem[]>(STATION_HISTORY_KEY) ?? [];
}

export function saveStationHistory(item: Station | LocationHistoryEntry): void {
  const entry = normalizeStation(item);
  const next  = [entry, ...getStationHistory().filter(s => s.stationId !== entry.stationId)]
                  .slice(0, 10);
  safeLocalStorage.set(STATION_HISTORY_KEY, next);
}

export function clearStationHistory(): void {
  safeLocalStorage.remove(STATION_HISTORY_KEY);
}

/* ─────────────────────────────── One-time cleanup helper
   Run `scrubHistoryKeys()` once in DevTools to purge legacy
   duplicate rows that were stored before this fix.            */

export function scrubHistoryKeys(): void {
  [LOCATION_HISTORY_KEY, STATION_HISTORY_KEY].forEach(key => {
    const arr = safeLocalStorage.get<SavedLocation[]>(key);
    if (!Array.isArray(arr)) return;

    const map = new Map<string, SavedLocation>();
    arr.forEach(item => {
      try {
        const norm = normalizeStation(item);
        map.set(norm.stationId, norm);          // keep newest per key
      } catch { /* ignore rows lacking a numeric id */ }
    });

    safeLocalStorage.set(key, Array.from(map.values()).slice(0, 10));
  });
}
