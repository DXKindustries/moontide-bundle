
import React from 'react';
import { Sunrise, Sunset, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
};

const SolarInfo = ({ solarTimes }: SolarInfoProps) => {
  const isGettingLonger = solarTimes.changeFromPrevious?.includes('+') || solarTimes.changeFromPrevious?.includes('longer');
  const isGettingShorter = solarTimes.changeFromPrevious?.includes('-') || solarTimes.changeFromPrevious?.includes('shorter');

  return (
    <div className="bg-muted/20 backdrop-blur-sm py-2 px-3 rounded-lg">
      <div className="flex justify-between items-center text-xs gap-4">
        {/* Sunrise */}
        <div className="flex items-center gap-1">
          <Sunrise className="h-3 w-3 text-orange-400" />
          <span className="font-semibold">{solarTimes.sunrise}</span>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-1">
          <Sunset className="h-3 w-3 text-red-400" />
          <span className="font-semibold">{solarTimes.sunset}</span>
        </div>

        {/* Total Daylight */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-yellow-400" />
          <span className="font-semibold text-yellow-400">{solarTimes.daylight}</span>
        </div>

        {/* Change from Previous Day */}
        {solarTimes.changeFromPrevious && (
          <div className="flex items-center gap-1">
            {isGettingLonger && <TrendingUp className="h-3 w-3 text-green-400" />}
            {isGettingShorter && <TrendingDown className="h-3 w-3 text-red-400" />}
            <span className={`font-semibold ${
              isGettingLonger ? 'text-green-400' : 
              isGettingShorter ? 'text-red-400' : 
              'text-muted-foreground'
            }`}>
              {solarTimes.changeFromPrevious}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarInfo;
