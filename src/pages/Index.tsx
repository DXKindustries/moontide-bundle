
import React from 'react';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import { useLocationManager } from '@/components/LocationManager';

const Index = () => {
  console.log('🚀 Index component rendering...');
  
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

  const {
    isLoading,
    error,
    tideData,
    tideEvents,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName,
    stationId
  } = useTideData({ location: currentLocation });

  console.log('📊 useTideData results:', {
    isLoading,
    error,
    tideDataLength: tideData?.length || 0,
    hasCurrentLocation: !!currentLocation
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
        tideEvents={tideEvents}
        weeklyForecast={weeklyForecast}
        currentDate={currentDate}
        currentTime={currentTime}
        currentLocation={currentLocation}
        stationName={stationName}
        stationId={stationId}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};

export default Index;
