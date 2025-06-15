
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon } from '@/utils/lunarUtils';
import { calculateSolarTimes } from '@/utils/solarUtils';
import FullMoonBanner from './FullMoonBanner';
import MoonVisual from './MoonVisual';
import MoonData from './MoonData';
import SolarInfo from './SolarInfo';
import OnboardingInfo from './OnboardingInfo';
import LocationInfo from './LocationInfo';
import { LocationData } from '@/types/locationTypes';

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
  onGetStarted?: (location?: LocationData) => void;
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

  // Fixed location detection logic - check for actual meaningful location data
  const hasLocation = currentLocation && 
    currentLocation !== null && 
    (
      // Valid ZIP code that's not empty or default
      (currentLocation.zipCode && 
       currentLocation.zipCode !== '' && 
       currentLocation.zipCode !== 'default') ||
      
      // Valid name that's not a placeholder  
      (currentLocation.name && 
       currentLocation.name !== '' && 
       currentLocation.name !== 'Select a location' && 
       currentLocation.name !== 'Choose Location' &&
       currentLocation.name !== 'Unknown Location') ||
       
      // Valid cityState combination
      (currentLocation.cityState && 
       currentLocation.cityState !== '' &&
       currentLocation.cityState !== ', ')
    );

  console.log('MoonPhase hasLocation check:', { 
    hasLocation, 
    currentLocation, 
    zipCode: currentLocation?.zipCode,
    name: currentLocation?.name,
    cityState: currentLocation?.cityState,
    id: currentLocation?.id
  });

  return (
    <div className="w-full">
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
          <MoonVisual phase={phase} illumination={illumination} />
          
          {/* Moon Data Grid - 2x2 Layout */}
          <MoonData 
            illumination={illumination}
            moonrise={moonrise}
            moonset={moonset}
          />

          {/* Solar Information with Integrated Location and Error - Bottom Section */}
          <div className="border-t border-muted pt-4 w-full space-y-4">
            {/* Solar Times Row */}
            <SolarInfo solarTimes={solarTimes} />

            {/* Conditional Bottom Section - Show onboarding when NO location, show location info when HAS location */}
            {hasLocation ? (
              /* Location Display and Error - Show when location is selected */
              <LocationInfo 
                currentLocation={currentLocation}
                stationName={stationName}
                error={error}
              />
            ) : (
              /* Onboarding Information - Show when no location is selected */
              <OnboardingInfo onGetStarted={onGetStarted!} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoonPhase;
