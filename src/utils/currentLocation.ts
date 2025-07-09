import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { safeLocalStorage } from './localStorage';
import { locationStorage } from './locationStorage';
import { addLocationHistory } from './locationHistory';
import type { Station } from '@/services/tide/stationService';
import type { LocationHistoryEntry } from '@/types/locationHistory';

const CURRENT_LOCATION_KEY = 'currentLocation';

export function persistStationCurrentLocation(station?: Station | null) {
  if (!station) {
    console.error('Station object is undefined, not saving.');
    return;
  }
  const stationObject = station;
  console.log('💾 Saving fetched station object:', stationObject);
  console.log('Saving station currentLocation to storage:', station);
  const storageObj = {
    stationId: station.id,
    stationName: station.name,
    state: station.state ?? '',
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
    state: station.state ?? '',
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
    state: station.state ?? '',
    zipCode: station.zip ?? '',
    sourceType: 'station',
    timestamp: Date.now(),
  };
  addLocationHistory(entry);
}

export function persistCurrentLocation(location: SavedLocation & { id: string; country: string }) {
  const [city, state] = location.cityState.split(', ');
  const storageObj = location.zipCode
    ? {
        zipCode: location.zipCode,
        city: city || location.name,
        state: state || '',
        lat: location.lat,
        lng: location.lng,
        stationId: undefined,
        stationName: undefined,
        nickname: location.name !== city ? location.name : undefined,
        isManual: false,
      }
    : {
        stationId: location.id,
        stationName: location.name,
        state: state || '',
        lat: location.lat,
        lng: location.lng,
        zipCode: location.zipCode || '',
        city: city || '',
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
    zipCode: location.zipCode || undefined,
    sourceType: location.zipCode ? 'zip' : 'station',
    timestamp: Date.now(),
  };
  addLocationHistory(entry);
}

export function loadCurrentLocation(): (SavedLocation & { id: string; country: string }) | null {
  const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
  console.log('Loaded currentLocation from storage:', saved);
  if (saved) {
    return {
      id: saved.stationId || saved.zipCode || `${saved.city}-${saved.state}`,
      name: saved.nickname || saved.stationName || saved.city,
      country: 'USA',
      zipCode: saved.zipCode || '',
      cityState: `${saved.city}, ${saved.state}`,
      lat: saved.lat ?? null,
      lng: saved.lng ?? null,
    };
  }

  const stored = locationStorage.getCurrentLocation();
  if (stored) {
    return {
      id: stored.id || stored.zipCode || `${stored.city}-${stored.state}`,
      name: stored.nickname || stored.city,
      country: 'USA',
      zipCode: stored.zipCode || '',
      cityState: `${stored.city}, ${stored.state}`,
      lat: stored.lat ?? null,
      lng: stored.lng ?? null,
    };
  }

  return null;
}

export function clearCurrentLocation() {
  safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  locationStorage.clearCurrentLocation();
}
