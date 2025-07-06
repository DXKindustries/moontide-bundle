// src/services/tide/stationService.ts
import { cacheService } from '../cacheService';
import { haversineDistance } from '@/utils/geo'; // Update path to match your project structure

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
  lng: number,
  radiusKm = 30
): Promise<Station[]> {
  const cacheKey = `stations:${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  
  try {
    // Return cached stations if available
    const cached = cacheService.get<Station[]>(cacheKey);
    if (cached?.length) {
      console.log('📡 Using cached stations:', cached.length);
      return cached;
    }

    console.log('🌐 Fetching stations from NOAA API...');
    const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&lat=${lat}&lng=${lng}&radius=${radiusKm}`;
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
        const stationLng = parseFloat(station.lng || station.longitude);
        
        return {
          id: station.id,
          name: station.name,
          latitude: stationLat,
          longitude: stationLng,
          state: station.state,
          products: station.products,
          type: station.type,
          distance: haversineDistance(
            { lat, lng },
            { lat: stationLat, lng: stationLng }
          )
        };
      })
      .filter(station => 
        station.distance <= radiusKm && 
        station.products?.includes('tidepredictions')
      )
      .sort((a, b) => a.distance - b.distance);

    console.log(`📊 Filtered to ${processedStations.length} valid stations`);

    // Only cache if we found stations
    if (processedStations.length) {
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
  lng: number
): Promise<Station | null> {
  try {
    const stations = await getStationsNearCoordinates(lat, lng);
    return stations[0] || null;
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
    lng?: number;
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
    if (options?.lat && options?.lng) {
      const aDistance = a.distance ?? haversineDistance(
        { lat: options.lat, lng: options.lng },
        { lat: a.latitude, lng: a.longitude }
      );
      const bDistance = b.distance ?? haversineDistance(
        { lat: options.lat, lng: options.lng },
        { lat: b.latitude, lng: b.longitude }
      );
      return aDistance - bDistance;
    }

    // 4. Fallback to alphabetical
    return a.name.localeCompare(b.name);
  });
}