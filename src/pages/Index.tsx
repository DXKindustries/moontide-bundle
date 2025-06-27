
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import { useLocationManager } from '@/components/LocationManager';
import StationPicker from '@/components/StationPicker';
import { getStationsForLocationInput } from '@/services/locationService';
import { Station } from '@/services/tide/stationService';

const Index = () => {
  console.log('🚀 Index component rendering...');
  
  const {
    currentLocation,
    setCurrentLocation,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation
  } = useLocationState();

  const {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted
  } = useLocationManager({ setCurrentLocation, setShowLocationSelector });

  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [showStationPicker, setShowStationPicker] = useState(false);

  const handleStationSelect = (st: Station) => {
    console.log('🎯 Index onSelect station:', st);
    setSelectedStation(st);
  };

  console.log('🌊 Current location for useTideData:', currentLocation);

  useEffect(() => {
    if (!currentLocation) {
      setAvailableStations([]);
      setSelectedStation(null);
      setShowStationPicker(false);
      return;
    }

    const input = currentLocation.zipCode || currentLocation.cityState || currentLocation.name;
    setSelectedStation(null);
    getStationsForLocationInput(input)
      .then((stations) => {
        if (!stations || stations.length === 0) {
          setAvailableStations([]);
          setShowStationPicker(false);
          toast.error('No NOAA stations found for this location.');
        } else {
          setAvailableStations(stations);
          setShowStationPicker(true);
        }
      })
      .catch(() => {
        setAvailableStations([]);
        setShowStationPicker(false);
      });
  }, [currentLocation, setSelectedStation]);

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
  } = useTideData({ location: currentLocation, station: selectedStation });

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

      <StationPicker
        isOpen={showStationPicker}
        stations={availableStations}
        onSelect={handleStationSelect}
        onClose={() => setShowStationPicker(false)}
      />
    </div>
  );
};

export default Index;
