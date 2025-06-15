
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Info, Search } from 'lucide-react';
import LocationEntryModal from './LocationEntryModal';
import { LocationData } from '@/types/locationTypes';
import { locationStorage } from '@/utils/locationStorage';

type OnboardingInfoProps = {
  onGetStarted: () => void;
};

const OnboardingInfo = ({ onGetStarted }: OnboardingInfoProps) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleEnterLocationClick = () => {
    console.log('Enter Your Location button clicked - opening modal');
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: LocationData) => {
    console.log('Location selected in modal:', location);
    
    // Save the location
    locationStorage.saveCurrentLocation(location);
    
    // Convert to the format expected by the parent component
    const savedLocation = {
      id: location.zipCode || location.city,
      name: location.city,
      country: 'USA',
      zipCode: location.zipCode,
      cityState: `${location.city}, ${location.state}`,
      lat: location.lat || 0,
      lng: location.lng || 0
    };
    
    // Close modal and trigger location change
    setShowLocationModal(false);
    onGetStarted();
  };

  const handleModalClose = () => {
    setShowLocationModal(false);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-xs bg-moon-primary/10 border border-moon-primary/20 py-3 px-3 rounded-lg">
          <Info className="h-3 w-3 text-moon-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="font-medium text-moon-primary">Welcome to MoonTide!</div>
            <div className="text-muted-foreground space-y-1">
              <div>• Enter a coastal ZIP code for tide data</div>
              <div>• Moon and solar data available for all locations</div>
              <div>• Track phases, tides, and fishing conditions</div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleEnterLocationClick}
          className="w-full bg-moon-primary hover:bg-moon-primary/90 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Enter Your Location
        </Button>
      </div>

      <LocationEntryModal
        isOpen={showLocationModal}
        onClose={handleModalClose}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
};

export default OnboardingInfo;
