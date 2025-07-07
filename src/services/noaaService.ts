// src/services/noaaService.ts

import {
  getStationsForLocation,
  getStationsNearCoordinates,
} from './tide/stationService';
import { Station } from './tide/stationService';

const NOAA_MDAPI_BASE = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';

// Always use dynamic live lookup for NOAA stations
export async function getStationsForUserLocation(
  userInput: string,
  lat?: number,
  lon?: number,
): Promise<Station[]> {
  console.log('🔎 getStationsForUserLocation:', {
    userInput,
    lat,
    lon,
  });
  if (lat != null && lon != null) {
    const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&lat=${lat}&lon=${lon}&radius=30`;
    console.log('[DEBUG] NOAA Service Request:', url);
    const nearby = await getStationsNearCoordinates(lat, lon, 30);
    if (nearby.length > 0) return nearby;
    console.log('🔄 Falling back to name search with distance filter');
    const fallbackUrl = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&name=${encodeURIComponent(userInput)}`;
    console.log('[DEBUG] NOAA Service Request:', fallbackUrl);
    return getStationsForLocation(userInput, lat, lon, 30);
  }
  const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&name=${encodeURIComponent(userInput)}`;
  console.log('[DEBUG] NOAA Service Request:', url);
  return getStationsForLocation(userInput);
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
