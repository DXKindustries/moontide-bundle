
import { useState } from 'react';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { getCoordinatesForCity } from '@/services/geocodingService';
import { LocationData } from '@/types/locationTypes';
import { parseLocationInput, ParsedInput } from '@/utils/locationInputParser';
import { getStationById } from '@/services/locationService';
import { Station } from '@/services/tide/stationService';
import { persistStationCurrentLocation } from '@/utils/currentLocation';
import { debugLog } from '@/utils/debugLogger';

interface UseLocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onStationSelect?: (station: Station) => void;
  onClose?: () => void;
}

export const useLocationSearch = ({ onLocationSelect, onStationSelect, onClose }: UseLocationSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSearch = async (input: string) => {
    if (!input.trim()) {
      toast.error('Please enter a location');
      return;
    }

    const parsed = parseLocationInput(input);
    
    if (!parsed) {
      toast.error('Use ZIP, "City ST", "City ST ZIP", NOAA station name or ID');
      return;
    }

    setIsLoading(true);
    debugLog('Parsed location input', parsed);

    try {
      let location: LocationData | null = null;

      if (parsed.type === 'zip') {
        location = await handleZipLookup(parsed);
      } else if (parsed.type === 'cityStateZip') {
        location = await handleCityStateZipLookup(parsed);
      } else if (parsed.type === 'cityState') {
        location = await handleCityStateLookup(parsed);
      } else if (parsed.type === 'stationId') {
        debugLog('Station ID detected, fetching station', parsed.stationId);
        const station = await getStationById(parsed.stationId!);
        console.log('Fetched station object:', station);
        if (station) {
          persistStationCurrentLocation(station);
          onStationSelect?.(station);
          toast.success(`Using station ${station.name}`);
          onClose?.();
          return; // station handler sets current location
        } else {
          console.error('Station object is undefined, not saving.');
        }
      } else if (parsed.type === 'stationName') {
        location = {
          zipCode: '',
          city: parsed.stationName!,
          state: '',
          lat: null,
          lng: null,
          isManual: true,
          timestamp: Date.now(),
        };
        toast.success(`Location saved: ${parsed.stationName} (manual entry)`);
      }

      if (location) {
        debugLog('Location search resolved', location);
        onLocationSelect(location);
        if (!location.isManual) {
          toast.success(`Location saved: ${location.city}, ${location.state}`);
        }
        onClose?.();
      } else {
        debugLog('Location search returned no result');
        toast.error('Location not found. Please check your input and try again.');
      }
    } catch (error) {
      debugLog('Location search error', error);
      toast.error('Unable to find location. Please try a different format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    debugLog('Looking up ZIP code', parsed.zipCode);
    const result = await lookupZipCode(parsed.zipCode!);
    if (result && result.places && result.places.length > 0) {
      const place = result.places[0];
      const stateAbbr = place['state abbreviation'] || place.state;
      const location = {
        zipCode: parsed.zipCode!,
        city: place['place name'],
        state: stateAbbr,
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
        isManual: false,
        timestamp: Date.now()
      };
      debugLog('ZIP lookup successful', location);
      return location;
    }
    return null;
  };

  const handleCityStateZipLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    debugLog('Verifying city/state with ZIP', parsed);
    const result = await lookupZipCode(parsed.zipCode!);
    if (result && result.places && result.places.length > 0) {
      const place = result.places[0];
      const location = {
        zipCode: parsed.zipCode!,
        city: parsed.city!,
        state: parsed.state!,
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
        isManual: false,
        timestamp: Date.now()
      };
      debugLog('City/State/ZIP verification successful', location);
      return location;
    }
    return null;
  };

  const handleCityStateLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    debugLog('Attempting to geocode city/state', parsed);
    const geocodeResult = await getCoordinatesForCity(parsed.city!, parsed.state!);
    
    if (geocodeResult) {
      const location = {
        zipCode: '',
        city: parsed.city!,
        state: parsed.state!,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        isManual: false,
        timestamp: Date.now()
      };
      debugLog('City/State geocoding successful', location);
      return location;
    } else {
      // Fallback to manual entry (no coordinates)
      debugLog('Fallback to manual city/state entry', parsed);
      const location = {
        zipCode: '',
        city: parsed.city!,
        state: parsed.state!,
        lat: null,
        lng: null,
        isManual: true,
        timestamp: Date.now()
      };
      debugLog('Manual location created', location);
      toast.success(`Location saved: ${location.city}, ${location.state} (manual entry)`);
      return location;
    }
  };

  return {
    isLoading,
    handleLocationSearch
  };
};
