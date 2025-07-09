import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { safeLocalStorage } from './localStorage';
import { locationStorage } from './locationStorage';

const CURRENT_LOCATION_KEY = 'moontide-current-location';

export function persistCurrentLocation(location: SavedLocation & { id: string; country: string }) {
  safeLocalStorage.set(CURRENT_LOCATION_KEY, location);

  const [city, state] = location.cityState.split(', ');
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

  const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
  if (saved) {
    return {
      ...saved,
      id: saved.id || saved.zipCode || `${saved.cityState}`,
      country: saved.country || 'USA',
    };
  }
  return null;
}

export function clearCurrentLocation() {
  safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  locationStorage.clearCurrentLocation();
}
