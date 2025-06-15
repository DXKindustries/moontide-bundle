
import { safeLocalStorage } from './localStorage';
import { LocationData } from '@/types/locationTypes';

const CURRENT_LOCATION_KEY = 'current-location-data';
const LOCATION_HISTORY_KEY = 'location-history';

export const locationStorage = {
  // Save current location
  saveCurrentLocation: (location: LocationData): void => {
    try {
      const locationWithTimestamp = {
        ...location,
        timestamp: Date.now()
      };
      
      console.log('💾 Saving current location:', locationWithTimestamp);
      safeLocalStorage.set(CURRENT_LOCATION_KEY, locationWithTimestamp);
      
      // Also add to history
      const history = locationStorage.getLocationHistory();
      console.log('📚 Current history:', history);
      
      // Remove any existing location with same zipCode or city/state combination
      const filtered = history.filter(loc => {
        if (location.zipCode && loc.zipCode) {
          return loc.zipCode !== location.zipCode;
        }
        return !(loc.city === location.city && loc.state === location.state);
      });
      
      const newHistory = [locationWithTimestamp, ...filtered].slice(0, 10); // Keep last 10
      console.log('📝 Saving new history:', newHistory);
      safeLocalStorage.set(LOCATION_HISTORY_KEY, newHistory);
      
      console.log('✅ Location saved successfully');
    } catch (error) {
      console.error('❌ Error saving location:', error);
    }
  },

  // Get current location
  getCurrentLocation: (): LocationData | null => {
    try {
      const location = safeLocalStorage.get(CURRENT_LOCATION_KEY);
      console.log('📍 Retrieved current location:', location);
      return location;
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      return null;
    }
  },

  // Get location history
  getLocationHistory: (): LocationData[] => {
    try {
      const history = safeLocalStorage.get(LOCATION_HISTORY_KEY) || [];
      console.log('📚 Retrieved location history:', history);
      return history;
    } catch (error) {
      console.error('❌ Error getting location history:', error);
      return [];
    }
  },

  // Clear current location
  clearCurrentLocation: (): void => {
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
      console.log('🗑️ Current location cleared');
    } catch (error) {
      console.error('❌ Error clearing current location:', error);
    }
  }
};
