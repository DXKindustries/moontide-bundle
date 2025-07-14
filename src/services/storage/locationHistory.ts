import { safeLocalStorage } from '../../utils/localStorage';
import { LocationHistoryEntry } from '@/types/locationHistory';
import type { Station } from '@/services/tide/stationService';

/** Normalize a station or location history entry so the stationId field
 *  always contains the numeric NOAA station identifier.  Many parts of the
 *  code pass around objects that use either `id` or `stationId`.  This helper
 *  ensures we store a consistent value regardless of the shape we receive. */
export function normalizeStation<T extends { id?: string; stationId?: string }>(
  station: T,
): T & { stationId: string } {
  const record = station as Record<string, unknown>;
  const id = String(record.stationId ?? record.id ?? '').trim();
  return { ...(record as object), stationId: id } as T & { stationId: string };
}

const LOCATION_HISTORY_KEY = 'station-history';
const STATION_HISTORY_KEY = 'station-list';

export function getLocationHistory(): LocationHistoryEntry[] {
  return safeLocalStorage.get<LocationHistoryEntry[]>(LOCATION_HISTORY_KEY) ?? [];
}

export function saveLocationHistory(entry: LocationHistoryEntry): void {
  const normalizedEntry = normalizeStation(entry);
  const history = getLocationHistory();
  const filtered = history.filter(
    (h) => String(h.stationId).trim() !== normalizedEntry.stationId,
  );
  const newHistory = [normalizedEntry, ...filtered].slice(0, 10);
  safeLocalStorage.set(LOCATION_HISTORY_KEY, newHistory);
}

export function clearLocationHistory(): void {
  safeLocalStorage.set(LOCATION_HISTORY_KEY, []);
}

export type StationHistoryItem = ReturnType<typeof normalizeStation<Station>> & {
  timestamp: number;
};

export function getStationHistory(): StationHistoryItem[] {
  return safeLocalStorage.get<StationHistoryItem[]>(STATION_HISTORY_KEY) ?? [];
}

export function saveStationHistory(station: Station): void {
  const normalized = normalizeStation(station);
  const entry: StationHistoryItem = { ...normalized, timestamp: Date.now() };
  const history = getStationHistory();
  const filtered = history.filter(
    (s) => String(s.stationId).trim() !== entry.stationId,
  );
  const newHistory = [entry, ...filtered].slice(0, 10);
  safeLocalStorage.set(STATION_HISTORY_KEY, newHistory);
}
