export interface TideCacheEntry {
  fetchedAt: number;
  expiresAt: number;
  tideData: import('@/services/tide/types').TidePoint[];
  tideEvents: import('@/services/tide/types').TidePoint[];
  weeklyForecast: import('@/services/tide/types').TideForecast[];
  stationName: string | null;
  stationId: string | null;
}

import { safeLocalStorage } from './localStorage';

const PREFIX = 'tide:';

function makeKey(stationId: string, start: string, end: string, units: string) {
  return `${PREFIX}${stationId}:${start}:${end}:${units}`;
}

function getEntry(key: string): TideCacheEntry | null {
  return safeLocalStorage.get<TideCacheEntry>(key);
}

function setEntry(key: string, entry: TideCacheEntry) {
  safeLocalStorage.set(key, entry);
}

export const tideCache = {
  makeKey,
  get: getEntry,
  set: setEntry,
};
