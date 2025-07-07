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
    const stationId = '';
    const startDate = '';
    const endDate = '';
    const url = urlNear;
    console.log('[NOAA-DEBUG] Request URL:', {
      fullURL: url,
      params: {
        station: stationId,
        begin_date: startDate,
        end_date: endDate,
        product: 'predictions',
        interval: '6'
      },
      timestamp: new Date().toISOString()
    });
    const nearby = await getStationsNearCoordinates(lat, lon);
    const data = { stations: nearby };
    const lng = lon;
    console.log('[NOAA-DEBUG] Nearby Stations:', {
      radius: '30km',
      validStations: data.stations
        .filter(s => s.type === 'T') // Only tide stations
        .map(s => ({
          id: s.id,
          name: s.name,
          distance: `${(calculateDistance(lat, lng, s.lat, s.lng)).toFixed(1)}km`,
          active: s.id === stationId
        }))
    });
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
