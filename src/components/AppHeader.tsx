
import React from 'react';
import { Link } from 'react-router-dom';
import { CloudMoon, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSelector, { SavedLocation } from './LocationSelector';
import { Station } from '@/services/tide/stationService';

interface AppHeaderProps {
  currentLocation: SavedLocation & { id: string; country: string } | null;
  stationName: string | null;
  onLocationChange: (location: SavedLocation) => void;
  onStationSelect?: (station: Station) => void;
  onStationsFound?: (stations: Station[]) => void;
  onLocationClear?: () => void;
  hasError?: boolean;
  forceShowLocationSelector?: boolean;
  onLocationSelectorClose?: () => void;
}

export default function AppHeader({
  currentLocation,
  stationName,
  onLocationChange,
  onStationSelect,
  onStationsFound,
  onLocationClear,
  hasError,
  forceShowLocationSelector,
  onLocationSelectorClose
}: AppHeaderProps) {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center w-full justify-center sm:w-auto sm:justify-start">
            <CloudMoon className="h-8 w-8 text-moon-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
              MoonTide
            </h1>
            {stationName && (
              <span className="ml-2 text-sm text-muted-foreground hidden md:inline">
                {stationName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full justify-center sm:w-auto sm:justify-end">
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
              onStationSelect={onStationSelect}
              onStationsFound={onStationsFound}
              forceOpen={forceShowLocationSelector}
              onClose={onLocationSelectorClose}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
