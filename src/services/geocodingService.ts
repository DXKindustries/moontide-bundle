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
  
  const cacheKey = `zip:${zipCode}`;
  
  // Check cache first
  const cached = cacheService.get<GeocodeResult>(cacheKey);
  if (cached) {
    return cached;
  }
  
  
  // Try the free geocoding API
  try {
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
      
      cacheService.set(cacheKey, result, ZIP_CACHE_TTL);
      return result;
    }
    
    throw new Error('No location data found');
  } catch (error) {
    // geocoding failed
    return null;
  }
}

export async function getCoordinatesForCity(city: string, state: string): Promise<GeocodeResult | null> {

  const cacheKey = `city:${city.toLowerCase()}-${state.toLowerCase()}`;

  // Check cache first
  const cached = cacheService.get<GeocodeResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url =
      'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({
        city,
        state,
        country: 'USA',
        format: 'json',
        limit: '1',
        addressdetails: '1'
      }).toString();

    const response = await fetch(url, {
      headers: { 'User-Agent': 'moontide-app' }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const resultData = data[0];
      const address = resultData.address || {};
      const result = {
        lat: parseFloat(resultData.lat),
        lng: parseFloat(resultData.lon),
        city: address.city || address.town || address.village || city,
        state: address.state_code || address.state || state
      } as GeocodeResult;

      cacheService.set(cacheKey, result, CITY_CACHE_TTL);
      return result;
    }

    throw new Error('No location data found');
  } catch (error) {
    // geocoding failed
    return null;
  }
}

// Cache management utilities
export function getCacheStats() {
  return cacheService.getStats();
}

export function clearGeocodingCache() {
  cacheService.clear();}