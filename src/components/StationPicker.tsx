import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Station } from '@/services/tide/stationService';

interface StationPickerProps {
  isOpen: boolean;
  stations: Station[];
  onSelect: (station: Station) => void;
  onClose: () => void;
  currentStationId?: string | null;
}

export default function StationPicker({ isOpen, stations, onSelect, onClose, currentStationId }: StationPickerProps) {
  const [selectedId, setSelectedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedId(currentStationId || (stations[0]?.id || ''));
  }, [stations, currentStationId]);

  const handleConfirm = () => {
    const station = stations.find((s) => s.id === selectedId);
    if (station) onSelect(station);
    onClose();
  };

  const handleManualSearch = async () => {
    const id = manualId.trim();
    if (!/^\d{7}$/.test(id)) {
      toast.error('Enter 7-digit NOAA Station ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${id}.json`
      );
      const data = await response.json();
      if (data.stations?.[0]) {
        onSelect(data.stations[0]);
        onClose();
      } else {
        toast.error('Station not found');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[100vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select NOAA Station</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Enter 7-digit Station ID"
            />
            <Button 
              onClick={handleManualSearch}
              disabled={!manualId.trim() || isLoading}
            >
              {isLoading ? 'Searching...' : 'Go'}
            </Button>
          </div>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose station" />
            </SelectTrigger>
            <SelectContent className="max-h-40 max-w-[90vw]">
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={!selectedId}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}