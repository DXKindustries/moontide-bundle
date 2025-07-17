import React from 'react';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

// ✅ path now points to your existing SVG
import MoonTideIcon from "@/assets/MoonTideIcon.svg";

type FishingCalendarHeaderProps = {
  currentLocation: {
    name: string;
    country: string;
    zipCode?: string;
  } | null;
  stationName: string | null;
};

const FishingCalendarHeader: React.FC<FishingCalendarHeaderProps> = ({
  currentLocation,
  stationName
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm shadow-md py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-2">
          <div className="flex items-center">
            <MoonTideIcon className="h-8 w-8 text-moon-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
              Calendar
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-sm font-medium hidden md:inline">
              {currentLocation
                ? <>
                    {currentLocation.name}, {currentLocation.country}
                    {currentLocation.zipCode && ` (${currentLocation.zipCode})`}
                    {stationName && ` - ${stationName}`}
                  </>
                : "Location not set"}
            </span>
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FishingCalendarHeader;
