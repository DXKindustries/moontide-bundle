
import { toast } from 'sonner';
import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { persistCurrentLocation, clearCurrentLocation, persistStationCurrentLocation } from '@/utils/currentLocation';

import { normalizeStation, saveStationHistory } from "@/services/storage/locationHistory";

const NUMERIC_ID_RE = /^\d+$/;
import type { Station } from "@/services/tide/stationService";
interface LocationManagerProps {
  setCurrentLocation: (location: SavedLocation & { id: string; country: string } | null) => void;
  setShowLocationSelector: (show: boolean) => void;
  selectedState?: string;
}

const LocationManager = ({ setCurrentLocation, setShowLocationSelector, selectedState }: LocationManagerProps) => {
  const handleLocationChange = (location: SavedLocation) => {    if (!location.id || !NUMERIC_ID_RE.test(location.id)) {
      console.error('Invalid station ID');
      toast.error('Invalid station ID');
      return;
    }
    try {
      const normalized = normalizeStation({ stationId: location.id });
      const updatedLocation = {
        ...location,
        id: normalized.stationId,
        country: location.country || 'USA',
        name: location.name || normalized.stationName,
      };      setCurrentLocation(updatedLocation);
      persistCurrentLocation(updatedLocation);      setShowLocationSelector(false);
      toast.success(`Loading tide data for ${updatedLocation.name}`);
    } catch (error) {
      console.error('❌ LocationManager: Invalid station:', error);
      toast.error('Invalid station ID');
    }
  };

  const onSelectStation = (station: Station) => {    if (!station.id || !NUMERIC_ID_RE.test(String(station.id))) {
      console.error('Invalid station ID');
      toast.error('Invalid station ID');
      return;
    }
    const normalized = normalizeStation({ ...station, state: selectedState ?? station.state });
    try {
      persistStationCurrentLocation(normalized, selectedState);
      saveStationHistory(normalized);    } catch (error) {
      console.error('❌ LocationManager: Error saving station:', error);
    }
    setShowLocationSelector(false);
    toast.success(`Loading tide data for ${normalized.name}`);
  };

  const handleLocationClear = () => {    
    // Clear storage first
    try {
      clearCurrentLocation();
    } catch (error) {
      console.error('❌ LocationManager: Error clearing location:', error);
    }
    
    // Update state
    setCurrentLocation(null);  };

  const handleGetStarted = (location?: LocationData) => {
    if (location) {
      if (!location.stationId || !NUMERIC_ID_RE.test(location.stationId)) {
        console.error('Invalid station ID');
        toast.error('Invalid station ID');
        return;
      }
      const savedLocation: SavedLocation = {
        id: location.stationId,
        name: location.nickname || location.city,
        country: 'USA',
        zipCode: location.zipCode || '',
        cityState: `${location.city}, ${location.state}`,
        lat: location.lat ?? null,
        lng: location.lng ?? null,
      };

      handleLocationChange(savedLocation);
    } else {      setShowLocationSelector(true);
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
