import { safeLocalStorage } from './localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';

const HISTORY_KEY = 'station-history';

export function getLocationHistory(): LocationHistoryEntry[] {
  return safeLocalStorage.get<LocationHistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function addLocationHistory(entry: LocationHistoryEntry): void {
  const history = getLocationHistory();

  // Filter out any identical entry (same station and timestamp) so
  // repeated calls don't create duplicates or overwrite earlier records.
  const filtered = history.filter(
    (h) => !(h.stationId === entry.stationId && h.timestamp === entry.timestamp)
  );

  // Append the new entry while keeping prior unique ones intact.
  safeLocalStorage.set(HISTORY_KEY, [entry, ...filtered]);
}

export function clearLocationHistory(): void {
  safeLocalStorage.set(HISTORY_KEY, []);
}
