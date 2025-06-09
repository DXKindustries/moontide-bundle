
import { safeLocalStorage } from '@/utils/localStorage';
import { NoaaStation } from './types';
import { NOAA_API_BASE_URL, STATION_MAP_KEY } from './constants';
import { haversineDistance } from './utils';

// Mock data for when the API is unavailable due to CORS or other issues
const MOCK_STATIONS: Record<string, NoaaStation> = {
  '9414290': {
    id: '9414290',
    name: 'San Francisco, CA',
    lat: '37.8068',
    lng: '-122.4652',
    state: 'CA'
  },
  '8518750': {
    id: '8518750',
    name: 'The Battery, NY',
    lat: '40.7006',
    lng: '-74.0142',
    state: 'NY'
  },
  '8723214': {
    id: '8723214',
    name: 'Virginia Key, FL',
    lat: '25.7317',
    lng: '-80.1617',
    state: 'FL'
  },
  '9447130': {
    id: '9447130',
    name: 'Seattle, WA',
    lat: '47.6020',
    lng: '-122.3390',
    state: 'WA'
  },
  '8443970': {
    id: '8443970',
    name: 'Boston, MA',
    lat: '42.3601',
    lng: '-71.0589',
    state: 'MA'
  }
};

// Get mock station based on coordinates
const getMockNearestStation = (lat: number, lng: number): NoaaStation => {
  // Find the nearest mock station using haversine distance
  let nearestStation = MOCK_STATIONS['9414290']; // Default to San Francisco
  let minDistance = Infinity;
  
  Object.values(MOCK_STATIONS).forEach(station => {
    const stationLat = parseFloat(station.lat);
    const stationLng = parseFloat(station.lng);
    const distance = haversineDistance(lat, lng, stationLat, stationLng);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });
  
  console.log(`Using mock station: ${nearestStation.name} (${nearestStation.id})`);
  return nearestStation;
};

// Get nearest station
export const getNearestStation = async (
  lat: number, lng: number
): Promise<NoaaStation | null> => {
  try {
    console.log(`Looking up station for coordinates: ${lat}, ${lng}`);
    // FIX: Added datum=MLLW parameter to the API call
    const url = `${NOAA_API_BASE_URL}stations/?lat=${lat}&lng=${lng}&type=tidepredictions&datum=MLLW`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch stations: ${response.status}`);
      
      const data = await response.json();
      if (!data.stations || data.stations.length === 0) {
        throw new Error('No stations found in API response');
      }
      
      // Find nearest
      let nearestStation: NoaaStation | null = null;
      let minDistance = Infinity;
      
      data.stations.forEach((station: any) => {
        const stationLat = parseFloat(station.lat);
        const stationLng = parseFloat(station.lng);
        const distance = haversineDistance(lat, lng, stationLat, stationLng);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = {
            id: station.id,
            name: station.name,
            lat: station.lat,
            lng: station.lng,
            state: station.state
          };
        }
      });
      
      if (!nearestStation) {
        throw new Error('No nearby tide stations found');
      }
      
      console.log(`Found NOAA station: ${nearestStation.name} (${nearestStation.id})`);
      return nearestStation;
    } catch (apiError) {
      console.warn('NOAA API error, falling back to mock station:', apiError);
      const mockStation = getMockNearestStation(lat, lng);
      return mockStation;
    }
  } catch (error) {
    console.error('Error in getNearestStation:', error);
    // Final fallback to San Francisco
    return MOCK_STATIONS['9414290'];
  }
};

export const saveStationForLocation = (locationId: string, stationId: string) => {
  try {
    const stationMap = safeLocalStorage.getItem(STATION_MAP_KEY, {});
    stationMap[locationId] = stationId;
    safeLocalStorage.setItem(STATION_MAP_KEY, stationMap);
    return true;
  } catch (error) {
    return false;
  }
};

export const getStationForLocation = (locationId: string): string | null => {
  try {
    const stationMap = safeLocalStorage.getItem(STATION_MAP_KEY, {});
    return stationMap[locationId] || null;
  } catch (error) {
    return null;
  }
};
