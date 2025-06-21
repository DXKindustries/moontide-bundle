
import { useState, useEffect } from 'react';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';

const CURRENT_LOCATION_KEY = 'moontide-current-location';

export const useLocationState = () => {
  console.log('🏗️ useLocationState hook initializing...');
  
  const [currentLocation, setCurrentLocation] = useState<SavedLocation & { id: string; country: string } | null>(() => {
    console.log('📍 Initializing currentLocation state...');
    try {
      // First try the new location storage system
      const newLocation = locationStorage.getCurrentLocation();
      if (newLocation && newLocation.zipCode && newLocation.zipCode !== "default") {
        console.log('✅ Found location in new storage system:', newLocation);
        // Convert LocationData to SavedLocation format
        const convertedLocation = {
          id: newLocation.zipCode,
          name: newLocation.nickname || newLocation.city,
          country: "USA",
          zipCode: newLocation.zipCode,
          cityState: `${newLocation.city}, ${newLocation.state}`,
          lat: newLocation.lat || 0,
          lng: newLocation.lng || 0
        };
        return convertedLocation;
      }

      // Fallback to old storage system
      const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
      console.log('💾 Saved location from old localStorage:', saved);
      if (saved && saved.zipCode && saved.zipCode !== "default") {
        // Ensure the saved location has all required fields
        const location = {
          ...saved,
          id: saved.id || saved.zipCode,
          country: saved.country || "USA",
        };
        console.log('✅ Using saved location from old system:', location);
        return location;
      }
    } catch (error) {
      console.warn('⚠️ Error reading location from localStorage:', error);
    }
    console.log('🎯 No saved location found, starting with null');
    return null; // Start with no location instead of hardcoded default
  });

  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Add a custom setter that includes logging
  const setCurrentLocationWithLogging = (location: SavedLocation & { id: string; country: string } | null) => {
    console.log('🔄 useLocationState: setCurrentLocation called with:', location);
    console.log('🔄 useLocationState: Previous location was:', currentLocation);
    setCurrentLocation(location);
    console.log('🔄 useLocationState: State update triggered - component should re-render');
    
    // Additional debugging
    if (location) {
      console.log('✅ useLocationState: User now has a location - onboarding should hide');
    } else {
      console.log('🎯 useLocationState: User has no location - onboarding should show');
    }
  };

  // Update document title when location changes
  useEffect(() => {
    console.log('📝 useLocationState useEffect: Setting document title for location:', currentLocation?.name);
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
    console.log("🔄 useLocationState useEffect: Current location:", currentLocation);
    console.log("🔄 useLocationState useEffect: Location state change detected - hasLocation:", !!currentLocation);
    
    // Additional state debugging
    if (currentLocation) {
      console.log('✅ useLocationState useEffect: Location exists, main content should show');
    } else {
      console.log('🎯 useLocationState useEffect: No location, onboarding should show');
    }
  }, [currentLocation]);

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithLogging,
    showLocationSelector,
    setShowLocationSelector
  };
};
