
// src/services/tide/stationService.ts
// ────────────────────────────────────────────────────────────────────────────
// Cached NOAA station metadata   +   nearest-station resolver   +   helpers
// ────────────────────────────────────────────────────────────────────────────

import { fetchStationMetadata } from './metadata';
import { getDistanceKm } from './geo';
import { STATION_BY_ZIP } from './stationMap';

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
 * First checks direct ZIP mapping, then falls back to distance search.
 * Results are memoised in memory and localStorage (by ZIP).
 */
export async function getNearestStation(
  zip: string,
  lat: number,
  lng: number
): Promise<Station | null> {
  // Return cached result if available
  if (nearestCache.hasOwnProperty(zip)) return nearestCache[zip];

  // First priority: Check direct ZIP mapping
  if (STATION_BY_ZIP[zip]) {
    const station: Station = {
      id: STATION_BY_ZIP[zip].id,
      name: STATION_BY_ZIP[zip].name,
      lat: lat, // Use provided coordinates
      lng: lng
    };
    nearestCache[zip] = station;
    saveToStorage(nearestCache);
    console.log(`Found direct ZIP mapping for ${zip}: ${station.name} (${station.id})`);
    return station;
  }

  // Second priority: Try comprehensive station search
  try {
    const stations = await loadMetadata();
    
    // If we only have local mapping data (lat/lng = 0), skip distance calculation
    if (stations.length > 0 && stations[0].lat === 0 && stations[0].lng === 0) {
      console.log('Only local station mapping available, no distance search possible');
      nearestCache[zip] = null;
      saveToStorage(nearestCache);
      return null;
    }

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
  } catch (error) {
    console.warn('Station metadata search failed:', error);
    nearestCache[zip] = null;
    saveToStorage(nearestCache);
    return null;
  }
}

/**
 * Return any previously stored nearest-station for this ZIP,
 * or null if none has been cached yet.
 */
export function getSavedStationForLocation(zip: string): Station | null {
  return nearestCache[zip] ?? null;
}
