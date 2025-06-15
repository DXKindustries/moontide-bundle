
import { LOCAL_ZIP_DB } from '@/data/zipLocal';

interface GeocodeResult {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

const GEOCODING_API_BASE = 'https://api.zippopotam.us/us/';

export async function getCoordinatesForZip(zipCode: string): Promise<GeocodeResult | null> {
  console.log(`🗺️ Getting coordinates for ZIP: ${zipCode}`);
  
  // First check our local database
  if (LOCAL_ZIP_DB[zipCode]) {
    console.log(`✅ Found ZIP ${zipCode} in local database`);
    return LOCAL_ZIP_DB[zipCode];
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
      return result;
    }
    
    throw new Error('No location data found');
  } catch (error) {
    console.warn(`⚠️ Geocoding failed for ZIP ${zipCode}:`, error);
    return null;
  }
}
