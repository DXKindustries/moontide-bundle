
import React from 'react';
import { MapPin } from "lucide-react";
import { SavedLocation } from './LocationSelector';

interface LocationDisplayProps {
  currentLocation: SavedLocation & { id: string; country: string } | null;
  stationName: string | null;
  stationId?: string | null;
  hasError?: boolean; // Add this prop to detect tide data errors
}

export default function LocationDisplay({ currentLocation, stationName, stationId, hasError }: LocationDisplayProps) {
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

  // Don't show station info if no location is selected
  if (!currentLocation) {
    return (
      <div className="flex flex-col bg-muted/70 backdrop-blur-sm py-2 px-3 rounded-lg gap-1 mr-2">
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-moon-primary" />
          <span className="text-sm font-medium">
            Select a location
          </span>
        </div>
        <div className="text-xs text-muted-foreground pl-5">
          Enter a ZIP code to get started
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-muted/70 backdrop-blur-sm py-2 px-3 rounded-lg gap-1 mr-2">
      <div className="flex items-center gap-1">
        <MapPin size={16} className="text-moon-primary" />
        <span className="text-sm font-medium">
          {formatLocationDisplay()}
        </span>
      </div>
      {/* Station name under ZIP - show helpful message if there's an error even with a station */}
      <div className="text-xs text-muted-foreground pl-5">
        {stationName && !hasError ? (
          <>Tide data from NOAA station: <span className="font-medium">{stationName}</span>{stationId ? ` (ID: ${stationId})` : ''}</>
        ) : (
          <>No tide data available - this may be a non-coastal area. Try a coastal ZIP code for tide information.</>
        )}
      </div>
    </div>
  );
}
