
import React from 'react';
import { Link } from 'react-router-dom';
import { CloudMoon, Calendar, Settings, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSelector, { SavedLocation } from './LocationSelector';
import { Station } from '@/services/tide/stationService';

interface AppHeaderProps {
  onLocationChange: (location: SavedLocation) => void;
  onStationSelect?: (station: Station) => void;
  forceShowLocationSelector?: boolean;
  onLocationSelectorClose?: () => void;
}

export default function AppHeader({
  onLocationChange,
  onStationSelect,
  forceShowLocationSelector,
  onLocationSelectorClose
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm shadow-md">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between py-2 px-4">
          <div className="flex items-center">
            <CloudMoon className="h-6 w-6 text-moon-primary mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
              MoonTide
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-evenly py-2 w-full">
          <Link to="/fishing-calendar">
            <Button variant="ghost" size="icon">
              <Calendar className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <LocationSelector
            onSelect={onLocationChange}
            onStationSelect={onStationSelect}
            forceOpen={forceShowLocationSelector}
            onClose={onLocationSelectorClose}
            triggerContent={<MapPin className="h-5 w-5" />}
          />
        </div>
      </div>
    </header>
  );
}
