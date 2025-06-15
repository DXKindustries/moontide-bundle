
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon } from '@/utils/lunarUtils';
import { calculateSolarTimes } from '@/utils/solarUtils';
import { Sunrise, Sunset, MapPin, AlertCircle, Info, Search } from 'lucide-react';
import FullMoonBanner from './FullMoonBanner';
import { Button } from "@/components/ui/button";

type MoonPhaseProps = {
  phase: string;
  illumination: number;
  moonrise: string;
  moonset: string;
  date: string;
  className?: string;
  currentLocation?: any;
  stationName?: string | null;
  error?: string | null;
  onGetStarted?: () => void;
}

const MoonPhase = ({ 
  phase, 
  illumination, 
  moonrise, 
  moonset, 
  date,
  className,
  currentLocation,
  stationName,
  error,
  onGetStarted
}: MoonPhaseProps) => {
  console.log('MoonPhase rendering with:', { phase, illumination, currentLocation, stationName, error });
  console.log('MoonPhase onGetStarted function:', onGetStarted);

  // Get full moon name if applicable
  const currentDate = new Date(date);
  const fullMoonName = isFullMoon(phase) ? getFullMoonName(currentDate) : null;

  // Calculate solar times for today using actual location coordinates
  const solarTimes = calculateSolarTimes(
    currentDate, 
    currentLocation?.lat || 41.4353, 
    currentLocation?.lng || -71.4616
  );

  // Calculate visual representation of moon phase
  const getMoonPhaseVisual = () => {
    switch (phase) {
      case "New Moon":
        return "bg-moon-dark border-2 border-moon-primary";
      case "Waxing Crescent":
        return "bg-gradient-to-r from-moon-primary to-moon-dark";
      case "First Quarter":
        return "bg-gradient-to-r from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waxing Gibbous":
        return "bg-gradient-to-l from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Full Moon":
        return "moon-gradient";
      case "Waning Gibbous":
        return "bg-gradient-to-r from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Last Quarter":
        return "bg-gradient-to-l from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waning Crescent":
        return "bg-gradient-to-l from-moon-primary to-moon-dark";
      default:
        return "moon-gradient";
    }
  };

  const formatLocationDisplay = () => {
    if (!currentLocation) return "Select a location";
    
    if (currentLocation.zipCode) {
      return `${currentLocation.name} (${currentLocation.zipCode})`;
    }
    if (currentLocation.name && currentLocation.country) {
      return `${currentLocation.name}, ${currentLocation.country}`;
    }
    return currentLocation.name || "Select a location";
  };

  const handleGetStartedClick = () => {
    console.log('Enter Your Location button clicked');
    console.log('onGetStarted function available:', !!onGetStarted);
    if (onGetStarted) {
      onGetStarted();
    } else {
      console.error('onGetStarted function not provided');
    }
  };

  return (
    <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <span>{phase}</span>
            {fullMoonName && (
              <FullMoonBanner fullMoonName={fullMoonName} />
            )}
          </div>
          <span className="text-moon-primary text-sm">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Large Moon Visual - Center Focus */}
        <div className="relative">
          <div className={`w-36 h-36 rounded-full animate-float shadow-lg ${getMoonPhaseVisual()}`}></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 bg-gradient-to-t from-moon-primary/20 to-transparent w-24 h-12 blur-md rounded-full"></div>
        </div>
        
        {/* Moon Data Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Illumination</p>
            <p className="text-lg font-semibold text-moon-primary">{illumination}%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Moonrise</p>
            <p className="text-lg font-semibold">{moonrise}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Moonset</p>
            <p className="text-lg font-semibold">{moonset}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Next Phase</p>
            <p className="text-lg font-semibold">In 3 days</p>
          </div>
        </div>

        {/* Solar Information with Integrated Location and Error - Bottom Section */}
        <div className="border-t border-muted pt-4 w-full space-y-4">
          {/* Solar Times Row */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-orange-400" />
              <div className="text-center">
                <p className="text-muted-foreground">Sunrise</p>
                <p className="font-semibold">{solarTimes.sunrise}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Daylight</p>
              <p className="font-semibold text-yellow-400">{solarTimes.daylight}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-muted-foreground">Sunset</p>
                <p className="font-semibold">{solarTimes.sunset}</p>
              </div>
              <Sunset className="h-4 w-4 text-red-400" />
            </div>
          </div>

          {/* Conditional Bottom Section */}
          {!currentLocation ? (
            /* Onboarding Information - Show when no location is selected */
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs bg-moon-primary/10 border border-moon-primary/20 py-3 px-3 rounded-lg">
                <Info className="h-3 w-3 text-moon-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-moon-primary">Welcome to MoonTide!</div>
                  <div className="text-muted-foreground space-y-1">
                    <div>• Enter a coastal ZIP code for tide data</div>
                    <div>• Moon and solar data available for all locations</div>
                    <div>• Track phases, tides, and fishing conditions</div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleGetStartedClick}
                className="w-full bg-moon-primary hover:bg-moon-primary/90 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Enter Your Location
              </Button>
            </div>
          ) : (
            /* Location Display and Error - Show when location is selected */
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs bg-muted/30 backdrop-blur-sm py-2 px-3 rounded-lg">
                <MapPin size={12} className="text-moon-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {formatLocationDisplay()}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {stationName && !error ? (
                      <>NOAA station: <span className="font-medium">{stationName}</span></>
                    ) : (
                      <>No tide data - try a coastal ZIP code</>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message - Show when there's an error */}
              {error && (
                <div className="flex items-start gap-2 text-xs bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg">
                  <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-red-400">Error</div>
                    <div className="text-red-300 mt-1">
                      {error}. Using mock data instead.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoonPhase;
