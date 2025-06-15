
import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/utils/localStorage';
import LocationSearchInput from './LocationSearchInput';
import SavedLocationsList from './SavedLocationsList';

export interface SavedLocation {
  id?: string;         
  name: string;        
  country?: string;    
  zipCode: string;     
  cityState: string;   
  lat: number;
  lng: number;
}

const STORAGE_KEY = 'savedLocations';

export default function LocationSelector({
  onSelect,
}: {
  onSelect: (loc: SavedLocation) => void;
}) {
  const [saved, setSaved] = useState<SavedLocation[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------- load / persist ---------------- */
  useEffect(() => {
    console.log('🏠 Loading saved locations from storage...');
    try {
      const raw = safeLocalStorage.get(STORAGE_KEY);
      console.log('🏠 Raw data from storage:', raw);
      if (raw && Array.isArray(raw)) {
        // Filter out any default locations that might have been saved
        const validLocations = raw.filter(loc => loc.zipCode && loc.zipCode !== "default" && loc.zipCode !== "02882");
        setSaved(validLocations);
        console.log('✅ Successfully loaded saved locations:', validLocations);
      } else {
        console.log('📝 No saved locations found, starting with empty array');
        setSaved([]);
      }
    } catch (error) {
      console.error('❌ Error loading saved locations:', error);
      setSaved([]);
    }
  }, []);

  useEffect(() => {
    console.log('💾 Saving locations to storage:', saved);
    try {
      // Only save non-default locations
      const locationsToSave = saved.filter(loc => loc.zipCode && loc.zipCode !== "default" && loc.zipCode !== "02882");
      safeLocalStorage.set(STORAGE_KEY, locationsToSave);
      console.log('✅ Successfully saved locations to storage');
    } catch (error) {
      console.error('❌ Error saving locations to storage:', error);
    }
  }, [saved]);

  const handleLocationAdd = (location: SavedLocation) => {
    // Update saved locations first
    const newSaved = [...saved, location];
    console.log('📝 About to update saved locations state to:', newSaved);
    setSaved(newSaved);
    
    // Call onSelect to update the current location immediately
    onSelect(location);
    setIsOpen(false);
  };

  const handleLocationSelect = (loc: SavedLocation) => {
    onSelect(loc);
    setIsOpen(false);
  };

  const handleAddLocationClick = () => {
    console.log('🎯 Add location button clicked');
    if (search.trim()) {
      // This will be handled by the search input component
    } else {
      toast.error('Enter a ZIP code first');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
          <MapPin size={16} />
          Change
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-3">
        <LocationSearchInput
          search={search}
          setSearch={setSearch}
          onLocationAdd={handleLocationAdd}
          savedLocations={saved}
          onClose={() => setIsOpen(false)}
        />

        <SavedLocationsList
          savedLocations={saved}
          onLocationSelect={handleLocationSelect}
          onAddLocationClick={handleAddLocationClick}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
