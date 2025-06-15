import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import ZipCodeEntry from './ZipCodeEntry';

// Keep the SavedLocation interface for backward compatibility
export interface SavedLocation {
  id?: string;         
  name: string;        
  country?: string;    
  zipCode: string;     
  cityState: string;   
  lat: number;
  lng: number;
}

export default function LocationSelector({
  onSelect,
}: {
  onSelect: (loc: SavedLocation) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationSelect = (location: LocationData): void => {
    console.log('📍 New location selected via ZipCodeEntry:', location);
    
    // Convert LocationData to SavedLocation format for compatibility
    const savedLocation: SavedLocation = {
      id: location.zipCode,
      name: location.city,
      country: 'USA',
      zipCode: location.zipCode,
      cityState: `${location.city}, ${location.state}`,
      lat: location.lat || 0,
      lng: location.lng || 0
    };

    onSelect(savedLocation);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
          <MapPin size={16} />
          Change
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0">
        <ZipCodeEntry
          onLocationSelect={handleLocationSelect}
          onClose={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
