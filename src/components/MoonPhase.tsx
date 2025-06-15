
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFullMoonName, isFullMoon } from '@/utils/lunarUtils';
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
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="text-xl md:text-2xl">{phase}</span>
            {fullMoonName && (
              <FullMoonBanner fullMoonName={fullMoonName} />
            )}
          </div>
          <span className="text-moon-primary text-sm">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-8">
          {/* Moon Visual */}
          <div className="relative flex-shrink-0">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full animate-float shadow-lg ${getMoonPhaseVisual()}`}></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 bg-gradient-to-t from-moon-primary/20 to-transparent w-20 md:w-24 h-8 md:h-10 blur-md rounded-full"></div>
          </div>
          
          {/* Stats Grid - 2x2 layout */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Illumination</p>
              <p className="text-2xl font-bold text-moon-primary">{illumination}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Moonrise</p>
              <p className="text-2xl font-bold">{moonrise}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Moonset</p>
              <p className="text-2xl font-bold">{moonset}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Next Phase</p>
              <p className="text-2xl font-bold">In 3 days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoonPhase;
