//--------------------------------------------------------------
// src/services/tide/stationService.ts
//--------------------------------------------------------------

/**
 * Helper functions for resolving a ZIP → NOAA station.
 *
 * Order of resolution
 *   1. Hard-coded STATION_BY_ZIP map   (instant, never fails)
 *   2. Cached match in safeLocalStorage
 *   3. Live radius search (fetchNearbyStations)
 */

import { safeLocalStorage } from '@/utils/localStorage';
import { STATION_BY_ZIP } from './stationMap';                // ← NEW
import { fetchNearbyStations } from './tideService';          // your existing helper
// If your NoaaStation type lives elsewhere, adjust this import:
import type { NoaaStation } from './tideService';

const STATION_CACHE_KEY = 'stationCache';

/*───────────────────────────────────────────────────────────*/
/*  Local cache helpers                                      */
/*───────────────────────────────────────────────────────────*/

function getStationCache(): Record<string, NoaaStation> {
  return safeLocalStorage.get(STATION_CACHE_KEY) ?? {};
}

function saveStationCache(zip: string, station: NoaaStation) {
  const cache = getStationCache();
  cache[zip] = station;
  safeLocalStorage.set(STATION_CACHE_KEY, cache);
}

/*───────────────────────────────────────────────────────────*/
/*  Public API                                               */
/*───────────────────────────────────────────────────────────*/

/**
 * Return the NOAA station for a given ZIP + lat/lng.
 * • Checks hard-coded map first
 * • Falls back to cache
 * • Final attempt: radius search within `radiusKm`
 */
export async function getNearestStation(
  zip: string,
  lat: number,
  lng: number,
  radiusKm = 50
): Promise<NoaaStation | null> {
  // 1. Hard-coded fallback (guaranteed success for known ZIPs)
  if (STATION_BY_ZIP[zip]) {
    return STATION_BY_ZIP[zip] as unknown as NoaaStation;
  }

  // 2. safeLocalStorage cache
  const cache = getStationCache();
  if (cache[zip]) return cache[zip];

  // 3. Live radius search
  try {
    const list = await fetchNearbyStations(lat, lng, radiusKm);
    if (list.length) {
      saveStationCache(zip, list[0]);      // memoise for next time
      return list[0];
    }
  } catch (err) {
    console.error('station lookup error:', err);
  }

  return null; // graceful failure (UI will show “No tide data”)
}

/**
 * Back-compat alias for older code that imported _getNearestStation.
 * Remove once all callers migrate to getNearestStation().
 */
export const _getNearestStation = getNearestStation;
