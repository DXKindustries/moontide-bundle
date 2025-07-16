import React from 'react';
import MoonPhase from '@/components/MoonPhase';
import TideChart from '@/components/TideChart';
import WeeklyForecast from '@/components/WeeklyForecast';
import { TidePoint, TideForecast } from '@/services/tide/types';
import { LocationData } from '@/types/locationTypes';
import { SavedLocation } from './LocationSelector';
import { formatApiDate } from '@/utils/dateTimeUtils';
import { calculateMoonPhase } from '@/utils/lunarUtils';

interface MainContentProps {
  error: string | null;
  isLoading: boolean;
  tideData: TidePoint[];
  tideEvents: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  currentLocation: (SavedLocation & { id: string; country: string }) | null;
  stationName: string | null;
  stationId: string | null;
  banner?: string | null;
  onGetStarted?: (location?: LocationData) => void;
}

export default function MainContent({
  error,
  isLoading,
  tideData,
  tideEvents,
  weeklyForecast,
  currentDate,
  currentTime,
  currentLocation,
  stationName,
  stationId,
  banner,
  onGetStarted
}: MainContentProps) {
  const { phase, illumination } = calculateMoonPhase(new Date(currentDate));

  const moonPhaseData = {
    phase,
    illumination,
    moonrise: "18:42",
    moonset: "07:15",
    date: formatApiDate(currentDate)
  };

  const hasData = tideData.length > 0 || weeklyForecast.length > 0;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoonPhase
          phase={moonPhaseData.phase}
          illumination={moonPhaseData.illumination}
          moonrise={moonPhaseData.moonrise}
          moonset={moonPhaseData.moonset}
          date={moonPhaseData.date}
          currentLocation={currentLocation}
          onGetStarted={onGetStarted}
          hasData={hasData}
        />

        <TideChart
          curve={tideData}
          events={tideEvents}
          date={currentDate}
          currentTime={currentTime}
          isLoading={isLoading}
          currentLocation={currentLocation}
          stationName={stationName}
          stationId={stationId}
          banner={banner}
        />
      </div>

      <div className="mt-6">
        <WeeklyForecast
          forecast={weeklyForecast}
          isLoading={isLoading}
          currentLocation={currentLocation}
          stationName={stationName}
          stationId={stationId}
          banner={banner}
        />
      </div>
    </main>
  );
}