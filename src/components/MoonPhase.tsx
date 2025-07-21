import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon, calculateMoonPhase } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';
import FullMoonBanner from './FullMoonBanner';
import MoonVisual from './MoonVisual';
import MoonData from './MoonData';
import SunCard from './SunCard';
import SolarEventInfo from './fishing/SolarEventInfo';
import { LocationData } from '@/types/locationTypes';
import { SavedLocation } from './LocationSelector';

type MoonPhaseProps = {
  phase: string;
  illumination: number;
  moonrise: string;
  moonset: string;
  date: string;
  className?: string;
  currentLocation?: (SavedLocation & { id: string; country: string }) | null;
  onGetStarted?: (location?: LocationData) => void;
  hasData?: boolean;
}

const MoonPhase = ({
  phase,
  illumination,
  moonrise,
  moonset,
  date,
  className,
  currentLocation,
  onGetStarted,
  hasData
}: MoonPhaseProps) => {
  console.log('Moon phase function used in UI:', calculateMoonPhase.name);
  // Simplified location detection - just check if location exists and has basic data
  const hasLocation = Boolean(
    currentLocation &&
    (
      currentLocation.zipCode ||
      currentLocation.cityState ||
      (typeof currentLocation.lat === 'number' && typeof currentLocation.lng === 'number')
    )
  );

  console.log('🌙 MoonPhase - Location check:', {
    hasCurrentLocation: !!currentLocation,
    hasLocation,
    zipCode: currentLocation?.zipCode,
    city: currentLocation?.city
  });

  // Calculate the actual moon phase for today
  const currentDate = React.useMemo(() => new Date(date), [date]);
  const actualMoonPhase = React.useMemo(
    () => calculateMoonPhase(currentDate),
    [currentDate]
  );

  const actualPhase = actualMoonPhase.phase;
  const actualIllumination = actualMoonPhase.illumination;

  // Get full moon name if applicable
  const fullMoonName = isFullMoon(actualPhase) ? getFullMoonName(currentDate) : null;

  // Calculate solar times using location coordinates or defaults
  const lat = currentLocation?.lat ?? 41.4353; // Default to Newport, RI
  const lng = currentLocation?.lng ?? -71.4616;

  const solarEvent = getSolarEvents(currentDate);

  return (
    <div className="w-full">
      <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
        <CardHeader className="flex flex-col items-center space-y-2 py-4">
          <MoonVisual phase={actualPhase} illumination={actualIllumination} />
          <CardTitle className="text-center text-lg sm:text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
            {actualPhase}
          </CardTitle>
          {fullMoonName && <FullMoonBanner fullMoonName={fullMoonName} />}
          <p className="text-sm text-muted-foreground -mt-1">{date}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">

          <MoonData
            illumination={actualIllumination}
            moonrise={moonrise}
            moonset={moonset}
          />

          <div className="border-t border-muted pt-4 w-full space-y-4">
            <SunCard lat={lat} lng={lng} date={currentDate} zipCode={currentLocation?.zipCode} />
            {solarEvent && <SolarEventInfo selectedDate={currentDate} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoonPhase;
