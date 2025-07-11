import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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

  const handleSave = () => {
    const updatedLocation: LocationData = {
      ...location,
      nickname: nickname.trim() || undefined
    };

    onSave(updatedLocation);
    onClose();
  };

  const handleCancel = () => {
    setNickname(location.nickname || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {location.stationName && (
            <div className="space-y-1 text-sm">
              <Label>Official Name</Label>
              <p className="text-muted-foreground">{location.stationName}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nickname">Custom Name (Optional)</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Home, Work"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
