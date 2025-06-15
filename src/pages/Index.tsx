import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import MobileScreenBoundary from '@/components/MobileScreenBoundary';
import MobileBoundaryToggle from '@/components/MobileBoundaryToggle';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import { toast } from 'sonner';
import { useTideData } from '@/hooks/useTideData';
import { useMobileBoundary } from '@/hooks/useMobileBoundary';

const CURRENT_LOCATION_KEY = 'moontide-current-location';

const Index = () => {
  console.log('🚀 Index component rendering...');
  
  const { showBoundary, setShowBoundary } = useMobileBoundary();
  
  const [currentLocation, setCurrentLocation] = useState<SavedLocation & { id: string; country: string } | null>(() => {
    console.log('📍 Initializing currentLocation state...');
    try {
      const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
      console.log('💾 Saved location from localStorage:', saved);
      if (saved && saved.zipCode && saved.zipCode !== "default") {
        // Ensure the saved location has all required fields
        const location = {
          ...saved,
          id: saved.id || saved.zipCode,
          country: saved.country || "USA",
        };
        console.log('✅ Using saved location:', location);
        return location;
      }
    } catch (error) {
      console.warn('⚠️ Error reading location from localStorage:', error);
    }
    console.log('🎯 No saved location found, starting with null');
    return null; // Start with no location instead of hardcoded default
  });

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
    
    // Then save to localStorage
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, updatedLocation);
      console.log('💾 Successfully saved updated location to localStorage');
    } catch (error) {
      console.error('❌ Error saving location to localStorage:', error);
    }
    
    toast.success(`Loading tide data for ${updatedLocation.name}`);
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
      <MobileScreenBoundary show={showBoundary} />
      <MobileBoundaryToggle 
        showBoundary={showBoundary} 
        onToggle={() => setShowBoundary(prev => !prev)} 
      />
      
      <AppHeader 
        currentLocation={currentLocation}
        stationName={stationName}
        onLocationChange={handleLocationChange}
        hasError={!!error}
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
      />
    </div>
  );
};

export default Index;
