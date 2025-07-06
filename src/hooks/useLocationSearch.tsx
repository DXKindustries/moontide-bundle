
import { useState } from 'react';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { getCoordinatesForCity } from '@/services/geocodingService';
import { LocationData } from '@/types/locationTypes';
import { parseLocationInput, ParsedInput } from '@/utils/locationInputParser';
import { getStationById, getStationsForLocationInput } from '@/services/locationService';
import { Station } from '@/services/tide/stationService';

interface UseLocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onStationSelect?: (station: Station) => void;
  onClose?: () => void;
}

export const useLocationSearch = ({ onLocationSelect, onStationSelect, onClose }: UseLocationSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);

  const handleLocationSearch = async (input: string) => {
    console.log('📝 handleLocationSearch input:', input);
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
    setStations([]);
    console.log('🔍 Parsed input:', parsed);

    try {
      let location: LocationData | null = null;

      if (parsed.type === 'zip') {
        location = await handleZipLookup(parsed);
      } else if (parsed.type === 'cityStateZip') {
        location = await handleCityStateZipLookup(parsed);
      } else if (parsed.type === 'cityState') {
        location = await handleCityStateLookup(parsed);
      } else if (parsed.type === 'stationId') {
        const station = await getStationById(parsed.stationId!);
        if (station) {
          onStationSelect?.(station);
          location = {
            zipCode: '',
            city: station.name,
            state: station.state || '',
            lat: station.latitude,
            lng: station.longitude,
            isManual: false,
            timestamp: Date.now(),
          };
        }
      } else if (parsed.type === 'stationName') {
        const results = await getStationsForLocationInput(parsed.stationName!);
        if (results.length === 1) {
          const station = results[0];
          onStationSelect?.(station);
          location = {
            zipCode: '',
            city: station.name,
            state: station.state || '',
            lat: station.latitude,
            lng: station.longitude,
            isManual: false,
            timestamp: Date.now(),
          };
        } else {
          setStations(results);
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
      }

      if (location) {
        onLocationSelect(location);
        if (!location.isManual) {
          toast.success(`Location saved: ${location.city}, ${location.state}`);
        }
        onClose?.();
      } else {
        toast.error('Location not found. Please check your input and try again.');
      }
    } catch (error) {
      console.error('🚨 Location search error:', error);
      toast.error('Unable to find location. Please try a different format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    console.log('🏷️ Looking up ZIP code:', parsed.zipCode);
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
      console.log('✅ ZIP lookup successful:', location);
      return location;
    }
    return null;
  };

  const handleCityStateZipLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    console.log('🏷️ Verifying city/state with ZIP:', parsed);
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
      console.log('✅ City/State/ZIP verification successful:', location);
      return location;
    }
    return null;
  };

  const handleCityStateLookup = async (parsed: ParsedInput): Promise<LocationData | null> => {
    console.log('🏙️ Attempting to geocode city/state:', parsed);
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
      console.log('✅ City/State geocoding successful:', location);
      return location;
    } else {
      // Fallback to manual entry (no coordinates)
      console.log('📝 Fallback to manual city/state entry:', parsed);
      const location = {
        zipCode: '',
        city: parsed.city!,
        state: parsed.state!,
        lat: null,
        lng: null,
        isManual: true,
        timestamp: Date.now()
      };
      console.log('✅ Manual location created:', location);
      toast.success(`Location saved: ${location.city}, ${location.state} (manual entry)`);
      return location;
    }
  };

  return {
    isLoading,
    handleLocationSearch,
    stations,
  };
};
