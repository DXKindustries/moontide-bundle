// src/services/tide/stationService.ts
// ────────────────────────────────────────────────────────────────────────────
// Cached NOAA station metadata   +   nearest-station resolver   +   helpers
// ────────────────────────────────────────────────────────────────────────────

import { fetchStationMetadata } from './metadata';
import { getDistanceKm } from './geo';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// In-memory caches ----------------------------------------------------------
let metadataCache: Station[] | null = null;
const nearestCache: Record<string, Station | null> = {};

// Local-storage helpers (persist nearest per-ZIP) ---------------------------
const STORAGE_KEY = 'mt_nearest_station_by_zip';

function loadFromStorage(): Record<string, Station> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Station>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: Record<string, Station | null>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private-mode failures */
  }
}

// Merge persisted cache once at module load
Object.assign(nearestCache, loadFromStorage());

// Metadata loader -----------------------------------------------------------
async function loadMetadata(): Promise<Station[]> {
  if (metadataCache) return metadataCache;
  metadataCache = await fetchStationMetadata();
  return metadataCache;
}

/**
 * Find the nearest station ≤ 50 km for a given lat/lng.
 * Results are memoised in memory and localStorage (by ZIP).
 */
export async function getNearestStation(
  zip: string,
  lat: number,
  lng: number
): Promise<Station | null> {
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

  nearestCache[zip] = nearest;
  saveToStorage(nearestCache);
  return nearest;
}

/**
 * Return any previously stored nearest-station for this ZIP,
 * or null if none has been cached yet.
 */
export function getSavedStationForLocation(zip: string): Station | null {
  return nearestCache[zip] ?? null;
}
