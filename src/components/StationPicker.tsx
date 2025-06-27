import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Station } from '@/services/tide/stationService';

interface StationPickerProps {
  isOpen: boolean;
  stations: Station[];
  onSelect: (station: Station) => void;
  onClose: () => void;
}

export default function StationPicker({ isOpen, stations, onSelect, onClose }: StationPickerProps) {
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (stations.length > 0) {
      setSelectedId(stations[0].id);
    }
  }, [stations]);

  const handleConfirm = () => {
    const station = stations.find((s) => s.id === selectedId);
    if (station) {
      console.log('📍 StationPicker handleConfirm:', { selectedId, station });
      onSelect(station);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select NOAA Station</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleConfirm} className="w-full">
            Use Station
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
