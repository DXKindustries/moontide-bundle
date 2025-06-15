
import { findNearestRealStation } from './realStationService';
import { getCoordinatesForZip } from '../geocodingService';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// In-memory cache for stations by ZIP
const stationCache: Record<string, Station | null> = {};

// Local storage helpers
const STORAGE_KEY = 'mt_real_station_by_zip';

function loadFromStorage(): Record<string, Station> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Record<string, Station> : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: Record<string, Station | null>) {
  try {
    // Only save successful lookups (not null values)
    const validStations = Object.fromEntries(
      Object.entries(state).filter(([_, station]) => station !== null)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validStations));
  } catch {
    /* ignore storage failures */
  }
}

// Load persisted cache on module initialization
Object.assign(stationCache, loadFromStorage());

export async function getNearestStation(
  zip: string,
  lat: number,
  lng: number
): Promise<Station | null> {
  console.log(`🔍 Finding real NOAA station for ZIP: ${zip}`);
  
  // Check cache first
  if (stationCache.hasOwnProperty(zip)) {
    console.log(`💾 Using cached station for ZIP ${zip}:`, stationCache[zip]);
    return stationCache[zip];
  }
  
  try {
    // Get accurate coordinates for this ZIP code
    let coordinates = { lat, lng };
    
    console.log(`🗺️ Getting accurate coordinates for ZIP ${zip}...`);
    const geocoded = await getCoordinatesForZip(zip);
    
    if (geocoded) {
      coordinates = { lat: geocoded.lat, lng: geocoded.lng };
      console.log(`✅ Geocoded ZIP ${zip} to coordinates:`, coordinates);
    } else {
      console.log(`⚠️ Geocoding failed for ZIP ${zip}, using provided coordinates:`, coordinates);
    }
    
    // Find the nearest real NOAA station
    console.log(`🔍 Searching for nearest real NOAA station...`);
    const station = await findNearestRealStation(coordinates.lat, coordinates.lng);
    
    if (station) {
      console.log(`✅ Found real NOAA station for ZIP ${zip}: ${station.name} (${station.id})`);
      stationCache[zip] = station;
      saveToStorage(stationCache);
      return station;
    } else {
      console.log(`❌ No real NOAA stations found near ZIP ${zip}`);
      stationCache[zip] = null;
      saveToStorage(stationCache);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error finding real station for ZIP ${zip}:`, error);
    stationCache[zip] = null;
    saveToStorage(stationCache);
    return null;
  }
}

export function getSavedStationForLocation(zip: string): Station | null {
  return stationCache[zip] ?? null;
}
