
import { safeLocalStorage } from './localStorage';

// Define the response type from zippopotam.us API
interface ZipApiResponse {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: {
    'place name': string;
    state: string;
    'state abbreviation': string;
    longitude: string;
    latitude: string;
  }[];
}

interface ZipCodeData {
  city: string;
  state: string;
  stateAbbr: string;
  country: string;
  countryAbbr: string;
  longitude?: string;
  latitude?: string;
}

// Local cache key
const ZIP_CACHE_KEY = 'moontide-zipcode-cache';

// Initialize cache from localStorage
const getZipCache = (): Record<string, ZipCodeData> => {
  return safeLocalStorage.getItem(ZIP_CACHE_KEY, {});
};

// Save cache to localStorage
const saveZipCache = (cache: Record<string, ZipCodeData>) => {
  safeLocalStorage.setItem(ZIP_CACHE_KEY, cache);
};

/**
 * Lookup ZIP code information using zippopotam.us API
 * Uses local cache first, then falls back to API call
 */
export const lookupZipCode = async (zipCode: string | number) => {
  // Always treat the input as a trimmed string
  const cleanZip = String(zipCode).trim();
  if (!cleanZip) return null;

  
  
  
  // Check local cache first
  const cache = getZipCache();
  if (cache[cleanZip]) {
    console.log(`Using cached data for ZIP: ${cleanZip}`);
    return cache[cleanZip];
  }
  
  // Not in cache, try API lookup
  try {
    console.log(`Looking up ZIP code: ${cleanZip}`);
    // For US ZIP codes
    const response = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    
    if (!response.ok) {
      console.error(`ZIP lookup failed with status: ${response.status}`);
      return null;
    }
    
    const data: ZipApiResponse = await response.json();
    
    // API returns an array of places, but we just need the first one
    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      
      const zipData: ZipCodeData = {
        city: place['place name'],
        state: place.state,
        stateAbbr: place['state abbreviation'],
        country: data.country,
        countryAbbr: data['country abbreviation'],
        longitude: place.longitude,
        latitude: place.latitude
      };
      
      // Update cache
      cache[cleanZip] = zipData;
      saveZipCache(cache);
      
      return zipData;
    }
  } catch (error) {
    console.error('Error looking up ZIP code:', error);
  }
  
  return null;
};

/**
 * Format a city, state string from ZIP code data
 */
export const formatCityStateFromZip = (zipData: ZipCodeData): string => {
  if (!zipData) return '';
  return `${zipData.city}, ${zipData.stateAbbr}`;
};

/**
 * Add a custom entry to the ZIP code cache
 * Useful for user-contributed data
 */
export const addCustomZipEntry = (
  zipCode: string, 
  city: string, 
  state: string, 
  stateAbbr: string
): void => {
  const cache = getZipCache();
  
  cache[zipCode] = {
    city,
    state,
    stateAbbr,
    country: 'United States of America',
    countryAbbr: 'US'
  };
  
  saveZipCache(cache);
  console.log(`Added custom entry for ZIP ${zipCode}: ${city}, ${stateAbbr}`);
};

/**
 * Extract proper display name from location data
 * For consistency across the application
 */
export const getLocationNameFromZipData = (zipData: ZipCodeData, zipCode: string): string => {
  if (!zipData) return `Unknown (${zipCode})`;
  return `${zipData.city}, ${zipData.state}`;
};
