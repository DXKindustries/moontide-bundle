import { safeLocalStorage } from './localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';

const HISTORY_KEY = 'station-history';

export function getLocationHistory(): LocationHistoryEntry[] {
  return safeLocalStorage.get<LocationHistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function addLocationHistory(entry: LocationHistoryEntry): void {
  const history = getLocationHistory();
  const filtered = history.filter((h) => h.stationId !== entry.stationId);
  safeLocalStorage.set(HISTORY_KEY, [entry, ...filtered].slice(0, 20));
}

export function clearLocationHistory(): void {
  safeLocalStorage.set(HISTORY_KEY, []);
}
