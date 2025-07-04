
import { useState } from 'react';
import { toast } from 'sonner';
import { LocationData } from '@/types/locationTypes';

interface UseGPSLocationProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
}

export const useGPSLocation = ({ onLocationSelect, onClose }: UseGPSLocationProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGPSRequest = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const location: LocationData = {
            zipCode: '',
            city: 'GPS Location',
            state: 'Current',
            lat: latitude,
            lng: longitude,
            isManual: false,
            timestamp: Date.now()
          };

          onLocationSelect(location);
          toast.success('GPS location captured');
          onClose?.();
        } catch (error) {
          toast.error('Error processing GPS location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast.error('Unable to get GPS location. Please check permissions.');
      },
      { timeout: 10000 }
    );
  };

  return {
    isLoading,
    handleGPSRequest
  };
};
