// src/services/tide/stationService.ts

import { cacheService } from '../cacheService';

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

  const response = await fetch(
    `/noaa-stations?locationInput=${encodeURIComponent(userInput)}`
  );
  if (!response.ok) throw new Error("Unable to fetch station list.");
  const data = await response.json();
  const stations = data.stations || [];
  cacheService.set(key, stations, STATION_CACHE_TTL);
  return stations;
}
