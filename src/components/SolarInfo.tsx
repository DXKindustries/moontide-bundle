
import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
};

const SolarInfo = ({ solarTimes }: SolarInfoProps) => {
  return (
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
  );
};

export default SolarInfo;
