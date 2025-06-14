// src/services/tide/stationService.ts
// --------------------------------------------------
// Nearest-station resolver  +  saved-station helpers
// --------------------------------------------------

import { fetchStationMetadata } from './metadata';
import { getDistanceKm } from './geo';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. In-memory caches
// ────────────────────────────────────────────────────────────────────────────
let metadataCache: Station[] | null = null;
const nearestCache: Record<string, Station | null> = {};

// ────────────────────────────────────────────────────────────────────────────
// 2. Local-storage helpers (optional but keeps prior API intact)
// ────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mt_nearest_station_by_zip';

function loadFromStorage(): Record<string, Station> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Station>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: Record<string, Station>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* silent — quota or private-mode failures are non-fatal */
  }
}

// pull once to merge with in-memory cache
const persisted = loadFromStorage();
Object.assign(nearestCache, persisted);

// ---------------------------------------------------------------------------
// 3. Load metadata once
// ---------------------------------------------------------------------------
async function loadMetadata(): Promise<Station[]> {
  if (metadataCache) return metadataCache;
  metadataCache = await fetchStationMetadata();
  return metadataCache;
}

// ---------------------------------------------------------------------------
// 4. PUBLIC: find or recall the nearest station ≤ 50 km
// ---------------------------------------------------------------------------
export async function getNearestStation(
  zip: string,
  lat: number,
  lng: number
): Promise<Station | null> {
  // return immediately if we already have one cached
  if (nearestCache.hasOwnProperty(zip)) return nearestCache[zip];

  const stations = await loadMetadata();

  const nearest =
    stations
      .map((s) => ({
        ...s,
        distanceKm: getDistanceKm(lat, lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .find((s) => s.distanceKm <= 50) ?? null;

  // cache in memory + storage so future loads are instant
  nearestCache[zip] = nearest || null;
  if (nearest) {
    saveToStorage(nearestCache as Record<string, Station>);
  }

  return nearest;
}

// ---------------------------------------------------------------------------
// 5. PUBLIC (legacy): get any previously saved station for this ZIP
//    -- keeps older code that expected this function from breaking
// ---------------------------------------------------------------------------
export function getSavedStationForLocation(zip: string): Station | null {
  return nearestCache[zip] ?? null;
}
