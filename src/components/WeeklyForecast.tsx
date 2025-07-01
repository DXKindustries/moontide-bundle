
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import LocationDisplay from './LocationDisplay';
import { SavedLocation } from './LocationSelector';
import { getFullMoonName, isFullMoon, getMoonEmoji } from '@/utils/lunarUtils';
import { formatApiDate, formatIsoToAmPm } from '@/utils/dateTimeUtils';
import { TideCycle } from '@/services/tide/types';

type DayForecast = {
  date: string;
  day: string;
  moonPhase: string;
  illumination: number;
  cycles: TideCycle[];
};

type WeeklyForecastProps = {
  forecast: DayForecast[];
  isLoading?: boolean;
  className?: string;
  currentLocation?: (SavedLocation & { id: string; country: string }) | null;
  stationName?: string | null;
  stationId?: string | null;
};

const WeeklyForecast = ({
  forecast,
  isLoading = false,
  className,
  currentLocation,
  stationName,
  stationId
}: WeeklyForecastProps) => {
  // Get moon phase visual class
  const getMoonPhaseVisual = (phase: string) => {
    switch (phase) {
      case "New Moon":
        return "bg-moon-dark border-2 border-moon-primary";
      case "Waxing Crescent":
        return "bg-gradient-to-r from-moon-primary to-moon-dark";
      case "First Quarter":
        return "bg-gradient-to-r from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waxing Gibbous":
        return "bg-gradient-to-l from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Full Moon":
        return "moon-gradient";
      case "Waning Gibbous":
        return "bg-gradient-to-r from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Last Quarter":
        return "bg-gradient-to-l from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waning Crescent":
        return "bg-gradient-to-l from-moon-primary to-moon-dark";
      default:
        return "moon-gradient";
    }
  };

  // NOAA provides times without any timezone information and in the station's
  // local time zone. Using the JS Date constructor would incorrectly interpret
  // them as UTC and shift the displayed time. Instead, format the raw string
  // directly without timezone conversion.
  const formatTimeToAMPM = (timeString: string) => formatIsoToAmPm(timeString);

  const renderSkeletonForecast = () => {
    return Array(7).fill(0).map((_, index) => (
      <div
        key={index}
        className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md bg-muted/50"
      >
        <div className="w-20">
          <Skeleton className="h-5 w-12 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>

        <div className="flex items-center space-x-3 flex-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <div>
            <Skeleton className="h-3 w-14 mb-1" />
            <Skeleton className="h-4 w-8 mb-1" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div>
            <Skeleton className="h-3 w-14 mb-1" />
            <Skeleton className="h-4 w-8 mb-1" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle>7-Day Forecast</CardTitle>
        <LocationDisplay
          currentLocation={currentLocation || null}
          stationName={stationName || null}
          stationId={stationId || null}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            renderSkeletonForecast()
          ) : forecast.length === 0 ? (
            <div className="text-center py-8">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">No forecast data available</p>
              <p className="text-sm text-muted-foreground mt-1">
                There might be an issue connecting to the NOAA API. Try selecting a different location.
              </p>
            </div>
          ) : (
            forecast.map((day, index) => {
              // Parse the date to get full moon name if applicable
              const dayDate = new Date(formatApiDate(day.date));
              const fullMoonName = isFullMoon(day.moonPhase) ? getFullMoonName(dayDate) : null;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md",
                    index === 0 ? "bg-muted" : "hover:bg-muted transition-colors"
                  )}
                >
                  {/* Day and Date */}
                  <div className="w-20">
                    <p className="font-medium">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.date}</p>
                  </div>

                  {/* Moon Phase */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-full ${getMoonPhaseVisual(day.moonPhase)}`}></div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Moon Phase</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getMoonEmoji(day.moonPhase)}</span>
                        <span className="text-sm">
                          {day.moonPhase}
                          {fullMoonName && (
                            <span className="text-yellow-400 font-medium"> – {fullMoonName.name}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tide Info - display two tide cycles per day */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    {day.cycles.map((cycle, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Cycle {idx + 1}</p>
                        <p>
                          {(cycle.first.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.first.time)} - {(cycle.second.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.second.time)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyForecast;
