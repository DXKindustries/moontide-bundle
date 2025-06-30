
import React, { useState } from 'react';
import { MapPin, Clock, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import LocationEditModal from './LocationEditModal';
import { toast } from 'sonner';

interface SavedLocationsListProps {
  onLocationSelect: (location: LocationData) => void;
  showEmpty?: boolean;
}

export default function SavedLocationsList({ onLocationSelect, showEmpty = false }: SavedLocationsListProps) {
  const [locationHistory, setLocationHistory] = useState(locationStorage.getLocationHistory());
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<LocationData | null>(null);
  const currentLocation = locationStorage.getCurrentLocation();

  const handleLocationClick = (location: LocationData): void => {
    onLocationSelect(location);
  };

  const handleEditLocation = (location: LocationData, event: React.MouseEvent): void => {
    event.stopPropagation();
    setEditingLocation(location);
  };

  const handleDeleteLocation = (location: LocationData, event: React.MouseEvent): void => {
    event.stopPropagation();
    setDeletingLocation(location);
  };

  const handleSaveEdit = (updatedLocation: LocationData): void => {
    console.log('📝 Updating location:', updatedLocation);
    locationStorage.updateLocation(updatedLocation);
    setLocationHistory(locationStorage.getLocationHistory());
    toast.success('Location updated successfully');
  };

  const handleConfirmDelete = (): void => {
    if (deletingLocation) {
      console.log('🗑️ Deleting location:', deletingLocation);
      locationStorage.deleteLocation(deletingLocation);
      setLocationHistory(locationStorage.getLocationHistory());
      setDeletingLocation(null);
      toast.success('Location deleted');
    }
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
    <>
      <ScrollArea className="max-h-64">
        <div className="space-y-2">
        {locationHistory.map((location, index) => {
          const isCurrent = currentLocation?.zipCode === location.zipCode || 
                           (currentLocation?.city === location.city && currentLocation?.state === location.state);
          
          return (
            <div
              key={`${location.zipCode || location.city}-${index}`}
              className={`w-full justify-start h-auto p-3 text-left border rounded-lg cursor-pointer transition-colors ${
                isCurrent ? 'bg-secondary border-primary/20' : 'border-border hover:bg-accent'
              }`}
              onClick={() => handleLocationClick(location)}
            >
              <div className="flex items-start gap-3 w-full">
                <MapPin className={`h-4 w-4 mt-0.5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">
                      {getLocationDisplayName(location)}
                    </div>
                    <div className="flex items-center gap-1">
                      {isCurrent && (
                        <span className="text-xs text-primary font-medium">Current</span>
                      )}
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
                          <DropdownMenuItem onClick={(e) => handleEditLocation(location, e)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
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
          );
        })}
        </div>
      </ScrollArea>

      {editingLocation && (
        <LocationEditModal
          location={editingLocation}
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onSave={handleSaveEdit}
        />
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
