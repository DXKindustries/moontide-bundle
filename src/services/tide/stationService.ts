/* -------------------------------------------------------------------------- */
/*  src/services/tide/stationService.ts                                       */
/* -------------------------------------------------------------------------- */
/*  Tide-station metadata helpers — returns all nearby stations and keeps     */
/*  per-ZIP user preferences. Legacy URLs removed (no more redirect CORS).    */

import { safeLocalStorage } from '@/utils/localStorage';

/* ----------------------------- Type guards -------------------------------- */

export interface NoaaStation {
  id: string;        // "8452660"
  name: string;      // "South Ferry, Narragansett Bay"
  lat: number;
  lng: number;
  distance: number;  // km from query point (provided by NOAA MDAPI)
}

/* ----------------------------- Constants ---------------------------------- */

const BASE =
  'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi'; // cloud host — no 301

const ZIP_STATION_KEY = 'zipToStation'; // localStorage map { zip: stationId }

/* ------------------------- Fetch helpers ---------------------------------- */

/**
 * Fetch every tide-prediction station within `radiusKm` of the given point.
 * Returns an empty array for inland ZIPs or out-of-coverage areas.
 */
export async function fetchNearbyStations(
  lat: number,
  lng: number,
  radiusKm = 10
): Promise<NoaaStation[]> {
  const url =
    `${BASE}/stations.json?type=tidepredictions&lat=${lat}&lng=${lng}&radius=${radiusKm}`;

  const res = await fetch(url);
  if (!res.ok) {
    // 404 / 400 / 204 mean “no station” – treat as empty list
    if (res.status === 404 || res.status === 400 || res.status === 204) {
      return [];
    }
    throw new Error(`noaaError:${res.status}`);
  }

  const json = await res.json();
  if (!json?.stations?.length) return [];

  return json.stations.map((s: any) => ({
    id: s.id,
    name: s.name,
    lat: Number(s.lat),
    lng: Number(s.lng),
    distance: Number(s.distance),
  }));
}

/**
 * Convenience: return the nearest station (first item) or throw 'noStation'.
 */
console.log('DEBUG nearest station 02882 →', getNearestStation('02882'));

export async function getNearestStation(
  lat: number,
  lng: number,
  radiusKm = 10
): Promise<NoaaStation> {
  const list = await fetchNearbyStations(lat, lng, radiusKm);
  if (list.length === 0) throw new Error('noStation');
  return list[0];
}

/* -------------------------------------------------------------------------- */
/*  Back-compat shim — keeps older imports working until we refactor          */
/* -------------------------------------------------------------------------- */

/**
 * @deprecated  Use `getNearestStation` or `fetchNearbyStations` instead.
 * Quickly forwards to `getNearestStation` so legacy code keeps working.
 */
export const getStationForLocation = getNearestStation;

/* ---------------------- Per-ZIP preference helpers ------------------------ */

/**
 * Persist the station a user picks for a ZIP so the choice sticks on reload.
 */
export function saveStationForLocation(zipCode: string, stationId: string) {
  const raw = safeLocalStorage.getItem(ZIP_STATION_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  map[zipCode] = stationId;
  safeLocalStorage.setItem(ZIP_STATION_KEY, JSON.stringify(map));
}

/**
 * Retrieve the previously saved stationId for a ZIP, if any.
 */
export function getSavedStationForLocation(
  zipCode: string
): string | undefined {
  const raw = safeLocalStorage.getItem(ZIP_STATION_KEY);
  if (!raw) return undefined;
  try {
    const map: Record<string, string> = JSON.parse(raw);
    return map[zipCode];
  } catch {
    return undefined;
  }
}
