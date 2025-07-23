// src/services/tide/stationService.ts

import { cacheService } from '../cacheService';
import { getDistanceKm } from './geo';

const NOAA_MDAPI_BASE = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';

const STATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
  state?: string;
  userSelectedState?: string;
  distance?: number;
}

/* ---------- validation helpers ---------- */

const isValidStationId = (id: string | null | undefined) =>
  typeof id === 'string' && /^\d+$/.test(id.trim());

// Always fetch from backend API (dynamic, live, no mock data)
export async function getStationsForLocation(
  userInput: string
): Promise<Station[]> {
  const key = `stations:${userInput.toLowerCase()}`;

  if (!userInput || !userInput.trim()) {
    return [];
  }

  const cached = cacheService.get<Station[]>(key);
  if (cached) {
    return cached;
  }

  const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&rows=10000&name=${encodeURIComponent(
    userInput,
  )}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to fetch station list.");
  const data = await response.json();
  const stations = data.stations || [];
  cacheService.set(key, stations, STATION_CACHE_TTL);
  return stations;
}

export async function getStationsNearCoordinates(
  lat: number,
  lon: number,
  radiusKm = 100,
): Promise<Station[]> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Invalid coordinates for station search');
  }
  const key = `stations:${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;

  const cached = cacheService.get<Station[]>(key);
  if (cached) {
    return cached;
  }

  const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&rows=10000&lat=${lat}&lon=${lon}&radius=${radiusKm}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to fetch station list.');
  const data = await response.json();
  const stations = data.stations || [];
  cacheService.set(key, stations, STATION_CACHE_TTL);
  return stations;
}

export async function getStationById(id: string): Promise<Station | null> {
  if (!isValidStationId(id)) {
    return null;
  }
  const key = `station:${id}`;
  const cached = cacheService.get<Station>(key);
  if (cached) {
    return cached;
  }

  const url = `${NOAA_MDAPI_BASE}/stations/${id}.json`;
  try {
    const response = await fetch(url);    if (response.status === 404) return null;
    let data;
    try {
      data = await response.json();    } catch (jsonError) {
      console.error('Error parsing station response JSON:', jsonError);
      throw jsonError;
    }
    if (!response.ok) throw new Error('Unable to fetch station');
    const stationData = Array.isArray(data.stations) ? data.stations[0] : null;
    if (!stationData) {
      console.error('❌ No station found for this ID');
      return null;
    }    const station: Station = {
      id: stationData.id,
      name: stationData.name,
      latitude: parseFloat(stationData.lat ?? stationData.latitude),
      longitude: parseFloat(stationData.lng ?? stationData.longitude),
      state: stationData.state,
    };
    cacheService.set(key, station, STATION_CACHE_TTL);
    return station;
  } catch (error) {
    console.error('Error fetching station by ID:', error);
    throw error;
  }
}

/**
 * Sort NOAA station results with the most relevant first.
 * - Filters out stations that do not support the water_level product.
 * - Prefers reference stations (type "R").
 * - Optionally prioritizes stations whose name contains the resolved city.
 * - Sorts by distance from the provided lat/lon when available.
 */
export function sortStationsForDefault(
  stations: Station[],
  lat?: number,
  lon?: number,
  city?: string,
): Station[] {
  const cityLower = city?.toLowerCase() ?? '';

  const getDist = (s: Station) => {
    if (s.distance != null) return s.distance;
    if (
      lat != null &&
      lon != null &&
      typeof s.latitude === 'number' &&
      typeof s.longitude === 'number'
    ) {
      return getDistanceKm(lat, lon, s.latitude, s.longitude);
    }
    return Infinity;
  };

  return stations
    .filter((s) => {
      const products: string[] = (s as { products?: string[] }).products ?? [];
      return !products.length || products.includes('water_level');
    })
    .sort((a, b) => {
      // city match
      const aCity = cityLower && a.name.toLowerCase().includes(cityLower);
      const bCity = cityLower && b.name.toLowerCase().includes(cityLower);
      if (aCity !== bCity) return aCity ? -1 : 1;

      // type preference
      const aRef = (a as { type?: string }).type === 'R';
      const bRef = (b as { type?: string }).type === 'R';
      if (aRef !== bRef) return aRef ? -1 : 1;

      // distance
      return getDist(a) - getDist(b);
    });
}


