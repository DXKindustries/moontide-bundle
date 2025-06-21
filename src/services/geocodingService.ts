
import { LOCAL_ZIP_DB } from '@/data/zipLocal';
import { cacheService } from './cacheService';

interface GeocodeResult {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

const GEOCODING_API_BASE = 'https://api.zippopotam.us/us/';
const ZIP_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const CITY_CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

export async function getCoordinatesForZip(zipCode: string): Promise<GeocodeResult | null> {
  console.log(`🗺️ Getting coordinates for ZIP: ${zipCode}`);
  
  const cacheKey = `zip:${zipCode}`;
  
  // Check cache first
  const cached = cacheService.get<GeocodeResult>(cacheKey);
  if (cached) {
    console.log(`✅ Found ZIP ${zipCode} in cache`);
    return cached;
  }
  
  // Check our local database
  if (LOCAL_ZIP_DB[zipCode]) {
    console.log(`✅ Found ZIP ${zipCode} in local database`);
    const result = LOCAL_ZIP_DB[zipCode];
    const geocodeResult = {
      lat: result.lat,
      lng: result.lng,
      city: result.city,
      state: result.state
    };
    cacheService.set(cacheKey, geocodeResult, ZIP_CACHE_TTL);
    return geocodeResult;
  }
  
  // Try the free geocoding API
  try {
    console.log(`🌐 Fetching coordinates from geocoding API for ZIP: ${zipCode}`);
    const response = await fetch(`${GEOCODING_API_BASE}${zipCode}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0];
      const result = {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
        city: place['place name'],
        state: place['state abbreviation']
      };
      
      console.log(`✅ Geocoded ZIP ${zipCode}:`, result);
      cacheService.set(cacheKey, result, ZIP_CACHE_TTL);
      return result;
    }
    
    throw new Error('No location data found');
  } catch (error) {
    console.warn(`⚠️ Geocoding failed for ZIP ${zipCode}:`, error);
    return null;
  }
}

export async function getCoordinatesForCity(city: string, state: string): Promise<GeocodeResult | null> {
  console.log(`🏙️ Getting coordinates for city: ${city}, ${state}`);
  
  const cacheKey = `city:${city.toLowerCase()}-${state.toLowerCase()}`;
  
  // Check cache first
  const cached = cacheService.get<GeocodeResult>(cacheKey);
  if (cached) {
    console.log(`✅ Found ${city}, ${state} in cache`);
    return cached;
  }
  
  // Try to find a matching ZIP in our local database
  const matchingEntry = Object.entries(LOCAL_ZIP_DB).find(([_, data]) => 
    data.city.toLowerCase() === city.toLowerCase() && 
    data.state.toLowerCase() === state.toLowerCase()
  );
  
  if (matchingEntry) {
    const [zipCode, data] = matchingEntry;
    console.log(`✅ Found ${city}, ${state} in local database with ZIP ${zipCode}`);
    const geocodeResult = {
      lat: data.lat,
      lng: data.lng,
      city: data.city,
      state: data.state
    };
    cacheService.set(cacheKey, geocodeResult, CITY_CACHE_TTL);
    return geocodeResult;
  }
  
  // For now, return null since we don't have a reliable free API for city/state geocoding
  console.log(`⚠️ No coordinates found for ${city}, ${state} in local database`);
  return null;
}

// Cache management utilities
export function getCacheStats() {
  return cacheService.getStats();
}

export function clearGeocodingCache() {
  cacheService.clear();
}
