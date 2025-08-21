
import React from 'react';
import { SolarTimes } from '@/utils/solarUtils';

type SolarInfoProps = {
  solarTimes: SolarTimes;
  zipCode?: string;
};

const SolarInfo = ({ solarTimes, zipCode }: SolarInfoProps) => {  
  const isGettingLonger = solarTimes.changeFromPrevious?.includes('+') || solarTimes.changeFromPrevious?.includes('longer');
  const isGettingShorter = solarTimes.changeFromPrevious?.includes('-') || solarTimes.changeFromPrevious?.includes('shorter');

  return (
    <div className="bg-muted/20 backdrop-blur-sm py-3 px-4 rounded-lg text-[11px]">
      {zipCode && (
        <div className="text-center text-[11px] font-medium mb-2 text-muted-foreground">
          Sunrise/Sunset for ZIP {zipCode}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-1 text-[11px] text-center">
        {/* Sunrise */}
        <div className="flex flex-col">
          <span className="text-muted-foreground">Sunrise</span>
          <span className="font-semibold">{solarTimes.sunrise}</span>
        </div>

        {/* Sunset */}
        <div className="flex flex-col">
          <span className="text-muted-foreground">Sunset</span>
          <span className="font-semibold">{solarTimes.sunset}</span>
        </div>

        {/* Total Daylight */}
        <div className="flex flex-col">
          <span className="text-muted-foreground">Daylight</span>
          <span className="font-semibold text-yellow-400">{solarTimes.daylight}</span>
        </div>

        {/* Total Darkness */}
        <div className="flex flex-col">
          <span className="text-muted-foreground">Darkness</span>
          <span className="font-semibold text-blue-400">{solarTimes.darkness}</span>
        </div>

        {/* Change from Previous Day */}
        {solarTimes.changeFromPrevious && (
          <div className="flex items-center justify-center gap-1 col-span-2 sm:col-span-1 whitespace-nowrap">
            <span className="text-muted-foreground">Change</span>
            <span
              className={`font-semibold ${
                isGettingLonger
                  ? 'text-green-400'
                  : isGettingShorter
                  ? 'text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              {solarTimes.changeFromPrevious}
            </span>
          </div>
        )}
      </div>

      {solarTimes.changeSinceSolstice && (
        <div className="mt-3 text-center text-[11px]">
          <div className="text-muted-foreground">
            Since June 21
            <br />
            (Summer Solstice)
          </div>
          <div
            className={`font-semibold ${
              solarTimes.changeSinceSolstice.startsWith('-')
                ? 'text-red-400'
                : 'text-green-400'
            }`}
          >
            Daylight {solarTimes.changeSinceSolstice}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarInfo;
