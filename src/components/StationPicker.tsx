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
    if (currentStationId && stations.some(s => s.id === currentStationId)) {
      setSelectedId(currentStationId);
    } else if (stations.length > 0) {
      setSelectedId(stations[0].id);
    }
  }, [stations, currentStationId]);

  const handleConfirm = () => {
    const station = stations.find((s) => s.id === selectedId);
    if (station) {
      onSelect(station);
      onClose();
    }
  };

  const handleManualSearch = async () => {
    const id = manualId.trim();
    if (!/^\d{7}$/.test(id)) {
      toast.error('Please enter a valid 7-digit NOAA Station ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${id}.json?type=waterlevels`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.stations || data.stations.length === 0) {
        throw new Error('Station not found in NOAA database');
      }

      const stationData = data.stations[0];
      const station: Station = {
        id: stationData.id,
        name: stationData.name,
        latitude: parseFloat(stationData.lat),
        longitude: parseFloat(stationData.lng),
        state: stationData.state,
        city: stationData.city || '',
        type: 'R' // Default to reference station
      };

      onSelect(station);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch station data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Select Tide Station</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 7-digit Station ID"
              maxLength={7}
            />
            <Button 
              onClick={handleManualSearch}
              disabled={!manualId || manualId.length !== 7 || isLoading}
            >
              {isLoading ? 'Searching...' : 'Lookup'}
            </Button>
          </div>

          {stations.length > 0 && (
            <>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select from list" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} ({station.id}) {station.city && `- ${station.city}, ${station.state}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  className="flex-1"
                  disabled={!selectedId}
                >
                  Select Station
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}