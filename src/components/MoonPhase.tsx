
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon, calculateMoonPhase } from '@/utils/lunarUtils';
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
  // Simplified location detection - just check if currentLocation exists and has a zipCode
  const hasLocation = !!(currentLocation?.zipCode);
  
  console.log('🌙 MoonPhase - Simplified check:', {
    currentLocationExists: !!currentLocation,
    zipCode: currentLocation?.zipCode,
    hasLocation
  });

  // Calculate the actual moon phase for today instead of using props
  const currentDate = new Date(date);
  const actualMoonPhase = calculateMoonPhase(currentDate);
  
  console.log('🌙 Calculated moon phase:', actualMoonPhase);
  console.log('🌙 Props moon phase:', { phase, illumination });

  // Use calculated values instead of props
  const actualPhase = actualMoonPhase.phase;
  const actualIllumination = actualMoonPhase.illumination;

  // Get full moon name if applicable
  const fullMoonName = isFullMoon(actualPhase) ? getFullMoonName(currentDate) : null;

  // Calculate solar times for today using actual location coordinates
  const solarTimes = calculateSolarTimes(
    currentDate, 
    currentLocation?.lat || 41.4353, 
    currentLocation?.lng || -71.4616
  );

  return (
    <div className="w-full">
      <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <span>{actualPhase}</span>
              {fullMoonName && (
                <FullMoonBanner fullMoonName={fullMoonName} />
              )}
            </div>
            <span className="text-moon-primary text-sm">{date}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Large Moon Visual - Center Focus */}
          <MoonVisual phase={actualPhase} illumination={actualIllumination} />
          
          {/* Moon Data Grid - 2x2 Layout */}
          <MoonData 
            illumination={actualIllumination}
            moonrise={moonrise}
            moonset={moonset}
          />

          {/* Solar Information with Integrated Location and Error - Bottom Section */}
          <div className="border-t border-muted pt-4 w-full space-y-4">
            {/* Solar Times Row */}
            <SolarInfo solarTimes={solarTimes} />

            {/* Conditional Bottom Section */}
            {hasLocation ? (
              <LocationInfo 
                currentLocation={currentLocation}
                stationName={stationName}
                error={error}
              />
            ) : (
              <OnboardingInfo onGetStarted={onGetStarted!} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoonPhase;
