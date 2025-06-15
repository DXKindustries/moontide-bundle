
import React from 'react';
import MoonPhase from '@/components/MoonPhase';
import TideChart from '@/components/TideChart';
import WeeklyForecast from '@/components/WeeklyForecast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TidePoint, TideForecast } from '@/services/noaaService';

interface MainContentProps {
  error: string | null;
  isLoading: boolean;
  tideData: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
}

export default function MainContent({ 
  error, 
  isLoading, 
  tideData, 
  weeklyForecast, 
  currentDate, 
  currentTime 
}: MainContentProps) {
  const moonPhaseData = {
    phase: weeklyForecast.length > 0 ? weeklyForecast[0].moonPhase : "Waxing Crescent",
    illumination: weeklyForecast.length > 0 ? weeklyForecast[0].illumination : 35,
    moonrise: "18:42",
    moonset: "07:15",
    date: currentDate || "May 21, 2025"
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}. Using mock data instead.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoonPhase
          phase={moonPhaseData.phase}
          illumination={moonPhaseData.illumination}
          moonrise={moonPhaseData.moonrise}
          moonset={moonPhaseData.moonset}
          date={moonPhaseData.date}
        />

        <TideChart
          data={tideData}
          date={currentDate || moonPhaseData.date}
          currentTime={currentTime}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6">
        <WeeklyForecast
          forecast={weeklyForecast}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
