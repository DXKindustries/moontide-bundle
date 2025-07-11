
import React from 'react';
import { Sunrise, Sunset, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
  zipCode?: string;
};

const SolarInfo = ({ solarTimes, zipCode }: SolarInfoProps) => {
  console.log('🌅 SolarInfo received solarTimes:', solarTimes);
  
  const isGettingLonger = solarTimes.changeFromPrevious?.includes('+') || solarTimes.changeFromPrevious?.includes('longer');
  const isGettingShorter = solarTimes.changeFromPrevious?.includes('-') || solarTimes.changeFromPrevious?.includes('shorter');

  return (
    <div className="bg-muted/20 backdrop-blur-sm py-3 px-4 rounded-lg">
      {zipCode && (
        <div className="text-center text-xs font-medium mb-2 text-muted-foreground">
          Sunrise/Sunset for ZIP {zipCode}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-3 text-xs text-center">
        {/* Sunrise */}
        <div className="flex flex-col items-center">
          <Sunrise className="h-4 w-4 text-orange-400 mb-1" />
          <span className="text-muted-foreground">Sunrise</span>
          <span className="font-semibold">{solarTimes.sunrise}</span>
        </div>

        {/* Sunset */}
        <div className="flex flex-col items-center">
          <Sunset className="h-4 w-4 text-red-400 mb-1" />
          <span className="text-muted-foreground">Sunset</span>
          <span className="font-semibold">{solarTimes.sunset}</span>
        </div>

        {/* Total Daylight */}
        <div className="flex flex-col items-center">
          <Clock className="h-4 w-4 text-yellow-400 mb-1" />
          <span className="text-muted-foreground">Daylight</span>
          <span className="font-semibold text-yellow-400">{solarTimes.daylight}</span>
        </div>

        {/* Total Darkness */}
        <div className="flex flex-col items-center">
          <Clock className="h-4 w-4 text-blue-400 mb-1" />
          <span className="text-muted-foreground">Darkness</span>
          <span className="font-semibold text-blue-400">{solarTimes.darkness}</span>
        </div>

        {/* Change from Previous Day */}
        {solarTimes.changeFromPrevious && (
          <div className="flex flex-col items-center">
            {isGettingLonger && <TrendingUp className="h-4 w-4 text-green-400 mb-1" />}
            {isGettingShorter && <TrendingDown className="h-4 w-4 text-red-400 mb-1" />}
            {!isGettingLonger && !isGettingShorter && <Clock className="h-4 w-4 text-muted-foreground mb-1" />}
            <span className="text-muted-foreground">Change</span>
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
