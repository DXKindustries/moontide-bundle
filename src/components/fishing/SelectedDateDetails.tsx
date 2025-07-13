
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSolarEvents } from '@/utils/solarUtils';
import SolarEventInfo from './SolarEventInfo';
import MoonPhaseInfo from './MoonPhaseInfo';
import TideInfo from './TideInfo';
import LightConditions from './LightConditions';
import FishingWindows from './FishingWindows';
import FishingTips from './FishingTips';
import { TideCycle } from '@/services/tide/types';
import { safeArray } from '@/utils/safeArray';

type MoonPhase = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
                 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

type DayFishingInfo = {
  date: Date;
  moonPhase: MoonPhase;
  illumination: number;
  tides: TideCycle[];
  sunrise: string;
  sunset: string;
  optimalFishingWindows: {
    start: string;
    end: string;
    quality: 'excellent' | 'good' | 'fair';
    reason: string;
  }[];
};

type SelectedDateDetailsProps = {
  selectedDate: Date;
  selectedDateInfo: DayFishingInfo;
};

const SelectedDateDetails: React.FC<SelectedDateDetailsProps> = ({
  selectedDate,
  selectedDateInfo
}) => {
  const windows = safeArray(selectedDateInfo.optimalFishingWindows);
  const tides = safeArray(selectedDateInfo.tides);
  return (
    <Card className="bg-card/50 backdrop-blur-md md:col-span-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {format(selectedDateInfo.date, 'EEEE, MMMM d, yyyy')}
          </span>
          <div className="flex items-center gap-2">
            {getSolarEvents(selectedDate) && (
              <Badge variant="outline" className="bg-orange-500/20 text-orange-100 border-orange-500/30">
                {getSolarEvents(selectedDate)!.emoji} {getSolarEvents(selectedDate)!.name}
              </Badge>
            )}
            <Badge variant={windows.length > 0 ? "default" : "outline"}>
              {windows.length > 0 ? "Fishing Recommended" : "Regular Day"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {getSolarEvents(selectedDate) && (
          <SolarEventInfo selectedDate={selectedDate} />
        )}

        <MoonPhaseInfo 
          moonPhase={selectedDateInfo.moonPhase}
          illumination={selectedDateInfo.illumination}
          selectedDate={selectedDate}
        />
        
        <TideInfo cycles={tides} />
        
        <LightConditions 
          sunrise={selectedDateInfo.sunrise}
          sunset={selectedDateInfo.sunset}
        />
        
        <FishingWindows windows={windows} />
        
        <FishingTips moonPhase={selectedDateInfo.moonPhase} />
      </CardContent>
    </Card>
  );
};

export default SelectedDateDetails;
