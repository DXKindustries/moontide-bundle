
import React from 'react';
import { MapPin } from "lucide-react";
import { SavedLocation } from './LocationSelector';

interface LocationDisplayProps {
  currentLocation: SavedLocation & { id: string; country: string } | null;
  stationName: string | null;
}

export default function LocationDisplay({ currentLocation, stationName }: LocationDisplayProps) {
  const formatLocationDisplay = () => {
    if (!currentLocation) return "Select a location";
    if ((currentLocation as any).id === "default") return "Select a location";
    if ((currentLocation as any).zipCode) {
      return `${currentLocation.name} (${(currentLocation as any).zipCode})`;
    }
    if (currentLocation.name && (currentLocation as any).country) {
      return `${currentLocation.name}, ${(currentLocation as any).country}`;
    }
    return currentLocation.name || "Select a location";
  };

  return (
    <div className="flex flex-col bg-muted/70 backdrop-blur-sm py-2 px-3 rounded-lg gap-1 mr-2">
      <div className="flex items-center gap-1">
        <MapPin size={16} className="text-moon-primary" />
        <span className="text-sm font-medium">
          {formatLocationDisplay()}
        </span>
      </div>
      {/* Station name under ZIP */}
      <div className="text-xs text-muted-foreground pl-5">
        Tide data from NOAA station: <span className="font-medium">{stationName || "N/A"}</span>
      </div>
    </div>
  );
}
