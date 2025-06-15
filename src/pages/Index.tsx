
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MoonPhase from '@/components/MoonPhase';
import TideChart from '@/components/TideChart';
import LocationSelector, { SavedLocation } from '@/components/LocationSelector';
import WeeklyForecast from '@/components/WeeklyForecast';
import StarsBackdrop from '@/components/StarsBackdrop';
import { CloudMoon, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeLocalStorage } from '@/utils/localStorage';
import { toast } from 'sonner';
import { useTideData } from '@/hooks/useTideData';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// --- Fix: Ensure default 'currentLocation' has required fields: id, name, country, zipCode, lat, lng ---
const DEFAULT_LOCATION: SavedLocation & { id: string; country: string } = {
  id: "narragansett", // required for hook and caching
  name: "Narragansett",
  country: "USA",
  zipCode: "02882",
  cityState: "Narragansett, RI",
  lat: 41.4501,
  lng: -71.4495,
};

const Index = () => {
  console.log('🚀 Index component rendering...');
  
  const [currentLocation, setCurrentLocation] = useState<SavedLocation & { id: string; country: string } | null>(() => {
    console.log('📍 Initializing currentLocation state...');
    try {
      const savedLocation = safeLocalStorage.getItem('moontide-current-location');
      console.log('💾 Saved location from localStorage:', savedLocation);
      if (savedLocation) return savedLocation;
    } catch (error) {
      console.warn('⚠️ Error reading location from localStorage:', error);
    }
    console.log('🎯 Using DEFAULT_LOCATION:', DEFAULT_LOCATION);
    return DEFAULT_LOCATION; // Always fallback to a valid object
  });

  console.log('🌊 Current location for useTideData:', currentLocation);

  const {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName
  } = useTideData({ location: currentLocation });

  console.log('📊 useTideData results:', {
    isLoading,
    error,
    tideDataLength: tideData?.length || 0,
    weeklyForecastLength: weeklyForecast?.length || 0,
    currentDate,
    currentTime,
    stationName
  });

  useEffect(() => {
    console.log('📝 Setting document title for location:', currentLocation?.name);
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
    console.log("Current location in Index.tsx:", currentLocation);
  }, [currentLocation]);

  const moonPhaseData = {
    phase: weeklyForecast.length > 0 ? weeklyForecast[0].moonPhase : "Waxing Crescent",
    illumination: weeklyForecast.length > 0 ? weeklyForecast[0].illumination : 35,
    moonrise: "18:42",
    moonset: "07:15",
    date: currentDate || "May 21, 2025"
  };

  console.log('🌙 Moon phase data:', moonPhaseData);

  const handleLocationChange = (location: SavedLocation) => {
    console.log('📍 Location change requested:', location);
    const updatedLocation = {
      ...location,
      id: location.id || (location.zipCode || "default"),
      country: location.country || "USA",
      name: location.name || `${location.zipCode || "Unknown Location"}`
    };
    console.log('📍 Updated location object:', updatedLocation);
    setCurrentLocation(updatedLocation);
    try {
      safeLocalStorage.setItem('moontide-current-location', updatedLocation);
      console.log('💾 Saved updated location to localStorage');
    } catch (error) {
      console.warn('⚠️ Error saving location to localStorage:', error);
    }
    toast.info(`Loading tide data for ${updatedLocation.name}`);
  };

  const formatLocationDisplay = () => {
    if (!currentLocation) return "Select a location";
    if ((currentLocation as any).id === "default") return "Select a location";
    if ((currentLocation as any).zipCode) {
      return `${currentLocation.name} (${(currentLocation as any).zipCode})`;
    }
    if (currentLocation.name && (currentLocation as any).country) {
      return `${currentLocation.name}, ${(currentLocation as any).country}`;
    }
    return currentLocation.name || "Select a location";
  };

  console.log('🎨 About to render Index component with:', {
    hasCurrentLocation: !!currentLocation,
    locationName: currentLocation?.name,
    isLoading,
    hasError: !!error,
    hasTideData: tideData?.length > 0,
    hasWeeklyForecast: weeklyForecast?.length > 0
  });

  return (
    <div className="min-h-screen pb-8 relative">
      <StarsBackdrop />

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
              <div className="flex flex-col bg-muted/70 backdrop-blur-sm py-2 px-3 rounded-lg gap-1 mr-2">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-moon-primary" />
                  <span className="text-sm font-medium">
                    {formatLocationDisplay()}
                  </span>
                </div>
                {/* Station name under ZIP */}
                <div className="text-xs text-muted-foreground pl-5">
                  Tide data from NOAA station: <span className="font-medium">{stationName || "N/A"}</span>
                </div>
              </div>
              <LocationSelector
                onSelect={handleLocationChange}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. Using mock data instead.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MoonPhase
            phase={moonPhaseData.phase}
            illumination={moonPhaseData.illumination}
            moonrise={moonPhaseData.moonrise}
            moonset={moonPhaseData.moonset}
            date={moonPhaseData.date}
          />

          <TideChart
            data={tideData}
            date={currentDate || moonPhaseData.date}
            currentTime={currentTime}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-6">
          <WeeklyForecast
            forecast={weeklyForecast}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
