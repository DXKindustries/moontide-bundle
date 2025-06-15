
import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import { toast } from 'sonner';
import { useTideData } from '@/hooks/useTideData';

const CURRENT_LOCATION_KEY = 'moontide-current-location';

const Index = () => {
  console.log('🚀 Index component rendering...');
  
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

  console.log('🌊 Current location for useTideData:', currentLocation);

  const {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName
  } = useTideData({ location: currentLocation });

  console.log('📊 useTideData results:', {
    isLoading,
    error,
    tideDataLength: tideData?.length || 0,
    weeklyForecastLength: weeklyForecast?.length || 0,
    currentDate,
    currentTime,
    stationName
  });

  useEffect(() => {
    console.log('📝 Setting document title for location:', currentLocation?.name);
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
    console.log("Current location in Index.tsx:", currentLocation);
  }, [currentLocation]);

  const handleLocationChange = (location: SavedLocation) => {
    console.log('📍 Location change requested:', location);
    const updatedLocation = {
      ...location,
      id: location.id || location.zipCode || "temp",
      country: location.country || "USA",
      name: location.name || `${location.zipCode || "Unknown Location"}`
    };
    console.log('📍 Updated location object:', updatedLocation);
    
    // Update state first
    setCurrentLocation(updatedLocation);
    
    // Save to both storage systems for backward compatibility
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, updatedLocation);
      
      // Also save to new location storage system
      const locationData: LocationData = {
        zipCode: updatedLocation.zipCode,
        city: updatedLocation.name,
        state: updatedLocation.cityState.split(', ')[1] || 'Unknown',
        lat: updatedLocation.lat,
        lng: updatedLocation.lng,
        isManual: false,
        nickname: updatedLocation.name
      };
      locationStorage.saveCurrentLocation(locationData);
      
      console.log('💾 Successfully saved updated location to both storage systems');
    } catch (error) {
      console.error('❌ Error saving location to localStorage:', error);
    }
    
    // Close the location selector if it was opened from onboarding
    setShowLocationSelector(false);
    
    toast.success(`Loading tide data for ${updatedLocation.name}`);
  };

  const handleLocationClear = () => {
    console.log('🗑️ Clearing current location from Index');
    setCurrentLocation(null);
    
    // Clear from both storage systems
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
      locationStorage.clearCurrentLocation();
      console.log('💾 Successfully cleared location from both storage systems');
    } catch (error) {
      console.error('❌ Error clearing location from localStorage:', error);
    }
  };

  const handleGetStarted = (location?: LocationData) => {
    console.log('🎯 handleGetStarted called with location:', location);
    
    if (location) {
      // Convert LocationData to SavedLocation format and update current location
      const savedLocation: SavedLocation = {
        id: location.zipCode,
        name: location.nickname || location.city,
        country: "USA",
        zipCode: location.zipCode,
        cityState: `${location.city}, ${location.state}`,
        lat: location.lat || 0,
        lng: location.lng || 0
      };
      
      console.log('🔄 Converting LocationData to SavedLocation and updating state:', savedLocation);
      handleLocationChange(savedLocation);
    } else {
      // No location provided, just show the location selector
      setShowLocationSelector(true);
    }
  };

  console.log('🎨 About to render Index component with:', {
    hasCurrentLocation: !!currentLocation,
    locationName: currentLocation?.name,
    isLoading,
    hasError: !!error,
    hasTideData: tideData?.length > 0,
    hasWeeklyForecast: weeklyForecast?.length > 0
  });

  return (
    <div className="min-h-screen pb-8 relative">
      <StarsBackdrop />
      
      <AppHeader 
        currentLocation={currentLocation}
        stationName={stationName}
        onLocationChange={handleLocationChange}
        onLocationClear={handleLocationClear}
        hasError={!!error}
        forceShowLocationSelector={showLocationSelector}
        onLocationSelectorClose={() => setShowLocationSelector(false)}
      />
      
      <MainContent 
        error={error}
        isLoading={isLoading}
        tideData={tideData}
        weeklyForecast={weeklyForecast}
        currentDate={currentDate}
        currentTime={currentTime}
        currentLocation={currentLocation}
        stationName={stationName}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};

export default Index;
