import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import ZipCodeInput from './ZipCodeInput';
import ManualLocationEntry from './ManualLocationEntry';
import LocationConfirmation from './LocationConfirmation';

type EntryMode = 'zip' | 'manual' | 'confirmation';

interface ZipCodeEntryProps {
  onLocationSelect: (location: LocationData) => void;
  onLocationClear?: () => void;
  onClose?: () => void;
  initialZip?: string;
  skipAutoLoad?: boolean;
}

type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip';
  zipCode?: string;
  city?: string;
  state?: string;
};

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
  const [currentInput, setCurrentInput] = useState(initialZip || '');
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

  // Parse different input formats
  const parseLocationInput = (input: string): ParsedInput | null => {
    const trimmed = input.trim();
    
    // ZIP code only (5 digits)
    if (/^\d{5}$/.test(trimmed)) {
      return { type: 'zip', zipCode: trimmed };
    }
    
    // City, State ZIP (e.g., "Newport, RI 02840")
    const cityStateZipMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})\s+(\d{5})$/);
    if (cityStateZipMatch) {
      return {
        type: 'cityStateZip',
        city: cityStateZipMatch[1].trim(),
        state: cityStateZipMatch[2].toUpperCase(),
        zipCode: cityStateZipMatch[3]
      };
    }
    
    // City, State (e.g., "Newport, RI")
    const cityStateMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})$/);
    if (cityStateMatch) {
      return {
        type: 'cityState',
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2].toUpperCase()
      };
    }
    
    return null;
  };

  const handleInputLookup = async (input: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setCurrentInput(input);

    console.log(`🔍 Looking up input: ${input}`);

    const parsed = parseLocationInput(input);
    
    if (!parsed) {
      setError('Please use format: ZIP, "City, ST", or "City, ST ZIP"');
      setMode('manual');
      setIsLoading(false);
      return;
    }

    try {
      let location: LocationData | null = null;

      if (parsed.type === 'zip') {
        // ZIP code lookup
        const result = await lookupZipCode(parsed.zipCode!);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          location = {
            zipCode: parsed.zipCode!,
            city: place['place name'],
            state: place.state,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false
          };
          console.log(`✅ ZIP lookup successful:`, location);
        }
      } else if (parsed.type === 'cityStateZip') {
        // Verify ZIP code and use provided city/state
        const result = await lookupZipCode(parsed.zipCode!);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          location = {
            zipCode: parsed.zipCode!,
            city: parsed.city!,
            state: parsed.state!,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false
          };
          console.log(`✅ City/State/ZIP verification successful:`, location);
        }
      } else if (parsed.type === 'cityState') {
        // Manual entry for city/state
        location = {
          zipCode: '',
          city: parsed.city!,
          state: parsed.state!,
          lat: null,
          lng: null,
          isManual: true
        };
        console.log(`✅ Manual city/state entry:`, location);
      }

      if (location) {
        setPendingLocation(location);
        setMode('confirmation');
        toast.success(`Found ${location.city}, ${location.state}`);
      } else {
        console.log(`❌ Lookup failed for input: ${input}`);
        setError(`Unable to find location. Please enter manually.`);
        setMode('manual');
      }
    } catch (err) {
      console.error(`💥 Lookup error:`, err);
      setError(`Unable to look up location. Please enter manually.`);
      setMode('manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = (): void => {
    console.log('🗑️ Clearing location from ZipCodeEntry');
    setMode('zip');
    setError(null);
    setCurrentInput('');
    setPendingLocation(null);
    
    // Clear the stored location
    locationStorage.clearCurrentLocation();
    
    // Notify parent component about the clear action
    if (onLocationClear) {
      console.log('🔄 Calling onLocationClear callback');
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
    setCurrentInput('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {mode === 'zip' && (
        <ZipCodeInput
          onZipSubmit={handleInputLookup}
          onClear={handleClear}
          isLoading={isLoading}
          error={error}
        />
      )}

      {mode === 'manual' && (
        <ManualLocationEntry
          zipCode={currentInput}
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
