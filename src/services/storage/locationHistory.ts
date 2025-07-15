/* ──────────────────────────────────────────────────────────────
   src/services/storage/locationHistory.ts
   Eliminates duplicate / malformed history rows.
   Keys: 'station-history'  and  'location-history'
   safeLocalStorage itself prefixes them with "moon:", so DO NOT
   include "moon:" here.
   ────────────────────────────────────────────────────────────── */

import { safeLocalStorage } from '../../utils/localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';
import type { Station } from '@/services/tide/stationService';

/* Consistent keys (without leading "moon:") */
const LOCATION_HISTORY_KEY = 'location-history';
const STATION_HISTORY_KEY  = 'station-history';

/* ───────── Types & helpers */

const NUMERIC_ID_RE = /^\d+$/;

function validId(record: Partial<Station & LocationHistoryEntry>): string | null {
  const raw = String(record.stationId ?? record.id ?? '').trim();
  return NUMERIC_ID_RE.test(raw) ? raw : null;
}

export interface SavedLocation {
  stationId  : string;   // numeric NOAA id – canonical
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

/** Normalise incoming data so stationId is always numeric. */
export function normalizeStation(
  record: Partial<Station & LocationHistoryEntry>,
): SavedLocation {
  const rawId = String(record.stationId ?? record.id ?? '').trim();
  const id    = NUMERIC_ID_RE.test(rawId) ? rawId : '';

  if (!id) {
    throw new Error(
      `[storage] normalizeStation → invalid NOAA id "${rawId || '<empty>'}"`,
    );
  }

  return {
    stationId  : id,
    stationName: (record.stationName ?? record.name ?? '').trim(),
    nickname   : (record.nickname   ?? record.name ?? record.stationName ?? '').trim(),
    lat        : Number(record.lat ?? record.latitude),
    lng        : Number(record.lng ?? record.longitude),
    city       : record.city  ?? '',
    state      : record.state ?? '',
    zipCode    : record.zipCode ?? '',
    sourceType : 'station',
    timestamp  : Date.now(),
  };
}

/* UK-spelling alias in case any new code imports it */
export { normalizeStation as normaliseStation };

/* ───────── Location-history (UI dropdown) */

export function getLocationHistory(): SavedLocation[] {
  return safeLocalStorage.get<SavedLocation[]>(LOCATION_HISTORY_KEY) ?? [];
}

export function saveLocationHistory(item: Station | LocationHistoryEntry): void {
  const id = validId(item);
  if (!id) {
    console.error('[storage] saveLocationHistory → invalid station ID');
    return;
  }
  const entry = normalizeStation(item);
  const next  = [entry, ...getLocationHistory().filter(h => h.stationId !== entry.stationId)]
                  .slice(0, 10);
  safeLocalStorage.set(LOCATION_HISTORY_KEY, next);
}

export function clearLocationHistory(): void {
  safeLocalStorage.remove(LOCATION_HISTORY_KEY);
}

/* ───────── Station-history (recent stations) */

export type StationHistoryItem = SavedLocation;

export function getStationHistory(): StationHistoryItem[] {
  return safeLocalStorage.get<StationHistoryItem[]>(STATION_HISTORY_KEY) ?? [];
}

export function saveStationHistory(item: Station | LocationHistoryEntry): void {
  const id = validId(item);
  if (!id) {
    console.error('[storage] saveStationHistory → invalid station ID');
    return;
  }
  const entry = normalizeStation(item);
  const next  = [entry, ...getStationHistory().filter(s => s.stationId !== entry.stationId)]
                  .slice(0, 10);
  safeLocalStorage.set(STATION_HISTORY_KEY, next);
}

export function clearStationHistory(): void {
  safeLocalStorage.remove(STATION_HISTORY_KEY);
}

/* ───────── One-time scrub (executes on first import)
   1. Removes the legacy double-prefixed keys (moon:moon:*).
   2. Deduplicates & normalises any existing rows.
   3. Drops rows that still lack a numeric NOAA id.              */

(function scrubOnLoad() {
  // purge obsolete keys written by the previous mis-prefix
  ['moon:moon:location-history', 'moon:moon:station-history'].forEach(
    oldKey => localStorage.removeItem(oldKey),
  );

  const scrub = (key: string) => {
    const arr = safeLocalStorage.get<SavedLocation[]>(key) ?? [];
    const map = new Map<string, SavedLocation>();

    arr.forEach(item => {
      if (!validId(item)) return; // skip invalid entries
      try {
        const norm = normalizeStation(item);
        map.set(norm.stationId, norm);   // keeps newest per id
      } catch {
        /* ignore rows with invalid id */
      }
    });

    safeLocalStorage.set(key, Array.from(map.values()).slice(0, 10));
  };

  scrub(LOCATION_HISTORY_KEY);
  scrub(STATION_HISTORY_KEY);
})();
