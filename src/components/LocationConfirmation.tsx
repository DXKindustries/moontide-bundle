
import React from 'react';
import { Check, MapPin, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationData } from '@/types/locationTypes';

interface LocationConfirmationProps {
  location: LocationData;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function LocationConfirmation({ location, onConfirm, onEdit }: LocationConfirmationProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Location Found!</h3>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{location.city}, {location.state}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          ZIP: {location.zipCode}
        </div>
        {location.lat && location.lng && (
          <div className="text-xs text-muted-foreground">
            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}
        {location.isManual && (
          <div className="text-xs text-blue-600">
            Manually entered location
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit} className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Use This Location
        </Button>
      </div>
    </div>
  );
}
