
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Edit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { locationStorage } from '@/utils/locationStorage';
import { LocationData } from '@/types/locationTypes';

interface EnhancedLocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  onClose: () => void;
}

interface SavedLocationWithNickname extends LocationData {
  nickname?: string;
}

export default function EnhancedLocationInput({ onLocationSelect, onClose }: EnhancedLocationInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocationWithNickname[]>([]);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved locations on mount
  useEffect(() => {
    const history = locationStorage.getLocationHistory();
    setSavedLocations(history as SavedLocationWithNickname[]);
  }, []);

  // Parse different input formats
  const parseLocationInput = (input: string) => {
    const trimmed = input.trim();
    
    // ZIP code only (5 digits)
    if (/^\d{5}$/.test(trimmed)) {
      return { type: 'zip', zipCode: trimmed };
    }
    
    // City, State ZIP (e.g., "Newport, RI 02840")
    const cityStateZipMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})\s+(\d{5})$/);
    if (cityStateZipMatch) {
      return {
        type: 'full',
        city: cityStateZipMatch[1].trim(),
        state: cityStateZipMatch[2].toUpperCase(),
        zipCode: cityStateZipMatch[3]
      };
    }
    
    // City, State (e.g., "Newport, RI")
    const cityStateMatch = trimmed.match(/^(.+),\s*([A-Za-z]{2})$/);
    if (cityStateMatch) {
      return {
        type: 'cityState',
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2].toUpperCase()
      };
    }
    
    // City only (will suggest common states)
    if (trimmed.length > 0) {
      return { type: 'city', city: trimmed };
    }
    
    return null;
  };

  const handleLocationSearch = async () => {
    if (!input.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsLoading(true);
    const parsed = parseLocationInput(input);
    
    if (!parsed) {
      toast.error('Please enter a valid location format');
      setIsLoading(false);
      return;
    }

    try {
      let location: LocationData | null = null;

      if (parsed.type === 'zip') {
        // ZIP code lookup
        const result = await lookupZipCode(parsed.zipCode);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          location = {
            zipCode: parsed.zipCode,
            city: place['place name'],
            state: place.state,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false,
            timestamp: Date.now()
          };
        }
      } else if (parsed.type === 'full') {
        // Verify ZIP code matches city/state
        const result = await lookupZipCode(parsed.zipCode);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          location = {
            zipCode: parsed.zipCode,
            city: parsed.city,
            state: parsed.state,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false,
            timestamp: Date.now()
          };
        }
      } else {
        // Manual entry for city/state or city only
        location = {
          zipCode: '',
          city: parsed.city,
          state: parsed.state || 'Unknown',
          lat: null,
          lng: null,
          isManual: true,
          timestamp: Date.now()
        };
      }

      if (location) {
        // Save to storage
        locationStorage.saveCurrentLocation(location);
        
        // Update local state
        const history = locationStorage.getLocationHistory();
        setSavedLocations(history as SavedLocationWithNickname[]);
        
        onLocationSelect(location);
        toast.success(`Location saved: ${location.city}, ${location.state}`);
      } else {
        toast.error('Location not found. Please check your input and try again.');
        // Show fallback message for non-tidal areas
        if (parsed.type === 'zip') {
          toast.info('This may be a non-coastal area. Tide data may not be available.');
        }
      }
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Unable to find location. Please try a different format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGPSRequest = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Create a GPS-based location
          const location: LocationData = {
            zipCode: '',
            city: 'GPS Location',
            state: 'Current',
            lat: latitude,
            lng: longitude,
            isManual: false,
            timestamp: Date.now()
          };

          locationStorage.saveCurrentLocation(location);
          const history = locationStorage.getLocationHistory();
          setSavedLocations(history as SavedLocationWithNickname[]);
          
          onLocationSelect(location);
          toast.success('GPS location captured');
        } catch (error) {
          toast.error('Error processing GPS location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast.error('Unable to get GPS location. Please check permissions.');
      },
      { timeout: 10000 }
    );
  };

  const handleSavedLocationSelect = (location: SavedLocationWithNickname) => {
    locationStorage.saveCurrentLocation(location);
    onLocationSelect(location);
    toast.success(`Using ${location.nickname || location.city}`);
  };

  const handleNicknameEdit = (locationZip: string, currentNickname?: string) => {
    setEditingNickname(locationZip);
    setNicknameInput(currentNickname || '');
  };

  const saveNickname = () => {
    if (editingNickname) {
      const updatedLocations = savedLocations.map(loc => 
        loc.zipCode === editingNickname 
          ? { ...loc, nickname: nicknameInput.trim() || undefined }
          : loc
      );
      
      setSavedLocations(updatedLocations);
      
      // Update in storage
      const history = locationStorage.getLocationHistory();
      const updatedHistory = history.map(loc => 
        loc.zipCode === editingNickname 
          ? { ...loc, nickname: nicknameInput.trim() || undefined }
          : loc
      );
      
      // Save back to storage (we'll need to update locationStorage to handle nicknames)
      localStorage.setItem('location-history', JSON.stringify(updatedHistory));
      
      setEditingNickname(null);
      setNicknameInput('');
      toast.success('Nickname saved');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationSearch();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Enter Location</h3>
          <p className="text-sm text-muted-foreground">
            ZIP, City/State, or "City, ST ZIP"
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="02840 or Newport, RI"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleLocationSearch}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <div className="animate-spin">⏳</div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGPSRequest}
          disabled={isLoading}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use Current Location (GPS)
        </Button>
      </div>

      {/* Recent Locations */}
      {savedLocations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Locations</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {savedLocations.slice(0, 8).map((location, index) => (
              <div
                key={`${location.zipCode || location.city}-${index}`}
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
                
                {editingNickname === (location.zipCode || location.city) ? (
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
                    onClick={() => handleNicknameEdit(
                      location.zipCode || location.city, 
                      location.nickname
                    )}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Format Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>ZIP: <code>02840</code></li>
          <li>City, State: <code>Newport, RI</code></li>
          <li>Full: <code>Newport, RI 02840</code></li>
        </ul>
      </div>
    </div>
  );
}
