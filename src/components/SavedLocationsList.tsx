
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { locationStorage } from '@/utils/locationStorage';
import { clearCurrentLocation } from '@/utils/currentLocation';
import { clearLocationHistory } from '@/services/storage/locationHistory';
import { safeLocalStorage } from '@/utils/localStorage';
import { useLocationState } from '@/hooks/useLocationState';
import { LocationData } from '@/types/locationTypes';
import type { SavedLocation } from './LocationSelector';
import { toast } from 'sonner';

interface SavedLocationsListProps {
  onLocationSelect: (location: LocationData) => void;
  showEmpty?: boolean;
}

export default function SavedLocationsList({ onLocationSelect, showEmpty = false }: SavedLocationsListProps) {
  const [locationHistory, setLocationHistory] = useState(locationStorage.getLocationHistory());
  const [deletingLocation, setDeletingLocation] = useState<LocationData | null>(null);
  const { currentLocation, setCurrentLocation, setSelectedStation } = useLocationState();

  useEffect(() => {
    // Refresh list when the current location changes, ensuring newly added
    // stations appear immediately in the menu.
    setLocationHistory(locationStorage.getLocationHistory());
  }, [currentLocation]);

  const handleLocationClick = (location: LocationData): void => {
    onLocationSelect(location);
  };

  const handleDeleteLocation = (location: LocationData, event: React.MouseEvent): void => {
    event.stopPropagation();
    setDeletingLocation(location);
  };

  const handleConfirmDelete = (): void => {
    if (deletingLocation) {
      console.log('🗑️ Deleting location:', deletingLocation);
      locationStorage.deleteLocation(deletingLocation);
      const updated = locationStorage.getLocationHistory();
      setLocationHistory(updated);
      setDeletingLocation(null);
      toast.success('Location deleted');
      const normalize = (val?: string) => (val || '').trim().toLowerCase();
      const deletedIsCurrent = currentLocation &&
        ((deletingLocation.zipCode && currentLocation.zipCode && normalize(deletingLocation.zipCode) === normalize(currentLocation.zipCode)) ||
         (normalize(deletingLocation.city) === normalize(currentLocation.city) &&
          normalize(deletingLocation.state) === normalize(currentLocation.state)));

      if (deletedIsCurrent) {
        clearCurrentLocation();
        safeLocalStorage.set('moontide-current-station', null);
        setCurrentLocation(null);
        setSelectedStation(null);
      }

      if (updated.length === 0) {
        clearLocationHistory();
      }
    }
  };

  const toLocationData = (
    loc: SavedLocation & { id: string; country: string },
  ): LocationData => {
    const [city, state] = loc.cityState.split(',').map((p) => p.trim());
    return {
      zipCode: loc.zipCode,
      city: city || '',
      state: state || '',
      lat: loc.lat,
      lng: loc.lng,
      stationId: loc.id,
      stationName: loc.name,
      isManual: false,
      nickname: loc.name !== city ? loc.name : undefined,
    };
  };

  const filteredHistory = useMemo(() => {
    const seen = new Set<string>();
    return locationHistory.filter((h) => {
      if (!h.stationId) return false;
      if (currentLocation?.id === h.stationId) return false;
      if (seen.has(h.stationId)) return false;
      seen.add(h.stationId);
      return true;
    });
  }, [locationHistory, currentLocation]);

  const currentLocData = useMemo(
    () => (currentLocation ? toLocationData(currentLocation) : null),
    [currentLocation],
  );

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

  const getLocationDisplayName = (location: LocationData | null): string => {
    if (!location) return 'Unknown Location';
    if (location.nickname) return location.nickname;
    return `${location.city}, ${location.state}`;
  };

  const getLocationSubtext = (location: LocationData): string => {
    let subtext = '';
    if (location.zipCode) {
      subtext = `ZIP: ${location.zipCode}`;
    } else {
      subtext = `${location.city}, ${location.state}`;
    }
    
    if (location.isManual) {
      subtext += ' • Manual';
    }
    
    return subtext;
  };

  if (!currentLocData && filteredHistory.length === 0 && showEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved locations yet</p>
        <p className="text-xs">Add a location to get started</p>
      </div>
    );
  }

  return (
    <>
      {currentLocData && (
        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Current Location</div>
          <div
            className="w-full justify-start h-auto p-3 text-left border rounded-lg cursor-pointer transition-colors bg-secondary border-primary/20"
            onClick={() => handleLocationClick(currentLocData)}
          >
            <div className="flex items-start gap-3 w-full">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">
                    {getLocationDisplayName(currentLocData)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getLocationSubtext(currentLocData)}
                </div>
                {currentLocData.timestamp && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(currentLocData.timestamp)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {filteredHistory.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Location History</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredHistory.map((location, index) => (
              <div
                key={`${location.stationId}-${index}`}
                className="w-full justify-start h-auto p-3 text-left border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent"
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex items-start gap-3 w-full">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">
                        {getLocationDisplayName(location)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteLocation(location, e)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getLocationSubtext(location)}
                    </div>
                    {location.timestamp && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(location.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <AlertDialog open={!!deletingLocation} onOpenChange={() => setDeletingLocation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{getLocationDisplayName(deletingLocation)}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
