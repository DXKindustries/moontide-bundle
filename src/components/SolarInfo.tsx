
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
    <div className="space-y-3">
      {/* Sunrise and Sunset Row */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <Sunrise className="h-4 w-4 text-orange-400" />
          <div className="text-center">
            <p className="text-muted-foreground">Sunrise</p>
            <p className="font-semibold">{solarTimes.sunrise}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <p className="text-muted-foreground">Sunset</p>
            <p className="font-semibold">{solarTimes.sunset}</p>
          </div>
          <Sunset className="h-4 w-4 text-red-400" />
        </div>
      </div>

      {/* Daylight Duration and Change Row */}
      <div className="bg-muted/20 backdrop-blur-sm py-2 px-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-muted-foreground">Total Daylight</p>
              <p className="font-semibold text-yellow-400">{solarTimes.daylight}</p>
            </div>
          </div>
          
          {solarTimes.changeFromPrevious && (
            <div className="flex items-center gap-2">
              {isGettingLonger && <TrendingUp className="h-4 w-4 text-green-400" />}
              {isGettingShorter && <TrendingDown className="h-4 w-4 text-red-400" />}
              <div className="text-right">
                <p className="text-muted-foreground">Change</p>
                <p className={`font-semibold text-xs ${
                  isGettingLonger ? 'text-green-400' : 
                  isGettingShorter ? 'text-red-400' : 
                  'text-muted-foreground'
                }`}>
                  {solarTimes.changeFromPrevious}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolarInfo;
