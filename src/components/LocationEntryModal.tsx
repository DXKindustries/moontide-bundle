
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { LocationData } from '@/types/locationTypes';

interface LocationEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
}

export default function LocationEntryModal({ isOpen, onClose, onLocationSelect }: LocationEntryModalProps) {
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zipCode.trim() || zipCode.length !== 5) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await lookupZipCode(zipCode);
      
      if (result && result.places && result.places.length > 0) {
        const place = result.places[0];
        const location: LocationData = {
          zipCode,
          city: place['place name'],
          state: place.state,
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude),
          isManual: false,
          timestamp: Date.now()
        };

        onLocationSelect(location);
        toast.success(`Found ${location.city}, ${location.state}`);
        onClose();
        setZipCode('');
      } else {
        toast.error('ZIP code not found. Please try another.');
      }
    } catch (error) {
      console.error('ZIP lookup error:', error);
      toast.error('Unable to look up ZIP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
  };

  const handleClose = () => {
    setZipCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Enter Your Location
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Enter your 5-digit ZIP code to get tide data
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={zipCode}
                onChange={handleInputChange}
                placeholder="12345"
                maxLength={5}
                className="text-center text-lg font-mono flex-1"
                disabled={isLoading}
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={zipCode.length !== 5 || isLoading}
                size="default"
              >
                {isLoading ? (
                  <div className="animate-spin">⏳</div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              <p>Examples: 02840 (Newport, RI), 90210 (Beverly Hills, CA)</p>
              <p className="mt-1">Coastal areas will show tide data</p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
