import React from 'react';
import { CloudMoon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

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
  stationName,
}) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 max-w-full">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center">
            <CloudMoon className="h-8 w-8 text-moon-primary mr-2" />
            <h1 className="ml-1 text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
              Calendar
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-medium hidden md:inline truncate">
              {currentLocation ? (
                <>
                  {currentLocation.name}, {currentLocation.country}
                  {currentLocation.zipCode && ` (${currentLocation.zipCode})`}
                  {stationName && ` - ${stationName}`}
                </>
              ) : (
                "Location not set"
              )}
            </span>
            <Link to="/" className="shrink-0">
              <Button variant="ghost" className="flex items-center gap-1 px-2">
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
