
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
  // Location state with safe localStorage persistence and improved defaults
  const [currentLocation, setCurrentLocation] = useState(() => {
    // Try to get the saved location first
    try {
      const savedLocation = safeLocalStorage.getItem('moontide-current-location');
      if (savedLocation) {
        return savedLocation;
      }
    } catch (error) {
      console.warn('Error reading location from localStorage:', error);
    }
    
    // Fall back to default location
    return {
      id: "sf",
      name: "Winchendon", 
      country: "USA",
      zipCode: "01475"
    };
  });

  // Get tide data from our hook
  const { 
    isLoading, 
    error, 
    tideData, 
    weeklyForecast, 
    currentDate, 
    currentTime, 
    stationName 
  } = useTideData({ location: currentLocation });

  // Effect to update the page title with current location
  useEffect(() => {
    document.title = `MoonTide - ${currentLocation.name}`;
    
    // Log the current location for debugging
    console.log("Current location in Index.tsx:", currentLocation);
  }, [currentLocation]);

  // Mock data for moon phase
  const moonPhaseData = {
    phase: weeklyForecast.length > 0 ? weeklyForecast[0].moonPhase : "Waxing Crescent",
    illumination: weeklyForecast.length > 0 ? weeklyForecast[0].illumination : 35,
    moonrise: "18:42",
    moonset: "07:15",
    date: currentDate || "May 21, 2025"
  };

  // Handle location change and persist to localStorage safely
  const handleLocationChange = (location: any) => {
    console.log("Location changed to:", location);
    
    // Make sure we have a properly formatted location object
    const updatedLocation = {
      ...location,
      name: location.name || `${location.zipCode || "Unknown Location"}`
    };
    
    setCurrentLocation(updatedLocation);
    
    try {
      safeLocalStorage.setItem('moontide-current-location', updatedLocation);
    } catch (error) {
      console.warn('Error saving location to localStorage:', error);
    }
    
    // Show toast to indicate we're loading new tide data
    toast.info(`Loading tide data for ${updatedLocation.name}`);
  };
  
  // Format location display for header
  const formatLocationDisplay = () => {
    if (!currentLocation) return "Select a location";
    
    if (currentLocation.id === "default") {
      return "Select a location";
    }
    
    // For locations with a ZIP code
    if (currentLocation.zipCode) {
      // For US locations
      if (currentLocation.country === "USA" || currentLocation.country === "United States") {
        return `${currentLocation.name} (${currentLocation.zipCode})`;
      }
      
      // Non-US format
      return `${currentLocation.name} (${currentLocation.zipCode})`;
    }
    
    // For locations without ZIP code
    if (currentLocation.name && currentLocation.country) {
      return `${currentLocation.name}, ${currentLocation.country}`;
    }
    
    return currentLocation.name || "Select a location";
  };

  return (
    <div className="min-h-screen pb-8 relative">
      {/* Stars background */}
      <StarsBackdrop />
      
      {/* Header */}
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
              <div className="flex items-center bg-muted/70 backdrop-blur-sm py-2 px-3 rounded-lg mr-2 gap-1">
                <MapPin size={16} className="text-moon-primary" />
                <span className="text-sm font-medium">
                  {formatLocationDisplay()}
                </span>
              </div>
              <LocationSelector 
                currentLocation={currentLocation} 
                onLocationChange={handleLocationChange} 
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
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
        
        {stationName && currentLocation.id !== 'default' && (
          <div className="mb-4 text-sm text-muted-foreground">
            <span>Tide data from NOAA station: </span>
            <span className="font-medium">{stationName}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Moon phase card */}
          <MoonPhase 
            phase={moonPhaseData.phase}
            illumination={moonPhaseData.illumination}
            moonrise={moonPhaseData.moonrise}
            moonset={moonPhaseData.moonset}
            date={moonPhaseData.date}
          />
          
          {/* Tide chart card */}
          <TideChart 
            data={tideData}
            date={currentDate || moonPhaseData.date}
            currentTime={currentTime}
            isLoading={isLoading}
          />
        </div>
        
        {/* Weekly forecast */}
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
