
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

  return (
    <div className="w-full max-w-md mx-auto">
      <UnifiedLocationInput
        onLocationSelect={onLocationSelect}
        onClose={onClose}
        placeholder={initialZip || "ZIP, City State, or City State ZIP"}
        autoFocus={true}
      />
    </div>
  );
}
