
import { getProxyConfig } from './proxyConfig';

interface NoaaStationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

const NOAA_STATIONS_API = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';

let stationCache: NoaaStationMetadata[] | null = null;

// Mock station data for fallback when API is unavailable
const MOCK_STATIONS: NoaaStationMetadata[] = [
  { id: '8518750', name: 'The Battery, NY', lat: 40.7002, lng: -74.0142, state: 'NY' },
  { id: '8443970', name: 'Boston, MA', lat: 42.3601, lng: -71.0589, state: 'MA' },
  { id: '8570283', name: 'Ocean City Inlet, MD', lat: 38.3289, lng: -75.0919, state: 'MD' },
  { id: '8665530', name: 'Charleston, SC', lat: 32.7822, lng: -79.9250, state: 'SC' },
  { id: '8661070', name: 'Springmaid Pier, SC', lat: 33.6550, lng: -78.9181, state: 'SC' },
  { id: '9414290', name: 'San Francisco, CA', lat: 37.8063, lng: -122.4659, state: 'CA' },
  { id: '9410170', name: 'San Diego, CA', lat: 32.7142, lng: -117.1736, state: 'CA' },
  { id: '9447130', name: 'Seattle, WA', lat: 47.6025, lng: -122.3389, state: 'WA' },
];

export async function fetchRealStationMetadata(): Promise<NoaaStationMetadata[]> {
  if (stationCache) {
    console.log('📊 Using cached station metadata');
    return stationCache;
  }
  
  console.log('🌐 Attempting to fetch real station metadata...');
  
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
  
  // Try with proxy
  const config = getProxyConfig();
  try {
    console.log('🌐 Trying proxy for station metadata...');
    const proxyUrl = `${config.fallbackProxyUrl}${encodeURIComponent(NOAA_STATIONS_API)}`;
    
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      const processedData = processStationData(data, 'proxy');
      if (processedData.length > 0) {
        return processedData;
      }
    }
  } catch (error) {
    console.log('⚠️ Proxy call failed:', error.message);
  }
  
  // Fallback to mock data
  console.log('🔄 Using mock station data for development');
  stationCache = MOCK_STATIONS;
  return stationCache;
}

function processStationData(data: any, source: string): NoaaStationMetadata[] {
  if (data && data.stations) {
    // Filter for tide stations only and convert to our format
    stationCache = data.stations
      .filter((station: any) => 
        station.type === 'tide' && 
        station.lat && 
        station.lng &&
        station.id &&
        station.name
      )
      .map((station: any) => ({
        id: station.id,
        name: station.name,
        lat: parseFloat(station.lat),
        lng: parseFloat(station.lng),
        state: station.state
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
    return null;
  }
}
