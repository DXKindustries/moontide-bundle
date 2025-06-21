
import { toast } from 'sonner';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';

const CURRENT_LOCATION_KEY = 'moontide-current-location';

interface LocationManagerProps {
  setCurrentLocation: (location: SavedLocation & { id: string; country: string } | null) => void;
  setShowLocationSelector: (show: boolean) => void;
}

export const useLocationManager = ({ setCurrentLocation, setShowLocationSelector }: LocationManagerProps) => {
  const handleLocationChange = (location: SavedLocation) => {
    console.log('🔄 LocationManager: Location change requested:', location);
    const updatedLocation = {
      ...location,
      id: location.id || location.zipCode || "temp",
      country: location.country || "USA",
      name: location.name || `${location.zipCode || "Unknown Location"}`
    };
    console.log('🔄 LocationManager: Updated location object:', updatedLocation);
    
    // Update state first
    console.log('🔄 LocationManager: Calling setCurrentLocation with updated location');
    setCurrentLocation(updatedLocation);
    console.log('🔄 LocationManager: setCurrentLocation called - state should update');
    
    // Save to both storage systems for backward compatibility
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, updatedLocation);
      
      // Also save to new location storage system
      const locationData: LocationData = {
        zipCode: updatedLocation.zipCode,
        city: updatedLocation.name,
        state: updatedLocation.cityState.split(', ')[1] || 'Unknown',
        lat: updatedLocation.lat,
        lng: updatedLocation.lng,
        isManual: false,
        nickname: updatedLocation.name
      };
      locationStorage.saveCurrentLocation(locationData);
      
      console.log('💾 LocationManager: Successfully saved updated location to both storage systems');
    } catch (error) {
      console.error('❌ LocationManager: Error saving location to localStorage:', error);
    }
    
    // Close the location selector if it was opened from onboarding
    setShowLocationSelector(false);
    
    toast.success(`Loading tide data for ${updatedLocation.name}`);
  };

  const handleLocationClear = () => {
    console.log('🔄 LocationManager: Clearing current location');
    
    // Clear from both storage systems first
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, null);
      locationStorage.clearCurrentLocation();
      console.log('💾 LocationManager: Successfully cleared location from both storage systems');
    } catch (error) {
      console.error('❌ LocationManager: Error clearing location from localStorage:', error);
    }
    
    // IMPORTANT: Update the component state to null to trigger re-render
    console.log('🔄 LocationManager: About to call setCurrentLocation(null)');
    setCurrentLocation(null);
    console.log('🔄 LocationManager: Component state updated to null - onboarding should now show');
    
    // Force a small delay to ensure state propagation
    setTimeout(() => {
      console.log('🔄 LocationManager: Delayed check - location should be null now');
    }, 100);
  };

  const handleGetStarted = (location?: LocationData) => {
    console.log('🔄 LocationManager: handleGetStarted called with location:', location);
    
    if (location) {
      // Convert LocationData to SavedLocation format and update current location
      const savedLocation: SavedLocation = {
        id: location.zipCode,
        name: location.nickname || location.city,
        country: "USA",
        zipCode: location.zipCode,
        cityState: `${location.city}, ${location.state}`,
        lat: location.lat || 0,
        lng: location.lng || 0
      };
      
      console.log('🔄 LocationManager: Converting LocationData to SavedLocation and updating state:', savedLocation);
      handleLocationChange(savedLocation);
      console.log('🔄 LocationManager: handleLocationChange called - onboarding should now hide');
    } else {
      // No location provided, just show the location selector
      console.log('🔄 LocationManager: No location provided, showing location selector');
      setShowLocationSelector(true);
    }
  };

  return {
    handleLocationChange,
    handleLocationClear,
    handleGetStarted
  };
};
