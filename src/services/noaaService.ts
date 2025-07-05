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
  if (lat != null && lon != null) {
    const nearby = await getStationsNearCoordinates(lat, lon);
    if (nearby.length > 0) return nearby;
  }
  return getStationsForLocation(userInput);
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
