
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

export default function LocationSearchInput({
  search,
  setSearch,
  onLocationAdd,
  savedLocations,
  onClose
}: LocationSearchInputProps) {
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
        toast.error('ZIP code not found. Please check and try again.');
        return;
      }
      
      const cityState = `${geo.places[0]['place name']}, ${geo.places[0].state}`;
      console.log('🏙️ Formatted city/state:', cityState);
      
      // De-dup on zip
      if (savedLocations.some(l => l.zipCode === zip)) {
        console.log('⚠️ ZIP already exists in saved locations');
        toast.info('ZIP already saved');
        setSearch('');
        onClose();
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
      
      // Clear search and close dropdown
      setSearch('');
      onClose();
      
      // Call onLocationAdd
      console.log('📢 Calling onLocationAdd with location:', loc);
      onLocationAdd(loc);
      
      toast.success(`Added ${cityState}`);
    } catch (err) {
      console.error('💥 Error in addLocation:', err);
      toast.error('ZIP code not found. Please check and try again.');
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
      toast.error('Enter a ZIP code first');
    }
  };

  return (
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
        onClick={handleAddClick}
      >
        <Search size={16} />
      </button>
    </div>
  );
}
