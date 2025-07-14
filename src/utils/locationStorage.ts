import { safeLocalStorage } from './localStorage';
import { LocationData } from '@/types/locationTypes';
import { normalizeState as normalizeStateName } from './stateNames';

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
      
      // Also add to history with de-duping so selecting the same location
      // multiple times doesn't create duplicate entries.
      const history = locationStorage.getLocationHistory();
      console.log('📚 Current history:', history);

      const normalize = (val?: string) => (val || '').trim().toLowerCase();
      const normState = (val?: string) =>
        (normalizeStateName(val || '') || normalize(val));

      const isSame = (a: LocationData, b: LocationData) => {
        if (a.stationId && b.stationId) {
          return String(a.stationId).trim() === String(b.stationId).trim();
        }
        if (a.stationId || b.stationId) {
          // When only one has a stationId, fall back to comparing
          // ZIP or city/state so reselecting a station with saved
          // ZIP code doesn't create duplicates.
          if (a.zipCode && b.zipCode) {
            return normalize(a.zipCode) === normalize(b.zipCode);
          }
          return (
            a.city &&
            b.city &&
            normalize(a.city) === normalize(b.city) &&
            normState(a.state) === normState(b.state)
          );
        }
        if (a.zipCode && b.zipCode) {
          return normalize(a.zipCode) === normalize(b.zipCode);
        }
        return (
          a.city && b.city &&
          normalize(a.city) === normalize(b.city) &&
          normState(a.state) === normState(b.state)
        );
      };

      const filteredHistory = history.filter((h) => !isSame(h, locationWithTimestamp));
      const newHistory = [locationWithTimestamp, ...filteredHistory];
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

  // Update a specific location
  updateLocation: (updatedLocation: LocationData): void => {
    try {
      const history = locationStorage.getLocationHistory();
      const currentLocation = locationStorage.getCurrentLocation();
      
      // Find and update the location in history
      const updatedHistory = history.map(loc => {
        // Match by stationId or by zipCode/city/state
        const normalize = (val: string | undefined) => (val || '').trim().toLowerCase();
        const normState = (val: string | undefined) =>
          (normalizeStateName(val || '') || normalize(val)).toLowerCase();
        const isMatch = (() => {
          if (updatedLocation.stationId || loc.stationId) {
            return Boolean(
              updatedLocation.stationId &&
              loc.stationId &&
              String(loc.stationId).trim() === String(updatedLocation.stationId).trim()
            );
          }
          if (updatedLocation.zipCode && loc.zipCode) {
            return normalize(loc.zipCode) === normalize(updatedLocation.zipCode);
          }
          return (
            updatedLocation.city && loc.city &&
            normalize(loc.city) === normalize(updatedLocation.city) &&
            normState(loc.state) === normState(updatedLocation.state)
          );
        })();
        
        if (isMatch) {
          return { ...updatedLocation, timestamp: loc.timestamp || Date.now() };
        }
        return loc;
      });
      
      safeLocalStorage.set(LOCATION_HISTORY_KEY, updatedHistory);
      
      // If this is the current location, update it too
      if (currentLocation) {
        const normalize = (val: string | undefined) => (val || '').trim().toLowerCase();
        const normState = (val: string | undefined) =>
          (normalizeStateName(val || '') || normalize(val)).toLowerCase();
        const isCurrentMatch = (() => {
          if (updatedLocation.stationId || currentLocation.stationId) {
            return Boolean(
              updatedLocation.stationId &&
              currentLocation.stationId &&
              String(currentLocation.stationId).trim() ===
                String(updatedLocation.stationId).trim()
            );
          }
          if (updatedLocation.zipCode && currentLocation.zipCode) {
            return normalize(currentLocation.zipCode) === normalize(updatedLocation.zipCode);
          }
          return (
            updatedLocation.city && currentLocation.city &&
            normalize(currentLocation.city) === normalize(updatedLocation.city) &&
            normState(currentLocation.state) === normState(updatedLocation.state)
          );
        })();
        
        if (isCurrentMatch) {
          safeLocalStorage.set(CURRENT_LOCATION_KEY, { ...updatedLocation, timestamp: currentLocation.timestamp });
        }
      }
      
      console.log('✅ Location updated successfully');
    } catch (error) {
      console.error('❌ Error updating location:', error);
    }
  },

  // Delete a location from history
  deleteLocation: (locationToDelete: LocationData): void => {
    try {
      const history = locationStorage.getLocationHistory();
      const currentLocation = locationStorage.getCurrentLocation();
      
      // Filter out the location to delete
      const normalize = (val: string | undefined) => (val || '').trim().toLowerCase();
      const normState = (val: string | undefined) =>
        (normalizeStateName(val || '') || normalize(val)).toLowerCase();
      const updatedHistory = history.filter(loc => {
        const isMatch = (() => {
          if (locationToDelete.stationId || loc.stationId) {
            return Boolean(
              locationToDelete.stationId &&
              loc.stationId &&
              String(loc.stationId).trim() ===
                String(locationToDelete.stationId).trim()
            );
          }
          if (locationToDelete.zipCode && loc.zipCode) {
            return normalize(loc.zipCode) === normalize(locationToDelete.zipCode);
          }
          return (
            locationToDelete.city && loc.city &&
            normalize(loc.city) === normalize(locationToDelete.city) &&
            normState(loc.state) === normState(locationToDelete.state)
          );
        })();
        return !isMatch;
      });
      
      safeLocalStorage.set(LOCATION_HISTORY_KEY, updatedHistory);
      
      // Check if the deleted location is the current location and clear it if so
      if (currentLocation) {
        const normalize = (val: string | undefined) => (val || '').trim().toLowerCase();
        const normState = (val: string | undefined) =>
          (normalizeStateName(val || '') || normalize(val)).toLowerCase();
        const isCurrentMatch = (() => {
          if (locationToDelete.stationId || currentLocation.stationId) {
            return Boolean(
              locationToDelete.stationId &&
              currentLocation.stationId &&
              String(currentLocation.stationId).trim() ===
                String(locationToDelete.stationId).trim()
            );
          }
          if (locationToDelete.zipCode && currentLocation.zipCode) {
            return normalize(currentLocation.zipCode) === normalize(locationToDelete.zipCode);
          }
          return (
            locationToDelete.city && currentLocation.city &&
            normalize(currentLocation.city) === normalize(locationToDelete.city) &&
            normState(currentLocation.state) === normState(locationToDelete.state)
          );
        })();
        
        if (isCurrentMatch) {
          console.log('🗑️ Deleted location matches current location, clearing current location');
          locationStorage.clearCurrentLocation();
        }
      }
      
      console.log('✅ Location deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting location:', error);
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
