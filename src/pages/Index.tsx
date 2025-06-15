
import React from 'react';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import { useLocationManager } from '@/components/LocationManager';

const Index = () => {
  console.log('🚀 Index component rendering... (forced refresh)');
  
  const {
    currentLocation,
    setCurrentLocation,
    showLocationSelector,
    setShowLocationSelector
  } = useLocationState();

  const {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted
  } = useLocationManager({ setCurrentLocation, setShowLocationSelector });

  console.log('🌊 Current location for useTideData:', currentLocation);
  console.log('🔍 Force refresh - location details:', {
    hasLocation: !!currentLocation,
    zipCode: currentLocation?.zipCode,
    name: currentLocation?.name
  });

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
