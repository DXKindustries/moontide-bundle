
import React from 'react';
import { LocationData } from '@/types/locationTypes';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useGPSLocation } from '@/hooks/useGPSLocation';
import { Station } from '@/services/tide/stationService';
import LocationInputForm from './LocationInputForm';

interface UnifiedLocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  onStationSelect?: (station: Station) => void;
  onClose?: () => void;
  onStationsFound?: (stations: Station[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function UnifiedLocationInput({ 
  onLocationSelect,
  onStationSelect,
  onClose,
  onStationsFound,
  placeholder = "ZIP, City State, or NOAA Station Name/ID",
  autoFocus = true
}: UnifiedLocationInputProps) {
  const { isLoading: searchLoading, handleLocationSearch, stations } = useLocationSearch({
    onLocationSelect,
    onStationSelect,
    onClose
  });

  React.useEffect(() => {
    if (onStationsFound) onStationsFound(stations);
  }, [stations, onStationsFound]);

  const { isLoading: gpsLoading, handleGPSRequest } = useGPSLocation({
    onLocationSelect,
    onClose
  });

  const isLoading = searchLoading || gpsLoading;

  return (
    <LocationInputForm
      placeholder={placeholder}
      autoFocus={autoFocus}
      isLoading={isLoading}
      onSearch={handleLocationSearch}
      onGPSRequest={handleGPSRequest}
    />
  );
}
