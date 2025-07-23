
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import MainContent from '@/components/MainContent';
import LocationOnboardingStep1 from './LocationOnboardingStep1';
import StarsBackdrop from '@/components/StarsBackdrop';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import LocationManager from '@/components/LocationManager';
import StationPicker from '@/components/StationPicker';
import { getStationsForLocationInput } from '@/services/locationService';
import { Station, sortStationsForDefault } from '@/services/tide/stationService';
import { filterStationsNearby } from '@/utils/stationSearch';

const Index = () => {

  const {
    currentLocation,
    setCurrentLocation,
    showLocationSelector,
    setShowLocationSelector,
    selectedState,
    selectedStation,
    setSelectedStation
  } = useLocationState();

  // Ensure the location selector is closed when arriving on the dashboard
  useLayoutEffect(() => {
    setShowLocationSelector(false);
  }, []);

  const {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted,
  } = LocationManager({ setCurrentLocation, setShowLocationSelector, selectedState });

  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const prevLocationIdRef = useRef<string | null>(currentLocation?.id || null);
  const prevStationIdRef = useRef<string | null>(selectedStation?.id || null);

  const handleStationSelect = (st: Station) => {
    setSelectedStation(st);
  };


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
    const stationChanged = prevStationIdRef.current !== (selectedStation?.id || null);
    prevStationIdRef.current = selectedStation?.id || null;

    // When the location ID matches the selected station ID, we already
    // have the correct station and should skip any nearby search.
    if (selectedStation && selectedStation.id === currentLocation.id) {
      if (showStationPicker) setShowStationPicker(false);
      if (availableStations.length !== 0) setAvailableStations([]);
      return;
    }

    if (locationChanged && !stationChanged && selectedStation) {
      setSelectedStation(null);
    }

    const input = currentLocation.zipCode || currentLocation.cityState || currentLocation.name;
    setIsStationLoading(true);
    getStationsForLocationInput(
      input,
      currentLocation.lat,
      currentLocation.lng,
      currentLocation.cityState?.split(',')[1]?.trim(),
    )
      .then((stations) => {
        if (!stations || stations.length === 0) {
          setAvailableStations([]);
          setShowStationPicker(false);
        } else {
          const stateCode = currentLocation.cityState?.split(',')[1]?.trim()?.toUpperCase();
          let filtered = stations;
          if (stateCode) {
            const inState = stations.filter((s) => s.state?.toUpperCase() === stateCode);
            if (inState.length > 0) {
              filtered = inState;
            } else {
              toast.warning('No NOAA stations found in state, showing nearby alternatives');
            }
          }
          if (
            typeof currentLocation.lat === 'number' &&
            typeof currentLocation.lng === 'number'
          ) {
            filtered = filterStationsNearby(
              currentLocation.lat,
              currentLocation.lng,
              filtered,
            );
          }

          const sorted = sortStationsForDefault(
            filtered,
            currentLocation.lat ?? undefined,
            currentLocation.lng ?? undefined,
            currentLocation.cityState?.split(',')[0],
          );
          setAvailableStations(sorted);
          if (sorted.length === 0) {
            setShowStationPicker(false);
          } else if (sorted.length === 1) {
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
    stationId,
    banner
  } = useTideData({ location: currentLocation, station: selectedStation });


  if (!currentLocation) {
    return (
      <LocationOnboardingStep1 onStationSelect={handleStationSelect} />
    );
  }

  return (
    <div className="min-h-screen pb-8 pt-24 relative">
      <StarsBackdrop />
      <LoadingOverlay show={isStationLoading} message="Finding tide stations..." />
      <LoadingOverlay show={isLoading} message="Fetching tide data..." />
      
      <AppHeader
        onLocationChange={handleLocationChange}
        onStationSelect={handleStationSelect}
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
        banner={banner}
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
