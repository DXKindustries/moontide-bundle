
import React from 'react';
import { Plus } from 'lucide-react';
import { SavedLocation } from './LocationSelector';

interface SavedLocationsListProps {
  savedLocations: SavedLocation[];
  onLocationSelect: (location: SavedLocation) => void;
  onAddLocationClick: () => void;
}

export default function SavedLocationsList({
  savedLocations,
  onLocationSelect,
  onAddLocationClick
}: SavedLocationsListProps) {
  const handleLocationSelect = (loc: SavedLocation) => {
    console.log('🎯 Selected saved location:', loc);
    onLocationSelect(loc);
  };

  return (
    <>
      {savedLocations.length === 0 && (
        <p className="text-xs text-muted-foreground mb-2">
          No saved locations yet. Add one above.
        </p>
      )}

      {savedLocations.map(loc => (
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
          onClick={onAddLocationClick}
          className="flex w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus size={12} /> Add location
        </button>
      </div>
    </>
  );
}
