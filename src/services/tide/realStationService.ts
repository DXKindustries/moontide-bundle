
interface NoaaStationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

const NOAA_STATIONS_API = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';
const LOCAL_PROXY_BASE = 'http://localhost:3001/api/noaa';
const FALLBACK_PROXY_BASE = 'https://api.allorigins.win/raw?url=';

let stationCache: NoaaStationMetadata[] | null = null;

export async function fetchRealStationMetadata(): Promise<NoaaStationMetadata[]> {
  if (stationCache) {
    console.log('📊 Using cached station metadata');
    return stationCache;
  }
  
  // Try local proxy first, then fallback to public proxy
  let proxyUrl: string;
  let proxyType: string;
  
  try {
    console.log('🌐 Trying local proxy first...');
    proxyUrl = `${LOCAL_PROXY_BASE}?url=${encodeURIComponent(NOAA_STATIONS_API)}`;
    proxyType = 'local proxy';
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Local proxy returned ${response.status}`);
    }
    
    const data = await response.json();
    return processStationData(data, proxyType);
    
  } catch (localError) {
    console.log('⚠️ Local proxy failed, trying fallback proxy...', localError.message);
    
    try {
      proxyUrl = `${FALLBACK_PROXY_BASE}${encodeURIComponent(NOAA_STATIONS_API)}`;
      proxyType = 'fallback proxy';
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Fallback proxy returned ${response.status}`);
      }
      
      const data = await response.json();
      return processStationData(data, proxyType);
      
    } catch (fallbackError) {
      console.error('❌ Both proxies failed:', { localError, fallbackError });
      throw new Error('Failed to fetch station data from both local and fallback proxies');
    }
  }
}

function processStationData(data: any, proxyType: string): NoaaStationMetadata[] {
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
    
    console.log(`✅ Loaded ${stationCache.length} real NOAA tide stations via ${proxyType}`);
    return stationCache;
  }
  
  throw new Error('Invalid station data format');
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
    
    // Sort by distance and find the nearest within 100km
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    
    const nearest = stationsWithDistance.find(station => station.distance <= 100);
    
    if (nearest) {
      console.log(`🎯 Found nearest real station: ${nearest.name} (${nearest.id}) - ${nearest.distance.toFixed(1)}km away`);
      return {
        id: nearest.id,
        name: nearest.name,
        lat: nearest.lat,
        lng: nearest.lng,
        state: nearest.state
      };
    }
    
    console.log('⚠️ No real NOAA stations found within 100km');
    return null;
  } catch (error) {
    console.error('❌ Error finding nearest real station:', error);
    return null;
  }
}
