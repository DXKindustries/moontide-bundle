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
  const [selectedId, setSelectedId] = useState<string>('');
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    if (stations.length > 0) {
      if (currentStationId && stations.some(s => s.id === currentStationId)) {
        setSelectedId(currentStationId);
      } else {
        setSelectedId(stations[0].id);
      }
    } else {
      setSelectedId('');
    }
  }, [stations, currentStationId]);

  const handleConfirm = () => {
    const station = stations.find((s) => s.id === selectedId);
    if (station) {
      console.log('📍 StationPicker handleConfirm:', { selectedId, station });
      onSelect(station);
    }
    onClose();
  };

  const handleManualSearch = async () => {
    if (!manualId.trim()) return;
    try {
      const url =
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${manualId.trim()}.json`;
      const response = await fetch(url);
      if (!response.ok) {
        toast.error('Station not found');
        return;
      }
      const data = await response.json();
      if (data.station) {
        onSelect(data.station as Station);
        onClose();
      } else {
        toast.error('Station not found');
      }
    } catch {
      toast.error('Unable to fetch station');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-w-[100vw] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Select NOAA Station</DialogTitle>
      </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Station ID"
            />
            <Button variant="outline" onClick={handleManualSearch}
              disabled={!manualId.trim()}
            >
              Go
            </Button>
          </div>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose station" />
            </SelectTrigger>
            <SelectContent className="max-h-40 max-w-[90vw]">
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                  {s.city && s.state ? ` - ${s.city}, ${s.state}` : ''} ({s.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Use Station
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
