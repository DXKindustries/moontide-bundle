
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Save } from 'lucide-react';
import { LocationData } from '@/types/locationTypes';

interface ManualLocationEntryProps {
  zipCode: string;
  onSave: (location: LocationData) => void;
  onCancel: () => void;
}

export default function ManualLocationEntry({ zipCode, onSave, onCancel }: ManualLocationEntryProps) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim() || !state.trim()) {
      return;
    }

    const location: LocationData = {
      zipCode,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      isManual: true
    };

    onSave(location);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-semibold">Enter Location Details</h3>
        <p className="text-sm text-muted-foreground">
          We couldn't find ZIP code {zipCode}. Please enter manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Newport"
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. RI"
              maxLength={2}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lat">Latitude (optional)</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="41.49"
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude (optional)</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-71.31"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!city.trim() || !state.trim()}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Location
          </Button>
        </div>
      </form>
    </div>
  );
}
