
import React, { useEffect, useState } from 'react';
import { MapPin, Search, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/utils/localStorage';
import { lookupZipCode, formatCityStateFromZip } from '@/utils/zipCodeLookup';

export interface SavedLocation {
  name: string;      // "Narragansett"
  zipCode: string;   // "02882"
  cityState: string; // "Narragansett, RI"
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
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (raw) setSaved(JSON.parse(raw));
  }, []);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  /* ---------------- helpers ---------------- */
  const addLocation = async () => {
    const zip = search.trim();
    if (!/^\d{5}$/.test(zip)) {
      toast.error('Enter a valid 5-digit U.S. ZIP');
      return;
    }

    try {
      const geo = await lookupZipCode(zip);           // {post code, places:[{...}] ...}
      if (!geo || !geo.places || geo.places.length === 0) {
        toast.error('ZIP not found');
        return;
      }
      const cityState = `${geo.places[0]['place name']}, ${geo.places[0].state}`;
      // De-dup on zip
      if (saved.some(l => l.zipCode === zip)) {
        toast.info('ZIP already saved');
        return;
      }

      const loc: SavedLocation = {
        name: geo.places[0]['place name'],
        zipCode: zip,
        cityState,
        lat: parseFloat(geo.places[0].latitude),
        lng: parseFloat(geo.places[0].longitude),
      };
      setSaved([...saved, loc]);
      setSearch('');
      onSelect(loc);
      setIsOpen(false);
    } catch (err) {
      toast.error('ZIP not found');
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
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter ZIP…"
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
            onClick={() => {
              onSelect(loc);
              setIsOpen(false);
            }}
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
