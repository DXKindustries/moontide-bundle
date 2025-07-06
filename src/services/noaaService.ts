// src/services/noaaService.ts

import {
  getStationsForLocation,
  getStationsNearCoordinates,
} from './tide/stationService';
import { Station } from './tide/stationService';

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
    const nearby = await getStationsNearCoordinates(lat, lon, 30);
    if (nearby.length > 0) return nearby;
    console.log('🔄 Falling back to name search with distance filter');
    return getStationsForLocation(userInput, lat, lon, 30);
  }
  return getStationsForLocation(userInput);
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
