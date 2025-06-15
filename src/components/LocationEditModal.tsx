
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationData } from '@/types/locationTypes';

interface LocationEditModalProps {
  location: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLocation: LocationData) => void;
}

export default function LocationEditModal({ location, isOpen, onClose, onSave }: LocationEditModalProps) {
  const [nickname, setNickname] = useState(location.nickname || '');
  const [city, setCity] = useState(location.city);
  const [state, setState] = useState(location.state);
  const [zipCode, setZipCode] = useState(location.zipCode);

  const handleSave = () => {
    const updatedLocation: LocationData = {
      ...location,
      nickname: nickname.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim()
    };
    
    onSave(updatedLocation);
    onClose();
  };

  const handleCancel = () => {
    // Reset form to original values
    setNickname(location.nickname || '');
    setCity(location.city);
    setState(location.state);
    setZipCode(location.zipCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Custom Name (Optional)</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Home, Work, Beach House"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!city.trim() || !state.trim() || !zipCode.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
