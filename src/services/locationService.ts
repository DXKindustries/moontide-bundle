
import { DEFAULT_COORDINATES } from '@/constants/defaultLocations';
import { 
  getNearestStation, 
  getStationForLocation,
  saveStationForLocation 
} from '@/services/noaaService';
import { getFallbackStation } from '@/services/tide/fallbackStations';

type Location = {
  id: string;
  name: string;
  country: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
};

// Memory cache for station lookups during the session
const sessionStationCache = new Map<string, { stationId: string; stationName: string }>();

export const getStationId = async (location: Location): Promise<{ stationId: string; stationName?: string }> => {
  console.log('🏭 getStationId called with location:', location);
  
  let stationId = null;
  let stationName = null;
  
  // First check the in-memory session cache (fastest and most reliable)
  if (location.id && sessionStationCache.has(location.id)) {
    const cached = sessionStationCache.get(location.id);
    console.log(`✅ Using cached station from memory for ${location.id}: ${cached?.stationId}`);
    return { stationId: cached!.stationId, stationName: cached!.stationName };
  }
  
  // Check fallback stations first for known coastal ZIP codes
  if (location.zipCode) {
    const fallback = getFallbackStation(location.zipCode);
    if (fallback) {
      console.log(`✅ Using fallback station for ZIP ${location.zipCode}: ${fallback.id} (${fallback.name})`);
      const result = { stationId: fallback.id, stationName: fallback.name };
      
      // Cache it in memory for this session
      sessionStationCache.set(location.id, result);
      
      // Save to localStorage as well
      try {
        saveStationForLocation(location.id, fallback.id);
      } catch (error) {
        console.warn('⚠️ Error saving fallback station to localStorage:', error);
      }
      
      return result;
    }
  }
  
  // If not in memory cache, try localStorage cache
  if (!stationId && location.id) {
    try {
      stationId = getStationForLocation(location.id);
      if (stationId) {
        console.log(`✅ Found station ID for location ${location.id} in localStorage: ${stationId}`);
        const result = { stationId, stationName: 'NOAA Station' };
        // Cache it in memory for this session
        sessionStationCache.set(location.id, result);
        return result;
      } else {
        console.log(`📭 No cached station found for location ${location.id}`);
      }
    } catch (error) {
      console.warn('⚠️ Error getting station for location from localStorage:', error);
    }
  }
  
  // If no saved station, try to find nearest based on coords and ZIP
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
    
    // Find nearest station - pass ZIP code as first parameter when available
    try {
      console.log('🌐 Calling getNearestStation API...');
      const zipKey = location.zipCode || `${lat},${lng}`;
      const station = await getNearestStation(zipKey, lat, lng);
      console.log('🌐 getNearestStation returned:', station);
      
      if (station) {
        stationId = station.id;
        stationName = station.name;
        console.log(`✅ Found nearest station: ${station.name} (${stationId})`);
        
        const result = { stationId, stationName };
        
        // Cache it both in localStorage and memory
        if (location.id) {
          try {
            saveStationForLocation(location.id, stationId);
            sessionStationCache.set(location.id, result);
            console.log(`💾 Saved station mapping to cache: ${location.id} -> ${stationId}`);
          } catch (error) {
            console.warn('⚠️ Error saving station for location to localStorage:', error);
            sessionStationCache.set(location.id, result);
          }
        }
        
        return result;
      }
    } catch (stationError) {
      console.warn('⚠️ Error finding nearest station via API:', stationError);
    }
  }
  
  // Final fallback - if we still don't have a station, provide a default coastal station
  console.log('⚠️ No station found via API or cache, using default fallback');
  const defaultStation = { stationId: '8452660', stationName: 'Newport, RI (Default)' };
  
  if (location.id) {
    sessionStationCache.set(location.id, defaultStation);
  }
  
  return defaultStation;
};
