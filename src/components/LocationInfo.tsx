
import React from 'react';
import { MapPin } from 'lucide-react';
import { SavedLocation } from './LocationSelector';

type LocationInfoProps = {
  currentLocation: (SavedLocation & { id: string; country: string }) | null;
  stationName: string | null;
  stationId: string | null;
  error: string | null;
};

const LocationInfo = ({ currentLocation, stationName, stationId, error }: LocationInfoProps) => {
  const formatLocationDisplay = () => {
    if (!currentLocation) return "Select a location";
    
    if (currentLocation.zipCode) {
      return `${currentLocation.name} (${currentLocation.zipCode})`;
    }
    if (currentLocation.name && currentLocation.country) {
      return `${currentLocation.name}, ${currentLocation.country}`;
    }
    return currentLocation.name || "Select a location";
  };

  return (
    <div className="flex items-start gap-2 text-xs bg-muted/30 backdrop-blur-sm py-2 px-3 rounded-lg">
      <MapPin size={12} className="text-moon-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {formatLocationDisplay()}
        </div>
        <div className="text-muted-foreground mt-1">
          {error ? (
            <>No tide data available for the selected station.</>
          ) : stationName ? (
            <>NOAA station: <span className="font-medium">{stationName}</span>{stationId ? ` (ID: ${stationId})` : ''}</>
          ) : (
            <>Select a tide station to view data.</>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
