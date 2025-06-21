
import React from 'react';
import { LocationData } from '@/types/locationTypes';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useGPSLocation } from '@/hooks/useGPSLocation';
import LocationInputForm from './LocationInputForm';

interface UnifiedLocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function UnifiedLocationInput({ 
  onLocationSelect, 
  onClose, 
  placeholder = "ZIP, City State, or City State ZIP",
  autoFocus = true
}: UnifiedLocationInputProps) {
  const { isLoading: searchLoading, handleLocationSearch } = useLocationSearch({
    onLocationSelect,
    onClose
  });

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
