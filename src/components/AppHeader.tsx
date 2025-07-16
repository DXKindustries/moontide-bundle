
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Settings, MapPin } from "lucide-react";
import MoonTideIcon from "./MoonTideIcon";
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
        <div className="flex items-center justify-center py-2 px-4">
          <MoonTideIcon className="h-6 w-6 text-moon-primary mr-2" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
            MoonTide
          </h1>
        </div>
        <div className="flex items-center justify-evenly py-1 w-full">
          <Link to="/fishing-calendar" className="flex flex-col items-center w-20 gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Calendar className="h-6 w-6" />
            </Button>
            <div className="text-xs text-gray-400 text-center">Moon Calendar</div>
          </Link>
          <Link to="/settings" className="flex flex-col items-center w-20 gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Settings className="h-6 w-6" />
            </Button>
            <div className="text-xs text-gray-400 text-center">Settings</div>
          </Link>
          <LocationSelector
            onSelect={onLocationChange}
            onStationSelect={onStationSelect}
            forceOpen={forceShowLocationSelector}
            onClose={onLocationSelectorClose}
            triggerContent={
              <div className="flex flex-col items-center w-20 gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                  <MapPin className="h-6 w-6" />
                </Button>
                <div className="text-xs text-gray-400 text-center">Change Tides</div>
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
