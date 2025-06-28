
import { useState, useEffect } from 'react';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { Station } from '@/services/tide/stationService';

const CURRENT_LOCATION_KEY = 'moontide-current-location';
const CURRENT_STATION_KEY = 'moontide-current-station';

export const useLocationState = () => {
  console.log('🏗️ useLocationState hook initializing...');
  
  const [currentLocation, setCurrentLocation] = useState<SavedLocation & { id: string; country: string } | null>(() => {
    console.log('📍 Initializing currentLocation state...');
    try {
      // Try new location storage first
      const newLocation = locationStorage.getCurrentLocation();
      if (newLocation && (newLocation.zipCode || (newLocation.city && newLocation.state))) {
        console.log('✅ Found location in new storage system:', newLocation);
        const convertedLocation = {
          id: newLocation.zipCode || `${newLocation.city}-${newLocation.state}`,
          name: newLocation.nickname || newLocation.city,
          country: "USA",
          zipCode: newLocation.zipCode || '',
          cityState: `${newLocation.city}, ${newLocation.state}`,
          lat: newLocation.lat || 0,
          lng: newLocation.lng || 0
        };
        return convertedLocation;
      }

      // Fallback to old storage
      const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
      if (saved && (saved.zipCode || (saved.city && saved.state))) {
        console.log('✅ Found location in old storage system:', saved);
        const location = {
          ...saved,
          id: saved.id || saved.zipCode || `${saved.city}-${saved.state}`,
          country: saved.country || "USA",
        };
        return location;
      }
    } catch (error) {
      console.warn('⚠️ Error reading location from storage:', error);
    }
    
    console.log('🎯 No saved location found, starting with null');
    return null;
  });

  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(() => {
    try {
      const saved = safeLocalStorage.get(CURRENT_STATION_KEY);
      return saved && saved.id ? saved as Station : null;
    } catch {
      return null;
    }
  });

  const setCurrentLocationWithLogging = React.useCallback(
    (location: (SavedLocation & { id: string; country: string }) | null) => {
      console.log('🔄 useLocationState: setCurrentLocation called with:', location);
      setCurrentLocation(location);

      if (location) {
        console.log('✅ useLocationState: User now has a location');
      } else {
        console.log('🎯 useLocationState: User has no location');
      }
    },
    []
  );

  const setSelectedStationWithPersist = React.useCallback((station: Station | null) => {
    setSelectedStation(station);
    try {
      safeLocalStorage.set(CURRENT_STATION_KEY, station);
    } catch (err) {
      console.warn('⚠️ Error saving station selection:', err);
    }
  }, []);

  useEffect(() => {
    console.log('📝 useLocationState useEffect: Setting document title for location:', currentLocation?.name);
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
    console.log("🔄 useLocationState useEffect: Location state change detected - hasLocation:", !!currentLocation);
  }, [currentLocation]);

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithLogging,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation: setSelectedStationWithPersist
  };
};
