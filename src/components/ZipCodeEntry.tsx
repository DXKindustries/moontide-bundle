
import React from 'react';
import { LocationData } from '@/types/locationTypes';
import UnifiedLocationInput from './UnifiedLocationInput';

interface ZipCodeEntryProps {
  onLocationSelect: (location: LocationData) => void;
  onLocationClear?: () => void;
  onClose?: () => void;
  initialZip?: string;
  skipAutoLoad?: boolean;
}

export default function ZipCodeEntry({ 
  onLocationSelect, 
  onLocationClear,
  onClose, 
  initialZip,
  skipAutoLoad = false 
}: ZipCodeEntryProps) {
  
  console.log('🏗️ ZipCodeEntry rendering with props:', { initialZip, skipAutoLoad });

  const handleLocationSelect = (location: LocationData) => {
    console.log('📍 ZipCodeEntry: Location selected:', location);
    onLocationSelect(location);
  };

  const handleClose = () => {
    console.log('🔒 ZipCodeEntry: Close requested');
    onClose?.();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <UnifiedLocationInput
        onLocationSelect={handleLocationSelect}
        onClose={handleClose}
        placeholder={initialZip || "ZIP, City State, or City State ZIP"}
        autoFocus={true}
      />
    </div>
  );
}
