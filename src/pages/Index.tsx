import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MoonPhase from '@/components/MoonPhase';
import TideChart from '@/components/TideChart';
import LocationSelector from '@/components/LocationSelector';
import WeeklyForecast from '@/components/WeeklyForecast';
import StarsBackdrop from '@/components/StarsBackdrop';
import { CloudMoon, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeLocalStorage } from '@/utils/localStorage';
import { toast } from 'sonner';
import { useTideData } from '@/hooks/useTideData';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  // Location is hardcoded to Narragansett, RI (02882)
  const [currentLocation, setCurrentLocation] = useState({
    id: "narragansett",
    name: "Narragansett",
    country: "USA",
    zipCode: "02882"
  });

  const {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime
  } = useTideData(currentLocation);

  return (
    <>
      <StarsBackdrop />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudMoon className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Fishing Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentLocation.name} ({currentLocation.zipCode})
            </span>
            {/* Location selector remains but won't affect hardcoded value */}
            <LocationSelector
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error loading tide data</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MoonPhase />
          <TideChart
            data={tideData}
            date={currentDate}
            currentTime={currentTime}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8">
          <WeeklyForecast
            forecast={weeklyForecast}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Index;
