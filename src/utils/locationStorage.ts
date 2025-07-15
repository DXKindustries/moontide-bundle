import { safeLocalStorage } from './localStorage';
import { LocationData } from '@/types/locationTypes';
import type { SavedLocation as StoredLocation } from '@/services/storage/locationHistory';

const CURRENT_LOCATION_KEY = 'current-location-data';
const LOCATION_HISTORY_KEY = 'location-history';

const NUMERIC_ID_RE = /^\d+$/;

function validId(record: Partial<LocationData>): string | null {
  const raw = String(record.stationId ?? '').trim();
  if (!NUMERIC_ID_RE.test(raw)) return null;
  return raw;
}

function sanitizeList(list: LocationData[]): LocationData[] {
  const map = new Map<string, LocationData>();
  list.forEach(item => {
    const id = validId(item);
    if (id) {
      map.set(id, { ...item, stationId: id });
    }
  });
  return Array.from(map.values());
}

export const locationStorage = {
  saveCurrentLocation(location: LocationData): void {
    const id = validId(location);
    if (!id) {
      console.error('[locationStorage] invalid stationId, aborting save');
      return;
    }
    const entry = { ...location, stationId: id, timestamp: Date.now() };
    safeLocalStorage.set(CURRENT_LOCATION_KEY, entry);
    const history = locationStorage
      .getLocationHistory()
      .filter(h => h.stationId !== id);
    safeLocalStorage.set(LOCATION_HISTORY_KEY, [entry, ...history]);
  },

  getCurrentLocation(): LocationData | null {
    const stored = safeLocalStorage.get<LocationData>(CURRENT_LOCATION_KEY);
    if (!stored) return null;
    const id = validId(stored);
    if (!id) {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
      return null;
    }
    return { ...stored, stationId: id };
  },

  getLocationHistory(): LocationData[] {
    const stored = safeLocalStorage.get<LocationData[]>(LOCATION_HISTORY_KEY) || [];
    const sanitized = sanitizeList(stored);
    if (sanitized.length !== stored.length) {
      safeLocalStorage.set(LOCATION_HISTORY_KEY, sanitized);
    }
    return sanitized;
  },

  updateLocation(updated: LocationData): void {
    const id = validId(updated);
    if (!id) {
      console.error('[locationStorage] invalid stationId, aborting update');
      return;
    }
    const history = locationStorage.getLocationHistory();
    const idx = history.findIndex(h => h.stationId === id);
    if (idx === -1) return;
    history[idx] = { ...updated, stationId: id, timestamp: history[idx].timestamp ?? Date.now() };
    safeLocalStorage.set(LOCATION_HISTORY_KEY, history);

    const current = locationStorage.getCurrentLocation();
    if (current && current.stationId === id) {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, { ...updated, stationId: id, timestamp: current.timestamp });
    }
  },

  deleteLocation(toDelete: LocationData): void {
    const id = validId(toDelete);
    if (!id) {
      console.error('[locationStorage] invalid stationId, aborting delete');
      return;
    }
    const history = locationStorage
      .getLocationHistory()
      .filter(loc => loc.stationId !== id);
    safeLocalStorage.set(LOCATION_HISTORY_KEY, history);
    const current = locationStorage.getCurrentLocation();
    if (current && current.stationId === id) {
      locationStorage.clearCurrentLocation();
    }
  },

  clearCurrentLocation(): void {
    safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  },
};

function scrubOnLoad() {
  const current = safeLocalStorage.get<LocationData>(CURRENT_LOCATION_KEY);
  if (current && !validId(current)) {
    safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  } else if (current) {
    const id = validId(current)!;
    safeLocalStorage.set(CURRENT_LOCATION_KEY, { ...current, stationId: id });
  }
  const history = safeLocalStorage.get<LocationData[]>(LOCATION_HISTORY_KEY) || [];
  const sanitized = sanitizeList(history);
  if (sanitized.length !== history.length) {
    safeLocalStorage.set(LOCATION_HISTORY_KEY, sanitized);
  }
}

scrubOnLoad();
