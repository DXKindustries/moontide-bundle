/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate pair { lat, lng }
 * @param coord2 Second coordinate pair { lat, lng }
 * @returns Distance in kilometers rounded to two decimals
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
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

