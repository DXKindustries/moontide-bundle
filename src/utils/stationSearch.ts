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

export function filterStationsNearby(
  selectedLat: number,
  selectedLon: number,
  stationList: { lat?: number; lng?: number; latitude?: number; longitude?: number }[],
  radiusKm = 30,
): typeof stationList {
  return stationList
    .filter((station) => {
      const lat = station.lat ?? station.latitude;
      const lon = station.lng ?? station.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number') return false;
      const dist = getDistanceKm(selectedLat, selectedLon, lat, lon);
      return dist <= radiusKm;
    })
    .sort((a, b) => {
      const aLat = a.lat ?? a.latitude;
      const aLon = a.lng ?? a.longitude;
      const bLat = b.lat ?? b.latitude;
      const bLon = b.lng ?? b.longitude;
      return (
        getDistanceKm(selectedLat, selectedLon, aLat as number, aLon as number) -
        getDistanceKm(selectedLat, selectedLon, bLat as number, bLon as number)
      );
    });
}
