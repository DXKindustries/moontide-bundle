
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
  const handleLocationChange = (location: SavedLocation) => {
    if (!location.id || !NUMERIC_ID_RE.test(location.id)) {
      
      toast.error('Invalid station ID');
      return;
    }
    const normalized = normalizeStation({ stationId: location.id });
    const updatedLocation = {
      ...location,
      id: normalized.stationId,
      country: location.country || 'USA',
      name: location.name || normalized.stationName,
    };
    setCurrentLocation(updatedLocation);
    persistCurrentLocation(updatedLocation);
    setShowLocationSelector(false);
    toast.success(`Loading tide data for ${updatedLocation.name}`);
  };

  const onSelectStation = (station: Station) => {
    if (!station.id || !NUMERIC_ID_RE.test(String(station.id))) {
      
      toast.error('Invalid station ID');
      return;
    }
    const normalized = normalizeStation({ ...station, state: selectedState ?? station.state });
    persistStationCurrentLocation(normalized, selectedState);
    saveStationHistory(normalized);
    setShowLocationSelector(false);
    toast.success(`Loading tide data for ${normalized.name}`);
  };

  const handleLocationClear = () => {
    
    // Clear storage first
    clearCurrentLocation();
    
    // Update state
    setCurrentLocation(null);
  };

  const handleGetStarted = (location?: LocationData) => {

    if (location) {
      if (!location.stationId || !NUMERIC_ID_RE.test(location.stationId)) {
        
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
    } else {
      
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
