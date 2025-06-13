import { safeLocalStorage } from '@/utils/localStorage';
import { NoaaStation } from './types';
import { NOAA_API_BASE_URL, STATION_MAP_KEY } from './constants';
import { haversineDistance } from './utils';

export async function getNearestStation(lat: number, lng: number): Promise<NoaaStation> {
  const response = await fetch(
    `${NOAA_API_BASE_URL}/stations/?lat=${lat}&lng=${lng}&type=tidepredictions&datum=MLLW`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.stations) || data.stations.length === 0) {
    throw new Error('No nearby tide stations found');
  }

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
    throw new Error('No valid tide station selected');
  }

  return nearestStation;
}

export function saveStationForLocation(locationKey: string, station: NoaaStation): void {
  const stationMap = safeLocalStorage.getItem(STATION_MAP_KEY, {});
  stationMap[locationKey] = station;
  safeLocalStorage.setItem(STATION_MAP_KEY, stationMap);
}

export function getStationForLocation(locationKey: string): NoaaStation | undefined {
  const stationMap = safeLocalStorage.getItem(STATION_MAP_KEY, {});
  return stationMap[locationKey];
}
