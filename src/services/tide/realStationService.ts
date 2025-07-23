import { safeLocalStorage } from '@/utils/localStorage';

interface NoaaStationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

const NOAA_STATIONS_API = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?rows=10000';
const STATION_METADATA_KEY = 'moontide-stations';

let stationCache: NoaaStationMetadata[] | null = null;

export async function fetchRealStationMetadata(): Promise<NoaaStationMetadata[]> {
  if (stationCache) {
    return stationCache;
  }

  const stored = safeLocalStorage.get<NoaaStationMetadata[]>(STATION_METADATA_KEY);
  if (stored && stored.length > 0) {
    stationCache = stored;
    return stored;
  }

  // Try direct API call first
  try {
    const response = await fetch(NOAA_STATIONS_API);
    if (response.ok) {
      let data: { stations?: RawStation[] } | null = null;
      try {
        data = (await response.json()) as { stations?: RawStation[] } | null;
      } catch (err) {
        console.error('❌ Failed to parse direct API JSON:', err);
      }
      const processedData = processStationData(data, 'direct API');
      if (processedData.length > 0) {
        return processedData;
      }
    }
  } catch (error) {
    // ignore direct API failure and try fallback
  }

  // Fallback to local backup file
  try {
    const response = await fetch('/stations.json');
    if (response.ok) {
      let data: { stations?: RawStation[] } | null = null;
      try {
        data = (await response.json()) as { stations?: RawStation[] } | null;
      } catch (err) {
        console.error('❌ Failed to parse local backup JSON:', err);
      }
      const processedData = processStationData(data, 'local backup');
      if (processedData.length > 0) {
        return processedData;
      }
    }
  } catch (error) {
    // ignore fallback failure
  }

  console.error('❌ All attempts to load station data failed');
  throw new Error('Unable to load station data from any source');
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
    const unique = new Map<string, NoaaStationMetadata>();
    data.stations.forEach((station) => {
      if (
        (station.type == null || station.type === 'tide') &&
        station.lat != null &&
        station.lng != null &&
        station.id != null &&
        station.name != null &&
        !unique.has(station.id)
      ) {
        unique.set(station.id, {
          id: station.id,
          name: station.name,
          lat: parseFloat(String(station.lat)),
          lng: parseFloat(String(station.lng)),
          state: station.state,
        });
      }
    });
    stationCache = Array.from(unique.values());
    safeLocalStorage.set(STATION_METADATA_KEY, stationCache);

    return stationCache;
  }

  // Return empty array if data format is invalid
  console.error(`❌ Invalid station data shape from ${source}`, data);
  return [];
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findNearestRealStation(lat: number, lng: number): Promise<NoaaStationMetadata | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('Invalid coordinates for nearest station lookup', { lat, lng });
    return null;
  }
  try {
    const stations = await fetchRealStationMetadata();

    const stationsWithDistance = stations.map((station) => ({
      ...station,
      distance: getDistanceKm(lat, lng, station.lat, station.lng),
    }));

    // Sort by distance and find the nearest within 200km (increased range)
    stationsWithDistance.sort((a, b) => a.distance - b.distance);

    const nearest = stationsWithDistance.find((station) => station.distance <= 200);

    if (nearest) {
      return {
        id: nearest.id,
        name: nearest.name,
        lat: nearest.lat,
        lng: nearest.lng,
        state: nearest.state,
      };
    }

    // If no station within 200km, just return the closest one
    if (stationsWithDistance.length > 0) {
      const closest = stationsWithDistance[0];
      return {
        id: closest.id,
        name: closest.name,
        lat: closest.lat,
        lng: closest.lng,
        state: closest.state,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error finding nearest station:', error);
    throw error; // Re-throw to let caller handle the error appropriately
  }
}
