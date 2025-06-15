
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon } from '@/utils/lunarUtils';
import { calculateSolarTimes } from '@/utils/solarUtils';
import { Sunrise, Sunset } from 'lucide-react';
import FullMoonBanner from './FullMoonBanner';

type MoonPhaseProps = {
  phase: string;
  illumination: number;
  moonrise: string;
  moonset: string;
  date: string;
  className?: string;
}

const MoonPhase = ({ 
  phase, 
  illumination, 
  moonrise, 
  moonset, 
  date,
  className 
}: MoonPhaseProps) => {
  // Get full moon name if applicable
  const currentDate = new Date(date);
  const fullMoonName = isFullMoon(phase) ? getFullMoonName(currentDate) : null;

  // Calculate solar times for today
  const solarTimes = calculateSolarTimes(currentDate);

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
      <CardContent className="flex flex-col items-center">
        {/* Large Moon Visual - Center Focus */}
        <div className="relative mb-8">
          <div className={`w-36 h-36 rounded-full animate-float shadow-lg ${getMoonPhaseVisual()}`}></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 bg-gradient-to-t from-moon-primary/20 to-transparent w-24 h-12 blur-md rounded-full"></div>
        </div>
        
        {/* Moon Data Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
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

        {/* Solar Information - Bottom Section with Icons */}
        <div className="border-t border-muted pt-4 w-full">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MoonPhase;
