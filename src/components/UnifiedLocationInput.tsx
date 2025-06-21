import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { getCoordinatesForCity } from '@/services/geocodingService';
import { LocationData } from '@/types/locationTypes';

interface UnifiedLocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip';
  zipCode?: string;
  city?: string;
  state?: string;
};

export default function UnifiedLocationInput({ 
  onLocationSelect, 
  onClose, 
  placeholder = "ZIP, City State, or City State ZIP",
  autoFocus = true
}: UnifiedLocationInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Parse different input formats
  const parseLocationInput = (input: string): ParsedInput | null => {
    const trimmed = input.trim();
    
    // ZIP code only (5 digits)
    if (/^\d{5}$/.test(trimmed)) {
      return { type: 'zip', zipCode: trimmed };
    }
    
    // City, State ZIP (e.g., "Newport, RI 02840" OR "Newport RI 02840")
    const cityStateZipMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z]{2})\s+(\d{5})$/);
    if (cityStateZipMatch) {
      return {
        type: 'cityStateZip',
        city: cityStateZipMatch[1].trim(),
        state: cityStateZipMatch[2].toUpperCase(),
        zipCode: cityStateZipMatch[3]
      };
    }
    
    // City, State (e.g., "Newport, RI" OR "Newport RI")
    const cityStateMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z]{2})$/);
    if (cityStateMatch) {
      return {
        type: 'cityState',
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2].toUpperCase()
      };
    }
    
    return null;
  };

  const handleLocationSearch = async () => {
    if (!input.trim()) {
      toast.error('Please enter a location');
      return;
    }

    const parsed = parseLocationInput(input);
    
    if (!parsed) {
      toast.error('Please use format: ZIP, "City ST", or "City ST ZIP"');
      return;
    }

    setIsLoading(true);
    console.log('🔍 Parsed input:', parsed);

    try {
      let location: LocationData | null = null;

      if (parsed.type === 'zip') {
        // ZIP code lookup
        console.log('🏷️ Looking up ZIP code:', parsed.zipCode);
        const result = await lookupZipCode(parsed.zipCode!);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          location = {
            zipCode: parsed.zipCode!,
            city: place['place name'],
            state: place.state,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false,
            timestamp: Date.now()
          };
          console.log('✅ ZIP lookup successful:', location);
        }
      } else if (parsed.type === 'cityStateZip') {
        // Verify ZIP code matches city/state
        console.log('🏷️ Verifying city/state with ZIP:', parsed);
        const result = await lookupZipCode(parsed.zipCode!);
        if (result && result.places && result.places.length > 0) {
          const place = result.places[0];
          // Use the provided city/state but coordinates from ZIP lookup
          location = {
            zipCode: parsed.zipCode!,
            city: parsed.city!,
            state: parsed.state!,
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            isManual: false,
            timestamp: Date.now()
          };
          console.log('✅ City/State/ZIP verification successful:', location);
        }
      } else if (parsed.type === 'cityState') {
        // Try to geocode city/state first
        console.log('🏙️ Attempting to geocode city/state:', parsed);
        const geocodeResult = await getCoordinatesForCity(parsed.city!, parsed.state!);
        
        if (geocodeResult) {
          location = {
            zipCode: '',
            city: parsed.city!,
            state: parsed.state!,
            lat: geocodeResult.lat,
            lng: geocodeResult.lng,
            isManual: false,
            timestamp: Date.now()
          };
          console.log('✅ City/State geocoding successful:', location);
        } else {
          // Fallback to manual entry (no coordinates)
          console.log('📝 Fallback to manual city/state entry:', parsed);
          location = {
            zipCode: '',
            city: parsed.city!,
            state: parsed.state!,
            lat: null,
            lng: null,
            isManual: true,
            timestamp: Date.now()
          };
          console.log('✅ Manual location created:', location);
          toast.success(`Location saved: ${location.city}, ${location.state} (manual entry)`);
        }
      }

      if (location) {
        onLocationSelect(location);
        if (!location.isManual) {
          toast.success(`Location saved: ${location.city}, ${location.state}`);
        }
        onClose?.();
      } else {
        toast.error('Location not found. Please check your input and try again.');
      }
    } catch (error) {
      console.error('🚨 Location search error:', error);
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
          
          const location: LocationData = {
            zipCode: '',
            city: 'GPS Location',
            state: 'Current',
            lat: latitude,
            lng: longitude,
            isManual: false,
            timestamp: Date.now()
          };

          onLocationSelect(location);
          toast.success('GPS location captured');
          onClose?.();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationSearch();
    }
  };

  const handleClear = () => {
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Location</h3>
        <p className="text-sm text-muted-foreground">
          ZIP, City State, or City State ZIP
        </p>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pr-8"
            disabled={isLoading}
          />
          {input && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
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

      {/* Input Format Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>ZIP: <code>02840</code></li>
          <li>City State: <code>Newport RI</code></li>
          <li>Full: <code>Newport RI 02840</code></li>
        </ul>
      </div>
    </div>
  );
}
