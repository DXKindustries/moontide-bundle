import { safeLocalStorage } from './localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';

const HISTORY_KEY = 'station-history';

export function getLocationHistory(): LocationHistoryEntry[] {
  return safeLocalStorage.get<LocationHistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function addLocationHistory(entry: LocationHistoryEntry): void {
  const history = getLocationHistory();
  // Always append new entries instead of replacing existing ones so we
  // preserve the full history of stations the user has selected.
  safeLocalStorage.set(HISTORY_KEY, [entry, ...history]);
}

export function clearLocationHistory(): void {
  safeLocalStorage.set(HISTORY_KEY, []);
}
