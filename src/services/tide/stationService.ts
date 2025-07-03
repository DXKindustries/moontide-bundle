// src/services/tide/stationService.ts

import { cacheService } from '../cacheService';
import { IS_DEV } from '../env';

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
  distance?: number;
}

// Always fetch from backend API (dynamic, live, no mock data)
export async function getStationsForLocation(
  userInput: string
): Promise<Station[]> {
  const key = `stations:${userInput.toLowerCase()}`;

  const cached = cacheService.get<Station[]>(key);
  if (cached) {
    return cached;
  }

  const url = IS_DEV
    ? `/noaa-stations?locationInput=${encodeURIComponent(userInput)}`
    : `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&name=${encodeURIComponent(userInput)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to fetch station list.");
  const data = await response.json();
  const stations = data.stations || [];
  cacheService.set(key, stations, STATION_CACHE_TTL);
  return stations;
}

export async function getStationById(id: string): Promise<Station | null> {
  const key = `station:${id}`;
  const cached = cacheService.get<Station>(key);
  if (cached) return cached;

  const url = IS_DEV
    ? `/noaa-station/${id}`
    : `${NOAA_MDAPI_BASE}/stations/${id}.json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to fetch station');
  const data = await response.json();
  if (!data.station) return null;
  const station: Station = {
    id: data.station.id,
    name: data.station.name,
    latitude: data.station.latitude,
    longitude: data.station.longitude,
    state: data.station.state,
  };
  cacheService.set(key, station, STATION_CACHE_TTL);
  return station;
}
