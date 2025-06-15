
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Sunrise, Sunset } from "lucide-react";
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
  className?: string;
};

const SolarInfo = ({ solarTimes, className }: SolarInfoProps) => {
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-yellow-500/20 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-100">Daylight</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Sunrise className="h-3 w-3 text-orange-400" />
              <span className="font-semibold">{solarTimes.sunrise}</span>
            </div>
            
            <div className="text-muted-foreground">
              {solarTimes.daylight}
            </div>
            
            <div className="flex items-center gap-1">
              <Sunset className="h-3 w-3 text-red-400" />
              <span className="font-semibold">{solarTimes.sunset}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolarInfo;
