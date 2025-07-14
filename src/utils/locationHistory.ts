import { safeLocalStorage } from './localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';

const HISTORY_KEY = 'station-history';

export function getLocationHistory(): LocationHistoryEntry[] {
  return safeLocalStorage.get<LocationHistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function addLocationHistory(entry: LocationHistoryEntry): void {
  const history = getLocationHistory();

  // Remove any previous entry for this station so selecting the same
  // station again updates its timestamp rather than creating a duplicate.
  const id = String(entry.stationId).trim();
  const filtered = history.filter((h) => String(h.stationId).trim() !== id);

  const normalizedEntry = { ...entry, stationId: id } as LocationHistoryEntry;

  // Prepend the new entry, keeping the rest of the history intact.
  safeLocalStorage.set(HISTORY_KEY, [normalizedEntry, ...filtered]);
}

export function clearLocationHistory(): void {
  safeLocalStorage.set(HISTORY_KEY, []);
}
