import { safeLocalStorage } from '@/utils/localStorage';
import { NoaaStation } from './types';
import { NOAA_API_BASE_URL, STATION_MAP_KEY } from './constants';
import { haversineDistance } from './utils';

/**
 * Get the nearest NOAA station for given lat/lng.
 * Due to CORS limitations, this version returns null to avoid failed fetch calls.
 */
export async function getNearestStation(lat: number, lng: number): Promise<NoaaStation | null> {
  // Disabled fetch call due to browser CORS restrictions.
  // The caller must handle null return gracefully.
  return null;
}

/**
 * Save station info for a location in localStorage.
 */
export function saveStationForLocation(locationKey: string, station: NoaaStation): void {
  const stationMap = safeLocalStorage.getItem(STATION_MAP_KEY, {});
  stationMap[locationKey] = station;
  safeLocalStorage.setItem(STATION_MAP_KEY, stationMap);
}
