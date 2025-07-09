import { getDistanceKm } from '@/services/tide/geo';

export type SourceType = 'zip' | 'text' | 'gps' | 'station';

export interface StationCandidate {
  stationId: string;
  stationName: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  nickname?: string;
  zipCode?: string;
}

export interface NearbyStation extends StationCandidate {
  distanceKm: number;
  sourceType: SourceType;
}

export function findNearbyStations(
  stations: StationCandidate[],
  searchLat: number,
  searchLon: number,
  sourceType: SourceType,
): NearbyStation[] {
  return stations
    .map((s) => ({
      ...s,
      distanceKm: getDistanceKm(searchLat, searchLon, s.lat, s.lon),
      sourceType,
    }))
    .filter((s) => s.distanceKm <= 30)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
