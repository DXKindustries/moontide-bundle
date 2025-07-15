
import { toast } from 'sonner';
import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { persistCurrentLocation, clearCurrentLocation, persistStationCurrentLocation } from '@/utils/currentLocation';

import { normalizeStation, saveStationHistory } from "@/services/storage/locationHistory";
import type { Station } from "@/services/tide/stationService";
interface LocationManagerProps {
  setCurrentLocation: (location: SavedLocation & { id: string; country: string } | null) => void;
  setShowLocationSelector: (show: boolean) => void;
}

const LocationManager = ({ setCurrentLocation, setShowLocationSelector }: LocationManagerProps) => {
  const handleLocationChange = (location: SavedLocation) => {
    console.log('🔄 LocationManager: Location change requested:', location);
    try {
      const normalized = normalizeStation({ stationId: location.id });
      const updatedLocation = {
        ...location,
        id: normalized.stationId,
        country: location.country || 'USA',
        name: location.name || normalized.stationName,
      };
      console.log('🔄 LocationManager: Calling setCurrentLocation');
      setCurrentLocation(updatedLocation);
      persistCurrentLocation(updatedLocation);
      console.log('💾 LocationManager: Location saved successfully');
      setShowLocationSelector(false);
      toast.success(`Loading tide data for ${updatedLocation.name}`);
    } catch (error) {
      console.error('❌ LocationManager: Invalid station:', error);
      toast.error('Invalid station ID');
    }
  };

  const onSelectStation = (station: Station) => {
    console.log('🔄 LocationManager: Station selected:', station);
    const normalized = normalizeStation(station);
    try {
      persistStationCurrentLocation(normalized);
      saveStationHistory(normalized);
      console.log('💾 LocationManager: Station saved successfully');
    } catch (error) {
      console.error('❌ LocationManager: Error saving station:', error);
    }
    setShowLocationSelector(false);
    toast.success(`Loading tide data for ${normalized.name}`);
  };

  const handleLocationClear = () => {
    console.log('🔄 LocationManager: Clearing current location');
    
    // Clear storage first
    try {
      clearCurrentLocation();
    } catch (error) {
      console.error('❌ LocationManager: Error clearing location:', error);
    }
    
    // Update state
    setCurrentLocation(null);
    console.log('🔄 LocationManager: Location cleared');
  };

  const handleGetStarted = (location?: LocationData) => {
    console.log('🔄 LocationManager: handleGetStarted called with:', location);

    if (location) {
      const savedLocation: SavedLocation = {
        id: location.stationId || '',
        name: location.nickname || location.city,
        country: 'USA',
        zipCode: location.zipCode || '',
        cityState: `${location.city}, ${location.state}`,
        lat: location.lat ?? null,
        lng: location.lng ?? null,
      };

      handleLocationChange(savedLocation);
    } else {
      console.log('🔄 LocationManager: No location provided, showing selector');
      setShowLocationSelector(true);
    }
  };

  return {
    onSelectStation,
    handleLocationChange,
    handleLocationClear,
    handleGetStarted,
  };
};

export default LocationManager;
