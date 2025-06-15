
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData, ZipLookupResult } from '@/types/locationTypes';
import ZipCodeInput from './ZipCodeInput';
import ManualLocationEntry from './ManualLocationEntry';
import LocationConfirmation from './LocationConfirmation';

type EntryMode = 'zip' | 'manual' | 'confirmation';

interface ZipCodeEntryProps {
  onLocationSelect: (location: LocationData) => void;
  onLocationClear?: () => void; // New prop to handle clearing
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
  const [mode, setMode] = useState<EntryMode>('zip');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZip, setCurrentZip] = useState(initialZip || '');
  const [pendingLocation, setPendingLocation] = useState<LocationData | null>(null);

  // Load existing location on mount only if not skipping auto-load
  useEffect(() => {
    if (!skipAutoLoad) {
      const existing = locationStorage.getCurrentLocation();
      if (existing && !initialZip) {
        setPendingLocation(existing);
        setMode('confirmation');
      }
    }
  }, [initialZip, skipAutoLoad]);

  const handleZipLookup = async (zipCode: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setCurrentZip(zipCode);

    console.log(`🔍 Looking up ZIP code: ${zipCode}`);

    try {
      const result = await lookupZipCode(zipCode);
      
      if (result && result.places && result.places.length > 0) {
        const place = result.places[0];
        const location: LocationData = {
          zipCode,
          city: place['place name'],
          state: place.state,
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude),
          isManual: false
        };

        console.log(`✅ ZIP lookup successful:`, location);
        setPendingLocation(location);
        setMode('confirmation');
        toast.success(`Found ${location.city}, ${location.state}`);
      } else {
        console.log(`❌ ZIP lookup failed - no results for ${zipCode}`);
        setError(`ZIP code ${zipCode} not found. Please enter location manually.`);
        setMode('manual');
      }
    } catch (err) {
      console.error(`💥 ZIP lookup error:`, err);
      setError(`Unable to look up ZIP code. Please enter location manually.`);
      setMode('manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = (): void => {
    console.log('🗑️ Clearing location from ZipCodeEntry');
    setMode('zip');
    setError(null);
    setCurrentZip('');
    setPendingLocation(null);
    
    // Clear the stored location and notify parent
    locationStorage.clearCurrentLocation();
    if (onLocationClear) {
      onLocationClear();
    }
  };

  const handleManualSave = (location: LocationData): void => {
    console.log(`📝 Manual location entry:`, location);
    setPendingLocation(location);
    setMode('confirmation');
    toast.success(`Location saved: ${location.city}, ${location.state}`);
  };

  const handleConfirm = (): void => {
    if (pendingLocation) {
      console.log(`✅ Confirming location:`, pendingLocation);
      locationStorage.saveCurrentLocation(pendingLocation);
      onLocationSelect(pendingLocation);
      toast.success(`Using ${pendingLocation.city}, ${pendingLocation.state}`);
      onClose?.();
    }
  };

  const handleEdit = (): void => {
    setMode('zip');
    setError(null);
  };

  const handleCancel = (): void => {
    setMode('zip');
    setError(null);
    setCurrentZip('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {mode === 'zip' && (
        <ZipCodeInput
          onZipSubmit={handleZipLookup}
          onClear={handleClear}
          isLoading={isLoading}
          error={error}
        />
      )}

      {mode === 'manual' && (
        <ManualLocationEntry
          zipCode={currentZip}
          onSave={handleManualSave}
          onCancel={handleCancel}
        />
      )}

      {mode === 'confirmation' && pendingLocation && (
        <LocationConfirmation
          location={pendingLocation}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
