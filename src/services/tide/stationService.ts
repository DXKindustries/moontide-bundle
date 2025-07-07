import { cacheService } from '../cacheService';
import { haversineDistance } from '@/utils/geo';

// Constants
const NOAA_MDAPI_BASE = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';
const STATION_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Types
export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  products?: string[];
}

export async function getStationsForLocation(
  location: string,
  radiusKm = 30
): Promise<Station[]> {
  // This is a placeholder - you'll need to implement geocoding
  // or modify to match your actual needs
  const coordinates = await geocodeLocation(location);
  return getStationsNearCoordinates(
    coordinates.lat,
    coordinates.lng,
    radiusKm
  );
}

export async function getStationsNearCoordinates(
  lat: number,
  lng: number,
  radiusKm = 30
): Promise<Station[]> {
  const cacheKey = `stations:${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  
  try {
    const cached = cacheService.get<Station[]>(cacheKey);
    if (cached?.length) return cached;

    const url = `${NOAA_MDAPI_BASE}/stations.json?type=tidepredictions&lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    const response = await fetch(url);
    const { stations: rawStations = [] } = await response.json();

    const processedStations = rawStations
      .map(station => {
        const stationLat = parseFloat(station.lat || station.latitude);
        const stationLng = parseFloat(station.lng || station.longitude);
        
        return {
          ...station,
          latitude: stationLat,
          longitude: stationLng,
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

    if (processedStations.length) {
      cacheService.set(cacheKey, processedStations, STATION_CACHE_TTL);
    }

    return processedStations;
  } catch (error) {
    console.error('Failed to fetch stations:', error);
    throw error;
  }
}

export async function getStationById(id: string): Promise<Station | null> {
  const cacheKey = `station:${id}`;
  try {
    const cached = cacheService.get<Station>(cacheKey);
    if (cached) return cached;

    const url = `${NOAA_MDAPI_BASE}/stations/${id}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const info = data.station ?? data.stations?.[0];
    if (!info) return null;

    const station: Station = {
      ...info,
      latitude: parseFloat(info.lat ?? info.latitude),
      longitude: parseFloat(info.lng ?? info.longitude),
    };
    cacheService.set(cacheKey, station, STATION_CACHE_TTL);
    return station;
  } catch (error) {
    console.error(`Failed to fetch station ${id}:`, error);
    return null;
  }
}

export function sortStationsForDefault(
  stations: Station[],
  lat?: number,
  lng?: number,
  city?: string,
): Station[] {
  const cityLower = city?.toLowerCase() ?? '';

  const getDist = (s: Station) => {
    if (s.distance != null) return s.distance;
    if (
      lat != null &&
      lng != null &&
      typeof s.latitude === 'number' &&
      typeof s.longitude === 'number'
    ) {
      return haversineDistance(
        { lat, lng },
        { lat: s.latitude, lng: s.longitude },
      );
    }
    return Infinity;
  };

  return stations
    .filter((s) => {
      const products: string[] = (s as any).products || [];
      return !products.length || products.includes('water_level');
    })
    .sort((a, b) => {
      const aCity = cityLower && a.name.toLowerCase().includes(cityLower);
      const bCity = cityLower && b.name.toLowerCase().includes(cityLower);
      if (aCity !== bCity) return aCity ? -1 : 1;

      const aRef = (a as any).type === 'R';
      const bRef = (b as any).type === 'R';
      if (aRef !== bRef) return aRef ? -1 : 1;

      return getDist(a) - getDist(b);
    });
}

// Placeholder - implement or remove based on your needs
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
  // Implement your geocoding logic here or use a service
  throw new Error('Geocoding not implemented');
}
