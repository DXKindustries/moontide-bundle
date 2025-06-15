
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Sunrise, Sunset, Clock } from "lucide-react";
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
  className?: string;
};

const SolarInfo = ({ solarTimes, className }: SolarInfoProps) => {
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-yellow-500/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span className="font-medium text-yellow-100">Daylight</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col items-center">
            <Sunrise className="h-4 w-4 text-orange-400 mb-1" />
            <span className="text-muted-foreground">Sunrise</span>
            <span className="font-semibold">{solarTimes.sunrise}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 text-yellow-400 mb-1" />
            <span className="text-muted-foreground">Duration</span>
            <span className="font-semibold">{solarTimes.daylight}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Sunset className="h-4 w-4 text-red-400 mb-1" />
            <span className="text-muted-foreground">Sunset</span>
            <span className="font-semibold">{solarTimes.sunset}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolarInfo;
