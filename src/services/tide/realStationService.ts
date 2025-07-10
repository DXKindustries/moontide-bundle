

interface NoaaStationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

const NOAA_STATIONS_API = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?rows=200';

let stationCache: NoaaStationMetadata[] | null = null;

export async function fetchRealStationMetadata(): Promise<NoaaStationMetadata[]> {
  if (stationCache) {
    console.log('📊 Using cached station metadata');
    return stationCache;
  }
  
  console.log('🌐 Fetching live NOAA station metadata...');
  
  // Try direct API call first
  try {
    console.log('🎯 Trying direct NOAA stations API...');
    const response = await fetch(NOAA_STATIONS_API);
    if (response.ok) {
      const data = await response.json();
      const processedData = processStationData(data, 'direct API');
      if (processedData.length > 0) {
        return processedData;
      }
    }
  } catch (error) {
    console.log('⚠️ Direct API call failed:', error.message);
  }
  // Phase 1: No more mock data fallbacks - throw error if no live data available
  console.error('❌ All attempts to fetch live NOAA station data failed');
  throw new Error('Unable to fetch live station data from NOAA. Please check your internet connection.');
}

interface RawStation {
  id: string;
  name: string;
  lat: string | number;
  lng: string | number;
  state?: string;
  type?: string;
}

function processStationData(
  data: { stations?: RawStation[] } | null,
  source: string,
): NoaaStationMetadata[] {
  if (data && Array.isArray(data.stations)) {
    // Filter for tide stations only and convert to our format
    stationCache = data.stations
      .filter(
        (station) =>
          station.type === 'tide' &&
          station.lat != null &&
          station.lng != null &&
          station.id != null &&
          station.name != null,
      )
      .map((station) => ({
        id: station.id,
        name: station.name,
        lat: parseFloat(String(station.lat)),
        lng: parseFloat(String(station.lng)),
        state: station.state,
      }));
    
    console.log(`✅ Loaded ${stationCache.length} real NOAA tide stations via ${source}`);
    return stationCache;
  }
  
  // Return empty array if data format is invalid
  return [];
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function findNearestRealStation(lat: number, lng: number): Promise<NoaaStationMetadata | null> {
  try {
    const stations = await fetchRealStationMetadata();
    
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: getDistanceKm(lat, lng, station.lat, station.lng)
    }));
    
    // Sort by distance and find the nearest within 200km (increased range)
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    
    const nearest = stationsWithDistance.find(station => station.distance <= 200);
    
    if (nearest) {
      console.log(`🎯 Found nearest station: ${nearest.name} (${nearest.id}) - ${nearest.distance.toFixed(1)}km away`);
      return {
        id: nearest.id,
        name: nearest.name,
        lat: nearest.lat,
        lng: nearest.lng,
        state: nearest.state
      };
    }
    
    // If no station within 200km, just return the closest one
    if (stationsWithDistance.length > 0) {
      const closest = stationsWithDistance[0];
      console.log(`🎯 Using closest available station: ${closest.name} (${closest.id}) - ${closest.distance.toFixed(1)}km away`);
      return {
        id: closest.id,
        name: closest.name,
        lat: closest.lat,
        lng: closest.lng,
        state: closest.state
      };
    }
    
    console.log('⚠️ No stations available');
    return null;
  } catch (error) {
    console.error('❌ Error finding nearest station:', error);
    throw error; // Re-throw to let caller handle the error appropriately
  }
}
