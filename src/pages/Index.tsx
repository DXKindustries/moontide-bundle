import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import StarsBackdrop from '@/components/StarsBackdrop';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import LocationManager from '@/components/LocationManager';
import StationPicker from '@/components/StationPicker';
import { getStationsForLocationInput } from '@/services/locationService';
import { Station, sortStationsForDefault } from '@/services/tide/stationService';

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

  useLayoutEffect(() => {
    setShowLocationSelector(false);
  }, []);

  const {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted,
  } = LocationManager({ setCurrentLocation, setShowLocationSelector });

  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const [incomingStations, setIncomingStations] = useState<Station[] | null>(null);
  const prevLocationIdRef = useRef<string | null>(currentLocation?.id || null);

  const handleStationSelect = (st: Station) => {
    console.log('🎯 Index onSelect station:', st);
    setSelectedStation(st);
  };

  const handleStationsFound = useCallback((stations: Station[]) => {
    setIncomingStations(stations);
  }, []);

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

    if (incomingStations) {
      const sorted = sortStationsForDefault(
        incomingStations,
        currentLocation.lat ?? undefined,
        currentLocation.lng ?? undefined,
        currentLocation.cityState?.split(',')[0],
      );
      setAvailableStations(sorted);
      if (sorted.length === 1) {
        console.log('🎯 Auto-selecting sole station from incoming list:', sorted[0]);
        setSelectedStation(sorted[0]);
        setShowStationPicker(false);
      } else {
        setShowStationPicker(true);
      }
      setIncomingStations(null);
      return;
    }

    if (!locationChanged && selectedStation) {
      if (showStationPicker) setShowStationPicker(false);
      if (availableStations.length !== 0) setAvailableStations([]);
      return;
    }

    if (locationChanged && selectedStation) setSelectedStation(null);

    const input = currentLocation.zipCode || currentLocation.cityState || currentLocation.name;
    console.log('📍 Station lookup for:', { input, lat: currentLocation.lat, lon: currentLocation.lng });
    setIsStationLoading(true);
    getStationsForLocationInput(input, currentLocation.lat, currentLocation.lng)
      .then((stations) => {
        console.log('📡 Stations API response payload:', stations);
        console.log('📡 Stations API returned', stations.length, 'items');
        console.log(stations.length > 0 ? '✅ Stations found' : '❌ No stations found');
        if (!stations || stations.length === 0) {
          console.log('🏁 Final availableStations: []');
          setAvailableStations([]);
          setShowStationPicker(false);
          toast.error('No tide stations found nearby — try another ZIP or location.');
        } else {
          const sorted = sortStationsForDefault(
            stations,
            currentLocation.lat ?? undefined,
            currentLocation.lng ?? undefined,
            currentLocation.cityState?.split(',')[0],
          );
          console.log('📈 Sorted station IDs:', sorted.map(s => s.id));
          console.log('🏁 Final availableStations:', sorted);
          setAvailableStations(sorted);
          if (sorted.length === 1) {
            console.log('🎯 Auto-selecting sole station:', sorted[0]);
            setSelectedStation(sorted[0]);
            setShowStationPicker(false);
          } else {
            setShowStationPicker(true);
          }
        }
      })
      .catch(() => {
        setAvailableStations([]);
        setShowStationPicker(false);
      })
      .finally(() => {
        setIsStationLoading(false);
      });
  }, [currentLocation, incomingStations]);

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
        onStationsFound={handleStationsFound}
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
