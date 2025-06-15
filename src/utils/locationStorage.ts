
import { safeLocalStorage } from './localStorage';
import { LocationData } from '@/types/locationTypes';

const CURRENT_LOCATION_KEY = 'current-location-data';
const LOCATION_HISTORY_KEY = 'location-history';

export const locationStorage = {
  // Save current location
  saveCurrentLocation: (location: LocationData): void => {
    const locationWithTimestamp = {
      ...location,
      timestamp: Date.now()
    };
    safeLocalStorage.set(CURRENT_LOCATION_KEY, locationWithTimestamp);
    
    // Also add to history
    const history = locationStorage.getLocationHistory();
    const filtered = history.filter(loc => loc.zipCode !== location.zipCode);
    const newHistory = [locationWithTimestamp, ...filtered].slice(0, 10); // Keep last 10
    safeLocalStorage.set(LOCATION_HISTORY_KEY, newHistory);
  },

  // Get current location
  getCurrentLocation: (): LocationData | null => {
    return safeLocalStorage.get(CURRENT_LOCATION_KEY);
  },

  // Get location history
  getLocationHistory: (): LocationData[] => {
    return safeLocalStorage.get(LOCATION_HISTORY_KEY) || [];
  },

  // Clear current location
  clearCurrentLocation: (): void => {
    safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
  }
};
