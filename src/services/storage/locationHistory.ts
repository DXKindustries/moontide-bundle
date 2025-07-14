/* ──────────────────────────────────────────────────────────────
   src/services/storage/locationHistory.ts
   Guarantees a single, de-duplicated record per NOAA station.
   All entries now share the same schema and always carry a
   numeric `stationId`, eliminating “Arnica Bay vs 8730561” dupes.
   ────────────────────────────────────────────────────────────── */

import { safeLocalStorage } from '../../utils/localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';
import type { Station } from '@/services/tide/stationService';

/* Storage keys used everywhere in the UI */
const LOCATION_HISTORY_KEY = 'moon:location-history';
const STATION_HISTORY_KEY  = 'moon:station-history';

/* ⬡ util ────────────────────────────────────────────────────── */

const NUMERIC_ID_RE = /^\d+$/;

export interface SavedLocation {
  stationId  : string;                // canonical, always numeric
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

/** Normalise any incoming object into a strict SavedLocation shape. */
export function normaliseStation(
  record: Partial<Station & LocationHistoryEntry>,
): SavedLocation {

  const rawId = String(record.stationId ?? record.id ?? '').trim();
  const id    = NUMERIC_ID_RE.test(rawId) ? rawId : '';

  if (!id) {
    throw new Error(
      `[storage] normaliseStation → invalid NOAA id "${rawId || '<empty>'}"`,
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

/* ⬡ location-history  (recent locations dropdown) ───────────── */

export function getLocationHistory(): SavedLocation[] {
  return safeLocalStorage.get<SavedLocation[]>(LOCATION_HISTORY_KEY) ?? [];
}

export function saveLocationHistory(item: Station | LocationHistoryEntry): void {
  const entry   = normaliseStation(item);
  const dedup   = getLocationHistory().filter(h => h.stationId !== entry.stationId);
  const next    = [entry, ...dedup].slice(0, 10);
  safeLocalStorage.set(LOCATION_HISTORY_KEY, next);
}

export function clearLocationHistory(): void {
  safeLocalStorage.remove(LOCATION_HISTORY_KEY);
}

/* ⬡ station-history  (recent stations pane) ─────────────────── */

export type StationHistoryItem = SavedLocation;

export function getStationHistory(): StationHistoryItem[] {
  return safeLocalStorage.get<StationHistoryItem[]>(STATION_HISTORY_KEY) ?? [];
}

export function saveStationHistory(item: Station | LocationHistoryEntry): void {
  const entry   = normaliseStation(item);
  const dedup   = getStationHistory().filter(s => s.stationId !== entry.stationId);
  const next    = [entry, ...dedup].slice(0, 10);
  safeLocalStorage.set(STATION_HISTORY_KEY, next);
}

export function clearStationHistory(): void {
  safeLocalStorage.remove(STATION_HISTORY_KEY);
}

/* ⬡ one-shot maintenance helper (optional) ────────────────────
   Call `scrubHistoryKeys()` once in DevTools to purge legacy
   duplicate rows that were stored before this fix.               */

export function scrubHistoryKeys(): void {
  [LOCATION_HISTORY_KEY, STATION_HISTORY_KEY].forEach(key => {
    const arr = safeLocalStorage.get<SavedLocation[]>(key);
    if (!Array.isArray(arr)) return;

    const map = new Map<string, SavedLocation>();
    arr.forEach(item => {
      try {
        const norm = normaliseStation(item);
        map.set(norm.stationId, norm);         // keeps newest per key
      } catch { /* ignore rows that lack a numeric id */ }
    });

    safeLocalStorage.set(key, Array.from(map.values()).slice(0, 10));
  });
}
