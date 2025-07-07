// src/services/noaaService.ts

import {
  getStationsForLocation,
  getStationsNearCoordinates,
} from './tide/stationService';
import { Station } from './tide/stationService';
import { getDistanceKm as calculateDistance } from './tide/geo';

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
    console.log('[STATIONS] Nearby Stations:', {
      radius: '30km',
      count: nearby.length,
      stations: nearby.map(s => ({
        id: s.id,
        name: s.name,
        active: (s as any).type === 'T',
        distance: `${calculateDistance(lat, lon, s.latitude, s.longitude).toFixed(1)}km`
      }))
    });
    if (nearby.length > 0) return nearby;
  }
  const urlSearch = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&name=${encodeURIComponent(userInput)}`;
  console.log('[DEBUG] NOAA fetch URL:', urlSearch);
  const stations = await getStationsForLocation(userInput);
  console.log('[STATIONS] Nearby Stations:', {
    radius: '30km',
    count: stations.length,
    stations: stations.map(s => ({
      id: s.id,
      name: s.name,
      active: (s as any).type === 'T',
      distance:
        lat != null && lon != null
          ? `${calculateDistance(lat, lon, s.latitude, s.longitude).toFixed(1)}km`
          : undefined
    }))
  });
  return stations;
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
