
import React from 'react';
import { Link } from 'react-router-dom';
import { CloudMoon, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSelector, { SavedLocation } from './LocationSelector';

interface AppHeaderProps {
  currentLocation: SavedLocation & { id: string; country: string } | null;
  stationName: string | null;
  onLocationChange: (location: SavedLocation) => void;
  onLocationClear?: () => void;
  hasError?: boolean;
  forceShowLocationSelector?: boolean;
  onLocationSelectorClose?: () => void;
}

export default function AppHeader({ 
  currentLocation, 
  stationName, 
  onLocationChange,
  onLocationClear,
  hasError,
  forceShowLocationSelector,
  onLocationSelectorClose 
}: AppHeaderProps) {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CloudMoon className="h-8 w-8 text-moon-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
              MoonTide
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/fishing-calendar">
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Calendar</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
            <LocationSelector 
              onSelect={onLocationChange}
              forceOpen={forceShowLocationSelector}
              onClose={onLocationSelectorClose}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
