
import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import EnhancedLocationInput from './EnhancedLocationInput';
import SavedLocationsList from './SavedLocationsList';

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
  const [showAddNew, setShowAddNew] = useState(false);

  const handleLocationSelect = (location: LocationData): void => {
    console.log('📍 New location selected via EnhancedLocationInput:', location);
    
    // Convert LocationData to SavedLocation format for compatibility
    const savedLocation: SavedLocation = {
      id: location.zipCode || location.city,
      name: location.nickname || location.city,
      country: 'USA',
      zipCode: location.zipCode,
      cityState: `${location.city}, ${location.state}`,
      lat: location.lat || 0,
      lng: location.lng || 0
    };

    onSelect(savedLocation);
    setIsOpen(false);
    setShowAddNew(false);
  };

  const handleSavedLocationSelect = (location: LocationData): void => {
    console.log('📍 Saved location selected:', location);
    
    // Convert LocationData to SavedLocation format for compatibility
    const savedLocation: SavedLocation = {
      id: location.zipCode || location.city,
      name: location.nickname || location.city,
      country: 'USA',
      zipCode: location.zipCode,
      cityState: `${location.city}, ${location.state}`,
      lat: location.lat || 0,
      lng: location.lng || 0
    };

    onSelect(savedLocation);
    setIsOpen(false);
  };

  const handleAddNewClick = (): void => {
    setShowAddNew(true);
  };

  const handleBackToList = (): void => {
    setShowAddNew(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
          <MapPin size={16} />
          Change
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0 bg-background border shadow-lg z-50">
        {showAddNew ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
                className="text-sm"
              >
                ← Back
              </Button>
              <span className="text-sm font-medium">Add New Location</span>
            </div>
            <EnhancedLocationInput
              onLocationSelect={handleLocationSelect}
              onClose={() => setIsOpen(false)}
            />
          </div>
        ) : (
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
