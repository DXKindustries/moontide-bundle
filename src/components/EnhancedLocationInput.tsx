
import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';
import UnifiedLocationInput from './UnifiedLocationInput';
import { Station } from '@/services/tide/stationService';

interface EnhancedLocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  onStationSelect?: (station: Station) => void;
  onLocationClear?: () => void;
  onClose: () => void;
  onStationsFound?: (stations: Station[]) => void;
}

interface SavedLocationWithNickname extends LocationData {
  nickname?: string;
}

export default function EnhancedLocationInput({ onLocationSelect, onStationSelect, onLocationClear, onClose, onStationsFound }: EnhancedLocationInputProps) {
  const [savedLocations, setSavedLocations] = useState<SavedLocationWithNickname[]>([]);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [newNickname, setNewNickname] = useState('');

  // Load saved locations on mount
  useEffect(() => {
    const history = locationStorage.getLocationHistory();
    setSavedLocations(history as SavedLocationWithNickname[]);
  }, []);

  const handleLocationSelect = (location: LocationData) => {
    console.log('📍 Location selected via UnifiedLocationInput:', location);

    const withNickname = {
      ...location,
      nickname: newNickname.trim() || undefined
    };

    // Update local state based on latest history after parent saves
    onLocationSelect(withNickname);
    const history = locationStorage.getLocationHistory();
    setSavedLocations(history as SavedLocationWithNickname[]);
    setNewNickname('');
  };

  const handleSavedLocationSelect = (location: SavedLocationWithNickname) => {
    onLocationSelect(location);
    toast.success(`Using ${location.nickname || location.city}`);
  };

  const handleNicknameEdit = (locationKey: string, currentNickname?: string) => {
    setEditingNickname(locationKey);
    setNicknameInput(currentNickname || '');
  };

  const saveNickname = () => {
    if (editingNickname) {
      const updatedLocations = savedLocations.map(loc => 
        (loc.zipCode || loc.city) === editingNickname 
          ? { ...loc, nickname: nicknameInput.trim() || undefined }
          : loc
      );
      
      setSavedLocations(updatedLocations);
      
      // Update in storage
      const history = locationStorage.getLocationHistory();
      const updatedHistory = history.map(loc => 
        (loc.zipCode || loc.city) === editingNickname 
          ? { ...loc, nickname: nicknameInput.trim() || undefined }
          : loc
      );
      
      localStorage.setItem('location-history', JSON.stringify(updatedHistory));
      
      setEditingNickname(null);
      setNicknameInput('');
      toast.success('Nickname saved');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Unified Input Section */}
      <UnifiedLocationInput
        onLocationSelect={handleLocationSelect}
        onStationSelect={onStationSelect}
        onClose={onClose}
        onStationsFound={onStationsFound}
        placeholder="02840 or Newport, RI"
      />
      <div className="-mt-2 space-y-2">
        <Label htmlFor="new-nickname" className="text-xs">Custom Name (Optional)</Label>
        <Input
          id="new-nickname"
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          placeholder="e.g., Work"
          className="h-8"
        />
      </div>

      {/* Recent Locations */}
      {savedLocations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Locations</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {savedLocations.slice(0, 8).map((location, index) => {
              const locationKey = location.zipCode || location.city;
              return (
                <div
                  key={`${locationKey}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted/70 transition-colors"
                >
                  <button
                    onClick={() => handleSavedLocationSelect(location)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm">
                      {location.nickname || `${location.city}, ${location.state}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {location.zipCode && `ZIP: ${location.zipCode}`}
                      {location.isManual && (
                        <span className="ml-2 text-blue-600">Manual</span>
                      )}
                    </div>
                  </button>
                  
                  {editingNickname === locationKey ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        placeholder="Nickname"
                        className="w-20 h-6 text-xs"
                        onKeyPress={(e) => e.key === 'Enter' && saveNickname()}
                      />
                      <Button size="sm" variant="ghost" onClick={saveNickname}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingNickname(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNicknameEdit(locationKey, location.nickname)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    );
}
