
import { toast } from 'sonner';
import { SavedLocation } from '@/components/LocationSelector';
import { LocationData } from '@/types/locationTypes';
import { persistCurrentLocation, clearCurrentLocation } from '@/utils/currentLocation';

interface LocationManagerProps {
  setCurrentLocation: (location: SavedLocation & { id: string; country: string } | null) => void;
  setShowLocationSelector: (show: boolean) => void;
}

const LocationManager = ({ setCurrentLocation, setShowLocationSelector }: LocationManagerProps) => {
  const handleLocationChange = (location: SavedLocation) => {
    console.log('🔄 LocationManager: Location change requested:', location);
    
    const updatedLocation = {
      ...location,
      id: location.id || location.zipCode || "temp",
      country: location.country || "USA",
      name: location.name || `${location.zipCode || "Unknown Location"}`
    };
    
    console.log('🔄 LocationManager: Calling setCurrentLocation');
    setCurrentLocation(updatedLocation);
    
    // Save to storage
    try {
      persistCurrentLocation(updatedLocation);
      console.log('💾 LocationManager: Location saved successfully');
    } catch (error) {
      console.error('❌ LocationManager: Error saving location:', error);
    }
    
    setShowLocationSelector(false);
    toast.success(`Loading tide data for ${updatedLocation.name}`);
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
        id: location.zipCode || location.city,
        name: location.nickname || location.city,
        country: "USA",
        zipCode: location.zipCode || '',
        cityState: `${location.city}, ${location.state}`,
        lat: location.lat ?? null,
        lng: location.lng ?? null
      };
      
      console.log('🔄 LocationManager: Converting and setting location');
      handleLocationChange(savedLocation);
    } else {
      console.log('🔄 LocationManager: No location provided, showing selector');
      setShowLocationSelector(true);
    }
  };

  return {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted,
  };
};

export default LocationManager;
