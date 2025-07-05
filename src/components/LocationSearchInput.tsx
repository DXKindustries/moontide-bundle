
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { SavedLocation } from './LocationSelector';

interface LocationSearchInputProps {
  search: string;
  setSearch: (value: string) => void;
  onLocationAdd: (location: SavedLocation) => void;
  savedLocations: SavedLocation[];
  onClose: () => void;
}

type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip';
  zipCode?: string;
  city?: string;
  state?: string;
};

export default function LocationSearchInput({
  search,
  setSearch,
  onLocationAdd,
  savedLocations,
  onClose
}: LocationSearchInputProps) {

  // Parse different input formats
  const parseLocationInput = (input: string): ParsedInput | null => {
    const trimmed = input.trim();
    
    // ZIP code only (5 digits)
    if (/^\d{5}$/.test(trimmed)) {
      return { type: 'zip', zipCode: trimmed };
    }
    
    // City, State ZIP (e.g., "Newport, RI 02840")
    const cityStateZipMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})\s+(\d{5})$/);
    if (cityStateZipMatch) {
      return {
        type: 'cityStateZip',
        city: cityStateZipMatch[1].trim(),
        state: cityStateZipMatch[2].toUpperCase(),
        zipCode: cityStateZipMatch[3]
      };
    }
    
    // City, State (e.g., "Newport, RI")
    const cityStateMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})$/);
    if (cityStateMatch) {
      return {
        type: 'cityState',
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2].toUpperCase()
      };
    }
    
    return null;
  };

  const addLocation = async () => {
    console.log('🏁 addLocation triggered.');
    const input = search.trim();
    console.log('🔍 Attempting to add location for input:', input);
    
    const parsed = parseLocationInput(input);
    
    if (!parsed) {
      console.error('❌ Invalid input format:', input);
      toast.error('Use format: ZIP, "City, ST", or "City, ST ZIP"');
      return;
    }

    try {
      let location: SavedLocation | null = null;

      if (parsed.type === 'zip') {
        // ZIP code lookup
        console.log('🌐 Looking up ZIP code:', parsed.zipCode);
        const geo = await lookupZipCode(parsed.zipCode!);
        console.log('📍 ZIP lookup result:', geo);
        
        if (!geo || !geo.places || geo.places.length === 0) {
          console.error('❌ ZIP not found in lookup service');
          toast.error('ZIP code not found. Please check and try again.');
          return;
        }
        
        const cityState = `${geo.places[0]['place name']}, ${geo.places[0].state}`;
        
        // De-dup on zip
        if (savedLocations.some(l => l.zipCode === parsed.zipCode)) {
          console.log('⚠️ ZIP already exists in saved locations');
          toast.info('ZIP already saved');
          setSearch('');
          onClose();
          return;
        }

        location = {
          id: parsed.zipCode!,
          name: geo.places[0]['place name'],
          country: 'USA',
          zipCode: parsed.zipCode!,
          cityState,
          lat: parseFloat(geo.places[0].latitude),
          lng: parseFloat(geo.places[0].longitude),
        };
      } else if (parsed.type === 'cityStateZip') {
        // Verify ZIP code and use provided city/state
        console.log('🌐 Verifying ZIP code for city/state:', parsed);
        const geo = await lookupZipCode(parsed.zipCode!);
        
        if (!geo || !geo.places || geo.places.length === 0) {
          console.error('❌ ZIP not found in lookup service');
          toast.error('ZIP code not found. Please check and try again.');
          return;
        }

        const cityState = `${parsed.city}, ${parsed.state}`;
        
        // De-dup on zip
        if (savedLocations.some(l => l.zipCode === parsed.zipCode)) {
          console.log('⚠️ ZIP already exists in saved locations');
          toast.info('Location already saved');
          setSearch('');
          onClose();
          return;
        }

        location = {
          id: parsed.zipCode!,
          name: parsed.city!,
          country: 'USA',
          zipCode: parsed.zipCode!,
          cityState,
          lat: parseFloat(geo.places[0].latitude),
          lng: parseFloat(geo.places[0].longitude),
        };
      } else if (parsed.type === 'cityState') {
        // Manual entry without ZIP
        const cityState = `${parsed.city}, ${parsed.state}`;
        const locationId = `${parsed.city}-${parsed.state}`.toLowerCase();
        
        // De-dup on city/state combination
        if (savedLocations.some(l => l.id === locationId)) {
          console.log('⚠️ City/State already exists in saved locations');
          toast.info('Location already saved');
          setSearch('');
          onClose();
          return;
        }

        location = {
          id: locationId,
          name: parsed.city!,
          country: 'USA',
          zipCode: '', // No ZIP for manual entry
          cityState,
          lat: null, // Manual entries don't have coordinates
          lng: null,
        };
      }
      
      if (location) {
        console.log('✅ Created location object:', location);
        
        // Clear search and close dropdown
        setSearch('');
        onClose();
        
        // Call onLocationAdd
        console.log('📢 Calling onLocationAdd with location:', location);
        onLocationAdd(location);
        
        toast.success(`Added ${location.cityState}`);
      }
    } catch (err) {
      console.error('💥 Error in addLocation:', err);
      toast.error('Unable to add location. Please try again.');
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

  const handleAddClick = () => {
    console.log('🎯 Add location button clicked');
    if (search.trim()) {
      addLocation();
    } else {
      toast.error('Enter a location first');
    }
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ZIP, City/State, or City/State ZIP"
      />
      <button
        className="p-2 rounded bg-primary text-white"
        onClick={handleAddClick}
      >
        <Search size={16} />
      </button>
    </div>
  );
}
