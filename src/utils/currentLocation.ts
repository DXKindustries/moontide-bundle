import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { safeLocalStorage } from './localStorage';
import { locationStorage } from './locationStorage';
import { saveLocationHistory, saveStationHistory } from '../services/storage/locationHistory';
import type { Station } from '@/services/tide/stationService';
import type { LocationHistoryEntry } from '@/types/locationHistory';

const NUMERIC_ID_RE = /^\d+$/;

const CURRENT_LOCATION_KEY = 'currentLocation';

export function persistStationCurrentLocation(station?: Station | null, userState?: string | null) {
  if (!station) {
    console.error('Station object is undefined, not saving.');
    return;
  }
  if (!station.id || !NUMERIC_ID_RE.test(String(station.id))) {
    console.error('Invalid station ID');
    return;
  }
  const stationObject = station;
  console.log('💾 Saving fetched station object:', stationObject);
  console.log('Saving station currentLocation to storage:', station);
  const finalState = userState ?? station.state ?? '';
  const storageObj = {
    stationId: station.id,
    stationName: station.name,
    state: finalState,
    userSelectedState: userState ?? station.userSelectedState ?? '',
    lat: station.latitude,
    lng: station.longitude,
    zipCode: station.zip ?? '',
    city: station.city ?? '',
    nickname: undefined,
    isManual: false,
  };
  safeLocalStorage.set(CURRENT_LOCATION_KEY, storageObj);
  console.log('Station currentLocation saved.');

  const locationData: LocationData = {
    zipCode: station.zip ?? '',
    city: station.city ?? station.name,
    state: finalState,
    userSelectedState: userState ?? station.userSelectedState ?? '',
    lat: station.latitude,
    lng: station.longitude,
    stationId: station.id,
    stationName: station.name,
    isManual: false,
    nickname: undefined,
  };
  locationStorage.saveCurrentLocation(locationData);

  const entry: LocationHistoryEntry = {
    stationId: station.id,
    stationName: station.name,
    nickname: undefined,
    lat: station.latitude,
    lng: station.longitude,
    city: station.city ?? '',
    state: finalState,
    userSelectedState: userState ?? station.userSelectedState ?? '',
    zipCode: station.zip ?? '',
    sourceType: 'station',
    timestamp: Date.now(),
  };
  saveLocationHistory(entry);
  saveStationHistory({ ...station, state: finalState });
}

export function persistCurrentLocation(location: SavedLocation & { id: string; country: string }) {
  if (!location.id || !NUMERIC_ID_RE.test(location.id)) {
    console.error('Invalid station ID');
    return;
  }
  const [city, state] = location.cityState.split(', ');
  const isStationId = NUMERIC_ID_RE.test(location.id);
  const storageObj = {
    zipCode: location.zipCode || '',
    city: city || location.name,
    state: state || '',
    userSelectedState: location.userSelectedState ?? state || '',
    lat: location.lat,
    lng: location.lng,
    stationId: isStationId ? location.id : undefined,
    stationName: isStationId ? location.name : undefined,
    nickname: location.name !== city ? location.name : undefined,
    isManual: false,
  };

  console.log('Saving current location to storage:', storageObj);
  safeLocalStorage.set(CURRENT_LOCATION_KEY, storageObj);
  console.log('Station currentLocation saved successfully.');

  const locationData: LocationData = {
    zipCode: location.zipCode,
    city: city || location.name,
    state: state || '',
    userSelectedState: location.userSelectedState ?? state || '',
    lat: location.lat,
    lng: location.lng,
    stationId: storageObj.stationId,
    stationName: storageObj.stationName,
    isManual: false,
    nickname: location.name !== city ? location.name : undefined,
  };
  locationStorage.saveCurrentLocation(locationData);

  const entry: LocationHistoryEntry = {
    stationId: storageObj.stationId ?? location.id,
    stationName: storageObj.stationName ?? location.name,
    nickname: location.name !== city ? location.name : undefined,
    lat: location.lat,
    lng: location.lng,
    city: city || undefined,
    state: state || undefined,
    userSelectedState: location.userSelectedState ?? state || undefined,
    zipCode: location.zipCode || undefined,
    sourceType: location.zipCode ? 'zip' : 'station',
    timestamp: Date.now(),
  };
  saveLocationHistory(entry);
  saveStationHistory({ id: storageObj.stationId ?? location.id, name: storageObj.stationName ?? location.name, latitude: location.lat ?? 0, longitude: location.lng ?? 0, state: state || "", city: city || "" });
}

export function loadCurrentLocation(): (SavedLocation & { id: string; country: string }) | null {
  const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
  console.log('Loaded currentLocation from storage:', saved);
  if (saved && saved.stationId && NUMERIC_ID_RE.test(String(saved.stationId))) {
    return {
      id: saved.stationId || saved.zipCode || `${saved.city}-${saved.state}`,
      name: saved.nickname || saved.stationName || saved.city,
      country: 'USA',
      zipCode: saved.zipCode || '',
      cityState: `${saved.city}, ${saved.state}`,
      lat: saved.lat ?? null,
      lng: saved.lng ?? null,
      userSelectedState: saved.userSelectedState,
    };
  } else if (saved) {
    // remove invalid legacy entry
    safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  }

  const stored = locationStorage.getCurrentLocation();
  if (stored && stored.stationId && NUMERIC_ID_RE.test(String(stored.stationId))) {
    return {
      id: stored.id || stored.zipCode || `${stored.city}-${stored.state}`,
      name: stored.nickname || stored.city,
      country: 'USA',
      zipCode: stored.zipCode || '',
      cityState: `${stored.city}, ${stored.state}`,
      lat: stored.lat ?? null,
      lng: stored.lng ?? null,
      userSelectedState: stored.userSelectedState,
    };
  }

  return null;
}

export function clearCurrentLocation() {
  safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  locationStorage.clearCurrentLocation();
}
