
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
        <div className="flex items-center justify-center pt-2 pb-1 px-4">
          <MoonTideIcon className="h-6 w-6 text-moon-primary mr-2" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
            MoonTide
          </h1>
        </div>
        <nav className="flex items-end justify-evenly px-4 py-0">
          <Link to="/fishing-calendar" className="flex flex-1 justify-center">
            <div className="navItem">
              <Button variant="ghost" size="icon" className="p-0 text-[18px] leading-none">
                <Calendar className="w-[18px] h-[18px] leading-none" />
              </Button>
              <span className="text-[11px] leading-[13px] text-gray-400">Moon Calendar</span>
            </div>
          </Link>
          <Link to="/settings" className="flex flex-1 justify-center">
            <div className="navItem">
              <Button variant="ghost" size="icon" className="p-0 text-[18px] leading-none">
                <Settings className="w-[18px] h-[18px] leading-none" />
              </Button>
              <span className="text-[11px] leading-[13px] text-gray-400">Settings</span>
            </div>
          </Link>
          <LocationSelector
            onSelect={onLocationChange}
            onStationSelect={onStationSelect}
            forceOpen={forceShowLocationSelector}
            onClose={onLocationSelectorClose}
            buttonClassName="flex flex-1 justify-center p-0"
            triggerContent={
              <div className="navItem">
                <Button variant="ghost" size="icon" className="p-0 text-[18px] leading-none">
                  <MapPin className="w-[18px] h-[18px] leading-none" />
                </Button>
                <span className="text-[11px] leading-[13px] text-gray-400">Change Tides</span>
              </div>
            }
          />
        </nav>
      </div>
    </header>
  );
}
