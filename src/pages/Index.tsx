
import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { toast } from 'sonner';
import { useTideData } from '@/hooks/useTideData';

// --- Fix: Ensure default 'currentLocation' has required fields: id, name, country, zipCode, lat, lng ---
const DEFAULT_LOCATION: SavedLocation & { id: string; country: string } = {
  id: "narragansett", // required for hook and caching
  name: "Narragansett",
  country: "USA",
  zipCode: "02882",
  cityState: "Narragansett, RI",
  lat: 41.4501,
  lng: -71.4495,
};

const CURRENT_LOCATION_KEY = 'moontide-current-location';

const Index = () => {
  console.log('🚀 Index component rendering...');
  
  const [currentLocation, setCurrentLocation] = useState<SavedLocation & { id: string; country: string } | null>(() => {
    console.log('📍 Initializing currentLocation state...');
    try {
      const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
      console.log('💾 Saved location from localStorage:', saved);
      if (saved) {
        // Ensure the saved location has all required fields
        const location = {
          ...saved,
          id: saved.id || saved.zipCode || "default",
          country: saved.country || "USA",
        };
        console.log('✅ Using saved location:', location);
        return location;
      }
    } catch (error) {
      console.warn('⚠️ Error reading location from localStorage:', error);
    }
    console.log('🎯 Using DEFAULT_LOCATION:', DEFAULT_LOCATION);
    return DEFAULT_LOCATION; // Always fallback to a valid object
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
      id: location.id || (location.zipCode || "default"),
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
      
      <AppHeader 
        currentLocation={currentLocation}
        stationName={stationName}
        onLocationChange={handleLocationChange}
      />

      <MainContent 
        error={error}
        isLoading={isLoading}
        tideData={tideData}
        weeklyForecast={weeklyForecast}
        currentDate={currentDate}
        currentTime={currentTime}
      />
    </div>
  );
};

export default Index;
