
// src/services/tide/metadata.ts
// --------------------------------------------------
// Provides the NOAA station metadata with fallback to local mapping
// --------------------------------------------------

import { STATION_BY_ZIP } from './stationMap';

/**
 * Fetches the full NOAA station metadata.
 * Falls back to local station mapping if remote data is unavailable.
 */
export async function fetchStationMetadata(): Promise<Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
}>> {
  try {
    // Try to load from a public/data/stations.json file if present
    const res = await fetch('/data/stations.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch stations: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.warn('Remote station data unavailable, using local mapping:', error);
    
    // Fallback to local station mapping
    // Convert STATION_BY_ZIP to the expected format
    return Object.entries(STATION_BY_ZIP).map(([zip, station]) => ({
      id: station.id,
      name: station.name,
      lat: 0, // We don't have lat/lng in STATION_BY_ZIP, but it's not needed for direct mapping
      lng: 0
    }));
  }
}
