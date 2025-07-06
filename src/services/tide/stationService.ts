// src/services/tide/stationService.ts
import { cacheService } from '../cacheService';
import { getDistanceKm } from '@/utils/geoUtils';

const NOAA_MDAPI_BASE = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';
const STATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  distance?: number;
  products?: string[];
  type?: string;
}

export async function getStationsNearCoordinates(
  lat: number,
  lon: number,
  radiusKm = 30
): Promise<Station[]> {
  const cacheKey = `stations:${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
  
  try {
    // Return cached stations if available
    const cached = cacheService.get<Station[]>(cacheKey);
    if (cached?.length) {
      console.log('📡 Using cached stations:', cached.length);
      return cached;
    }

    console.log('🌐 Fetching stations from NOAA API...');
    const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&lat=${lat}&lon=${lon}&radius=${radiusKm}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NOAA API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawStations: any[] = data.stations || [];
    console.log('📦 Raw stations received:', rawStations.length);

    // Process and filter stations
    const processedStations = rawStations
      .map(station => {
        const stationLat = parseFloat(station.lat || station.latitude);
        const stationLon = parseFloat(station.lng || station.longitude);
        
        return {
          id: station.id,
          name: station.name,
          latitude: stationLat,
          longitude: stationLon,
          state: station.state,
          products: station.products,
          type: station.type,
          distance: getDistanceKm(lat, lon, stationLat, stationLon)
        };
      })
      .filter(station => {
        const hasTideData = station.products?.includes('tidepredictions');
        const withinRadius = station.distance <= radiusKm;
        const hasValidCoords = !isNaN(station.latitude) && !isNaN(station.longitude);
        
        return hasTideData && withinRadius && hasValidCoords;
      })
      .sort((a, b) => a.distance - b.distance);

    console.log(`📊 Filtered to ${processedStations.length} valid stations`);

    // Cache only if we have valid stations
    if (processedStations.length > 0) {
      cacheService.set(cacheKey, processedStations, STATION_CACHE_TTL);
    }

    return processedStations;
  } catch (error) {
    console.error('Failed to fetch stations:', error);
    throw error;
  }
}

export async function getClosestStation(
  lat: number,
  lon: number,
  radiusKm = 30
): Promise<Station | null> {
  try {
    const stations = await getStationsNearCoordinates(lat, lon, radiusKm);
    if (!stations.length) {
      console.warn('No stations found within', radiusKm, 'km radius');
      return null;
    }
    return stations[0];
  } catch (error) {
    console.error('Failed to find closest station:', error);
    return null;
  }
}

export async function getStationById(id: string): Promise<Station | null> {
  const cacheKey = `station:${id}`;
  
  try {
    // Check cache first
    const cached = cacheService.get<Station>(cacheKey);
    if (cached) {
      console.log('📡 Using cached station:', id);
      return cached;
    }

    console.log('🌐 Fetching station details from NOAA API:', id);
    const url = `${NOAA_MDAPI_BASE}/stations/${id}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NOAA API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.station) {
      console.warn('Station not found:', id);
      return null;
    }

    const station: Station = {
      id: data.station.id,
      name: data.station.name,
      latitude: data.station.latitude,
      longitude: data.station.longitude,
      state: data.station.state
    };

    // Cache the station data
    cacheService.set(cacheKey, station, STATION_CACHE_TTL);
    return station;
  } catch (error) {
    console.error(`Failed to fetch station ${id}:`, error);
    return null;
  }
}

export function sortStations(
  stations: Station[],
  options?: {
    lat?: number;
    lon?: number;
    city?: string;
    prioritizeReferenceStations?: boolean;
  }
): Station[] {
  if (!stations.length) return [];

  return [...stations].sort((a, b) => {
    // 1. Prioritize stations with matching city name
    if (options?.city) {
      const cityLower = options.city.toLowerCase();
      const aHasCity = a.name.toLowerCase().includes(cityLower);
      const bHasCity = b.name.toLowerCase().includes(cityLower);
      if (aHasCity !== bHasCity) return aHasCity ? -1 : 1;
    }

    // 2. Prioritize reference stations (type "R")
    if (options?.prioritizeReferenceStations) {
      if (a.type === 'R' && b.type !== 'R') return -1;
      if (b.type === 'R' && a.type !== 'R') return 1;
    }

    // 3. Sort by distance if coordinates available
    if (options?.lat && options?.lon) {
      const aDistance = a.distance ?? getDistanceKm(options.lat, options.lon, a.latitude, a.longitude);
      const bDistance = b.distance ?? getDistanceKm(options.lat, options.lon, b.latitude, b.longitude);
      return aDistance - bDistance;
    }

    // 4. Fallback to alphabetical
    return a.name.localeCompare(b.name);
  });
}

export async function getStationsForLocation(
  userInput: string,
  coords?: { lat: number; lon: number }
): Promise<Station[]> {
  if (!coords) {
    throw new Error('Coordinates are required for station lookup');
  }

  const stations = await getStationsNearCoordinates(coords.lat, coords.lon);
  return sortStations(stations, {
    lat: coords.lat,
    lon: coords.lon,
    city: userInput,
    prioritizeReferenceStations: true
  });
}