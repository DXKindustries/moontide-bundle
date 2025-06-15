
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateSolarTimes, getSolarEvents } from '@/utils/solarUtils';
import { Sunrise, Sunset, Sun } from 'lucide-react';

type SolarInfoProps = {
  date: string;
  className?: string;
}

const SolarInfo = ({ date, className }: SolarInfoProps) => {
  const currentDate = new Date(date);
  const solarTimes = calculateSolarTimes(currentDate);
  const solarEvent = getSolarEvents(currentDate);

  return (
    <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-400" />
            <span className="text-lg">Solar Info</span>
          </div>
          <span className="text-yellow-400 text-sm">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sunrise className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-muted-foreground text-xs">Sunrise</p>
            <p className="text-base font-semibold">{solarTimes.sunrise}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sun className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-muted-foreground text-xs">Daylight</p>
            <p className="text-base font-semibold text-yellow-400">{solarTimes.daylight}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sunset className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-muted-foreground text-xs">Sunset</p>
            <p className="text-base font-semibold">{solarTimes.sunset}</p>
          </div>
        </div>

        {solarEvent && (
          <div className="mt-4 pt-3 border-t border-muted">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">{solarEvent.emoji}</span>
                <span className="font-medium text-yellow-400">{solarEvent.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{solarEvent.description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolarInfo;
