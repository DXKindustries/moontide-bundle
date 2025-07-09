import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { safeLocalStorage } from './localStorage';
import { locationStorage } from './locationStorage';

const CURRENT_LOCATION_KEY = 'currentLocation';

export function persistCurrentLocation(location: SavedLocation & { id: string; country: string }) {
  const [city, state] = location.cityState.split(', ');
  const storageObj = location.zipCode
    ? {
        zipCode: location.zipCode,
        city: city || location.name,
        state: state || '',
        lat: location.lat,
        lng: location.lng,
        sourceType: 'zip' as const,
      }
    : {
        stationId: location.id,
        stationName: location.name,
        state: state || '',
        lat: location.lat,
        lng: location.lng,
        zipCode: location.zipCode || '',
        city: city || '',
        sourceType: 'station' as const,
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
    isManual: false,
    nickname: location.name !== city ? location.name : undefined,
  };
  locationStorage.saveCurrentLocation(locationData);
}

export function loadCurrentLocation(): (SavedLocation & { id: string; country: string }) | null {
  const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
  console.log('Loaded currentLocation from storage:', saved);
  if (saved) {
    if (saved.sourceType === 'station') {
      return {
        id: saved.stationId,
        name: saved.stationName,
        country: 'USA',
        zipCode: saved.zipCode || '',
        cityState: `${saved.city ?? ''}, ${saved.state ?? ''}`,
        lat: saved.lat ?? null,
        lng: saved.lng ?? null,
      };
    }
    return {
      id: saved.zipCode || `${saved.city}-${saved.state}`,
      name: saved.city,
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
