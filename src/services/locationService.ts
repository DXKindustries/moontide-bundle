
import { DEFAULT_COORDINATES } from '@/constants/defaultLocations';
import { 
  getNearestStation, 
  getStationForLocation,
  saveStationForLocation 
} from '@/services/noaaService';

type Location = {
  id: string;
  name: string;
  country: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
};

// Memory cache for station lookups during the session
const sessionStationCache = new Map<string, string>();

export const getStationId = async (location: Location): Promise<{ stationId: string; stationName?: string }> => {
  console.log('🏭 getStationId called with location:', location);
  
  let stationId = null;
  let stationName = null;
  
  // First check the in-memory session cache (fastest and most reliable)
  if (location.id && sessionStationCache.has(location.id)) {
    stationId = sessionStationCache.get(location.id);
    console.log(`✅ Using cached station ID from memory for ${location.id}: ${stationId}`);
    return { stationId: stationId! };
  }
  
  // If not in memory cache, try localStorage cache
  if (!stationId && location.id) {
    try {
      stationId = getStationForLocation(location.id);
      if (stationId) {
        // Cache it in memory for this session
        sessionStationCache.set(location.id, stationId);
        console.log(`✅ Found station ID for location ${location.id} in localStorage: ${stationId}`);
        return { stationId };
      } else {
        console.log(`📭 No cached station found for location ${location.id}`);
      }
    } catch (error) {
      console.warn('⚠️ Error getting station for location from localStorage:', error);
    }
  }
  
  // If no saved station, find nearest based on coords and ZIP
  if (!stationId) {
    // Determine coordinates to use
    let lat = 0;
    let lng = 0;
    
    if (location.lat && location.lng) {
      // Use provided coordinates
      lat = location.lat;
      lng = location.lng;
      console.log(`📍 Using provided coordinates: ${lat}, ${lng}`);
    } else {
      // Use default coordinates based on country
      const defaultCoord = DEFAULT_COORDINATES[location.country] || 
                        DEFAULT_COORDINATES['USA'];
      lat = defaultCoord.lat;
      lng = defaultCoord.lng;
      console.log(`📍 Using default coordinates for ${location.country}: ${lat}, ${lng}`);
    }
    
    console.log(`🔍 Looking up nearest station for ${location.name} at coordinates: ${lat}, ${lng}`);
    console.log(`🔍 ZIP code available: ${location.zipCode}`);
    
    // Find nearest station - pass ZIP code as first parameter when available
    try {
      console.log('🌐 Calling getNearestStation API...');
      // Fix: Pass ZIP code as first parameter, then lat/lng
      const zipKey = location.zipCode || `${lat},${lng}`;
      const station = await getNearestStation(zipKey, lat, lng);
      console.log('🌐 getNearestStation returned:', station);
      
      if (!station) {
        console.error('❌ No nearby tide stations found');
        throw new Error('No nearby tide stations found');
      }
      
      stationId = station.id;
      stationName = station.name;
      console.log(`✅ Found nearest station: ${station.name} (${stationId})`);
      
      // Cache it both in localStorage and memory
      if (location.id) {
        try {
          saveStationForLocation(location.id, stationId);
          sessionStationCache.set(location.id, stationId);
          console.log(`💾 Saved station mapping to cache: ${location.id} -> ${stationId}`);
        } catch (error) {
          console.warn('⚠️ Error saving station for location to localStorage:', error);
          sessionStationCache.set(location.id, stationId);
        }
      }
      
      return { stationId, stationName };
    } catch (stationError) {
      console.error('❌ Error finding nearest station:', stationError);
      throw new Error('Could not find a nearby tide station');
    }
  }
  
  return { stationId: stationId! };
};
