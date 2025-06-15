import React, { useEffect, useState } from 'react';
import { MapPin, Search, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/utils/localStorage';
import { lookupZipCode, formatCityStateFromZip } from '@/utils/zipCodeLookup';

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

  /* ---------------- helpers ---------------- */
  const addLocation = async () => {
    console.log('🏁 addLocation triggered.');
    const zip = search.trim();
    console.log('🔍 Attempting to add location for ZIP:', zip);
    
    if (!/^\d{5}$/.test(zip)) {
      console.error('❌ Invalid ZIP format:', zip);
      toast.error('Enter a valid 5-digit U.S. ZIP');
      return;
    }

    try {
      console.log('🌐 Looking up ZIP code:', zip);
      const geo = await lookupZipCode(zip);
      console.log('📍 ZIP lookup result:', geo);
      
      if (!geo || !geo.places || geo.places.length === 0) {
        console.error('❌ ZIP not found in lookup service');
        toast.error('ZIP not found');
        return;
      }
      
      const cityState = `${geo.places[0]['place name']}, ${geo.places[0].state}`;
      console.log('🏙️ Formatted city/state:', cityState);
      
      // De-dup on zip
      if (saved.some(l => l.zipCode === zip)) {
        console.log('⚠️ ZIP already exists in saved locations');
        toast.info('ZIP already saved');
        setSearch('');
        setIsOpen(false);
        return;
      }

      const loc: SavedLocation = {
        id: zip, // Use ZIP as ID
        name: geo.places[0]['place name'],
        country: 'USA',
        zipCode: zip,
        cityState,
        lat: parseFloat(geo.places[0].latitude),
        lng: parseFloat(geo.places[0].longitude),
      };
      
      console.log('✅ Created location object:', loc);
      
      // Update saved locations first
      const newSaved = [...saved, loc];
      console.log('📝 About to update saved locations state to:', newSaved);
      setSaved(newSaved);
      
      // Clear search and close dropdown
      setSearch('');
      setIsOpen(false);
      
      // Call onSelect to update the current location immediately
      console.log('📢 Calling onSelect with location:', loc);
      onSelect(loc);
      
      toast.success(`Added ${cityState}`);
    } catch (err) {
      console.error('💥 Error in addLocation:', err);
      toast.error('ZIP not found');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log(`⌨️ Key pressed in location input: ${e.key}`);
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('🎯 Enter key detected, calling addLocation');
      addLocation();
    }
  };

  const handleLocationSelect = (loc: SavedLocation) => {
    console.log('🎯 Selected saved location:', loc);
    onSelect(loc);
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

      <DropdownMenuContent className="w-64 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter ZIP code…"
            maxLength={5}
          />
          <button
            className="p-2 rounded bg-primary text-white"
            onClick={addLocation}
          >
            <Search size={16} />
          </button>
        </div>

        {saved.length === 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            No saved locations yet. Add one above.
          </p>
        )}

        {saved.map(loc => (
          <button
            key={loc.zipCode}
            className="flex w-full justify-between items-center px-2 py-1 rounded hover:bg-muted-foreground/10 text-left text-sm"
            onClick={() => handleLocationSelect(loc)}
          >
            {loc.cityState} <span className="opacity-60">({loc.zipCode})</span>
          </button>
        ))}

        <div className="mt-2 border-t pt-2">
          <button
            onClick={() => {
              setSearch('');
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus size={12} /> Add location
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
