/**
 * Utilities to locate the closest NOAA station to a given coordinate
 */

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * @param coord1 First coordinate pair { lat, lng }
 * @param coord2 Second coordinate pair { lat, lng }
 * @returns Distance in kilometers rounded to two decimals
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

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
  stations: Array<NOAAStation | any>,
): string | null {
  const stationsWithDistance = stations.map((s) => {
    const lat = (s as any).lat ?? (s as any).latitude;
    const lng = (s as any).lng ?? (s as any).longitude;
    return {
      ...s,
      distance: haversineDistance(userCoords, {
        lat: Number(lat),
        lng: Number(lng),
      }),
    };
  });

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

