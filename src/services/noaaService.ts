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
  console.log('[DEBUG] getStationsForUserLocation params:', { userInput, lat, lon });
  if (lat != null && lon != null) {
    const urlNear = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&lat=${lat}&lon=${lon}&radius=100`;
    console.log('[DEBUG] NOAA fetch URL:', urlNear);
    const nearby = await getStationsNearCoordinates(lat, lon);
    if (nearby.length > 0) return nearby;
  }
  const urlSearch = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&name=${encodeURIComponent(userInput)}`;
  console.log('[DEBUG] NOAA fetch URL:', urlSearch);
  return getStationsForLocation(userInput);
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
