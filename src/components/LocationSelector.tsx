
import React, { useState, useEffect } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LocationData } from '@/types/locationTypes';
import SavedLocationsList from './SavedLocationsList';
import { Station } from '@/services/tide/stationService';
import { useNavigate } from 'react-router-dom';

// Keep the SavedLocation interface for backward compatibility
export interface SavedLocation {
  id?: string;
  name: string;
  country?: string;
  zipCode: string;
  cityState: string;
  lat: number | null;
  lng: number | null;
}

export default function LocationSelector({
  onSelect,
  onLocationClear,
  forceOpen,
  onClose,
  onStationSelect,
  triggerContent
}: {
  onSelect: (loc: SavedLocation) => void;
  onLocationClear?: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
  onStationSelect?: (station: Station) => void;
  triggerContent?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle forceOpen prop
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
    }
  };

  const navigate = useNavigate();

  const handleSavedLocationSelect = (location: LocationData): void => {
    console.log('📍 Saved location selected:', location);
    
    // Convert LocationData to SavedLocation format for compatibility
    const savedLocation: SavedLocation = {
      id: location.zipCode || location.city,
      name: location.nickname || location.city,
      country: 'USA',
      zipCode: location.zipCode,
      cityState: `${location.city}, ${location.state}`,
      lat: location.lat ?? null,
      lng: location.lng ?? null
    };

    onSelect(savedLocation);

    if (location.stationId && onStationSelect) {
      const station: Station = {
        id: location.stationId,
        name: location.stationName || location.city,
        latitude: location.lat ?? 0,
        longitude: location.lng ?? 0,
        state: location.state,
        city: location.city
      };
      onStationSelect(station);
    }
    setIsOpen(false);
  };

  const handleAddNewClick = (): void => {
    setIsOpen(false);
    navigate('/location-onboarding-step1');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
          {triggerContent ?? (
            <>
              <MapPin size={16} />
              Change
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[90vw] max-w-md p-0 bg-background border shadow-lg z-50 sm:w-80">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Select Location</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNewClick}
              className="flex items-center gap-1"
            >
              <Plus size={14} />
              Add New
            </Button>
          </div>
          <SavedLocationsList
            onLocationSelect={handleSavedLocationSelect}
            showEmpty={true}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
