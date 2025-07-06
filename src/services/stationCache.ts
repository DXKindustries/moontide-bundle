import { safeLocalStorage } from '@/utils/localStorage';
import { getStationsNearCoordinates, Station } from './tide/stationService';

export interface Coordinates {
  lat: number;
  lng: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Caches station data with 1-hour TTL to prevent duplicate fetches
 */
export const getCachedStations = async (
  coords: Coordinates,
): Promise<Station[]> => {
  const cacheKey = `stations-${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;

  try {
    const cached = safeLocalStorage.get(cacheKey);
    if (cached && cached.timestamp && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CACHE] HIT: ${cacheKey}`);
      return cached.data as Station[];
    }
    if (cached) {
      console.log(`[CACHE] EXPIRED: ${cacheKey}`);
    } else {
      console.log(`[CACHE] MISS: ${cacheKey}`);
    }
  } catch (err) {
    console.warn('[CACHE] Read error', err);
  }

  const stations = await getStationsNearCoordinates(
    coords.lat,
    coords.lng,
    30,
  );
  try {
    safeLocalStorage.set(cacheKey, { timestamp: Date.now(), data: stations });
    console.log(`[CACHE] SET: ${cacheKey}`);
  } catch (err) {
    console.warn('[CACHE] Write error', err);
  }

  return stations;
};
