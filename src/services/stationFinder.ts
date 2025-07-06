/**
 * Utilities to locate the closest NOAA station to a given coordinate
 */
import { haversineDistance } from '@/utils/geo';

export interface NOAAStation {
  id: string;
  name: string;
  lat: number | string;
  lng: number | string;
}

/**
 * Filters NOAA stations within 30km, sorted by proximity
 * @param userCoords Geographic coordinates to compare against
 * @param stations List of NOAA stations
 * @returns Closest station ID or null
 */
export function filterStations(
  userCoords: { lat: number; lng: number },
  stations: NOAAStation[],
): string | null {
  const stationsWithDistance = stations.map((s) => ({
    ...s,
    distance: haversineDistance(
      userCoords,
      { lat: Number(s.lat), lng: Number(s.lng) },
    ),
  }));

  console.log('[STATION] Raw stations:', stations.length);

  const filtered = stationsWithDistance
    .filter((s) => s.distance <= 30)
    .sort((a, b) => a.distance - b.distance);

  console.log('[STATION] Viable stations:', filtered.length);
  filtered.slice(0, 3).forEach((s, i) => {
    console.log(`[STATION] Candidate #${i + 1}:`, s.id, `${s.distance}km`);
  });

  return filtered.length > 0 ? String(filtered[0].id) : null;
}

