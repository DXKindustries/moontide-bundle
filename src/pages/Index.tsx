
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import LoadingOverlay from '@/components/LoadingOverlay';
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
  const [isStationLoading, setIsStationLoading] = useState(false);
  const prevLocationIdRef = useRef<string | null>(currentLocation?.id || null);

  const handleStationSelect = (st: Station) => {
    console.log('🎯 Index onSelect station:', st);
    setSelectedStation(st);
  };

  console.log('🌊 Current location for useTideData:', currentLocation);

  useEffect(() => {
    if (!currentLocation) {
      if (availableStations.length !== 0) setAvailableStations([]);
      if (selectedStation !== null) setSelectedStation(null);
      if (showStationPicker) setShowStationPicker(false);
      prevLocationIdRef.current = null;
      return;
    }

    const locationChanged = prevLocationIdRef.current !== currentLocation.id;
    prevLocationIdRef.current = currentLocation.id;

    if (!locationChanged && selectedStation) {
      if (showStationPicker) setShowStationPicker(false);
      if (availableStations.length !== 0) setAvailableStations([]);
      return;
    }

    if (locationChanged && selectedStation) setSelectedStation(null);

    const input = currentLocation.zipCode || currentLocation.cityState || currentLocation.name;
    setIsStationLoading(true);
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
      })
      .finally(() => {
        setIsStationLoading(false);
      });
  }, [currentLocation]);

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
      <LoadingOverlay show={isStationLoading} message="Finding tide stations..." />
      <LoadingOverlay show={isLoading} message="Fetching tide data..." />
      
      <AppHeader
        currentLocation={currentLocation}
        stationName={stationName}
        onLocationChange={handleLocationChange}
        onStationSelect={handleStationSelect}
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
        currentStationId={selectedStation?.id || null}
        onClose={() => setShowStationPicker(false)}
      />
    </div>
  );
};

export default Index;
