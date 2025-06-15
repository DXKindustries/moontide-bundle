
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';

interface SavedLocationsListProps {
  onLocationSelect: (location: LocationData) => void;
  showEmpty?: boolean;
}

export default function SavedLocationsList({ onLocationSelect, showEmpty = false }: SavedLocationsListProps) {
  const locationHistory = locationStorage.getLocationHistory();
  const currentLocation = locationStorage.getCurrentLocation();

  const handleLocationClick = (location: LocationData): void => {
    onLocationSelect(location);
  };

  const formatTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (locationHistory.length === 0 && showEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved locations yet</p>
        <p className="text-xs">Add a location to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {locationHistory.map((location, index) => {
        const isCurrent = currentLocation?.zipCode === location.zipCode;
        
        return (
          <Button
            key={`${location.zipCode}-${index}`}
            variant={isCurrent ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3 text-left"
            onClick={() => handleLocationClick(location)}
          >
            <div className="flex items-start gap-3 w-full">
              <MapPin className={`h-4 w-4 mt-0.5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">
                    {location.city}, {location.state}
                  </div>
                  {isCurrent && (
                    <span className="text-xs text-primary font-medium ml-2">Current</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  ZIP: {location.zipCode}
                  {location.isManual && (
                    <span className="ml-2 text-blue-600">Manual</span>
                  )}
                </div>
                {location.timestamp && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(location.timestamp)}
                  </div>
                )}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
