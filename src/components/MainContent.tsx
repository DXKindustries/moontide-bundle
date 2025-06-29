
import React from 'react';
import MoonPhase from '@/components/MoonPhase';
import TideChart from '@/components/TideChart';
import WeeklyForecast from '@/components/WeeklyForecast';
import { TidePoint, TideForecast } from '@/services/tide/types';
import { LocationData } from '@/types/locationTypes';
import { formatApiDate } from '@/utils/dateTimeUtils';

interface MainContentProps {
  error: string | null;
  isLoading: boolean;
  tideData: TidePoint[];
  tideEvents: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  currentLocation: any;
  stationName: string | null;
  stationId: string | null;
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
  onGetStarted
}: MainContentProps) {
  const moonPhaseData = {
    phase: weeklyForecast.length > 0 ? weeklyForecast[0].moonPhase : "Waxing Crescent",
    illumination: weeklyForecast.length > 0 ? weeklyForecast[0].illumination : 35,
    moonrise: "18:42",
    moonset: "07:15",
    date: formatApiDate(currentDate)
  };

  console.log('MainContent onGetStarted function:', onGetStarted);

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
          stationName={stationName}
          stationId={stationId}
          error={error}
          onGetStarted={onGetStarted}
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
        />
      </div>

      <div className="mt-6">
        <WeeklyForecast
          forecast={weeklyForecast}
          isLoading={isLoading}
          currentLocation={currentLocation}
          stationName={stationName}
          stationId={stationId}
        />
      </div>
    </main>
  );
}
