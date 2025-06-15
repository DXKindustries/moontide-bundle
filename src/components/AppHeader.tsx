
import React from 'react';
import { Link } from 'react-router-dom';
import { CloudMoon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationDisplay from './LocationDisplay';
import LocationSelector, { SavedLocation } from './LocationSelector';

interface AppHeaderProps {
  currentLocation: SavedLocation & { id: string; country: string } | null;
  stationName: string | null;
  onLocationChange: (location: SavedLocation) => void;
  hasError?: boolean; // Add error prop
}

export default function AppHeader({ currentLocation, stationName, onLocationChange, hasError }: AppHeaderProps) {
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
                <span className="hidden md:inline">Fishing Calendar</span>
              </Button>
            </Link>
            <LocationDisplay 
              currentLocation={currentLocation}
              stationName={stationName}
              hasError={hasError}
            />
            <LocationSelector onSelect={onLocationChange} />
          </div>
        </div>
      </div>
    </header>
  );
}
