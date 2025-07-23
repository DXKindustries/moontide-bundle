import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, addMonths, parse } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import StarsBackdrop from '@/components/StarsBackdrop';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import { TideForecast, TideCycle } from '@/services/tide/types';
import { calculateSolarTimes } from '@/utils/solarUtils';
import FishingCalendarHeader from '@/components/fishing/FishingCalendarHeader';
import CalendarCard from '@/components/fishing/CalendarCard';
import SelectedDateDetails from '@/components/fishing/SelectedDateDetails';

// Types for calendar conditions (was: fishing conditions)
type MoonPhase =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

type TideInfo = TideCycle[];

type DayFishingInfo = {
  date: Date;
  moonPhase: MoonPhase;
  illumination: number;
  tides: TideInfo;
  sunrise: string;
  sunset: string;
  optimalFishingWindows: {
    start: string;
    end: string;
    quality: 'good' | 'fair';
    reason: string;
  }[];
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [fishingInfo, setFishingInfo] = useState<Record<string, DayFishingInfo>>({});
  const { currentLocation, selectedStation } = useLocationState();

  // Fetch real tide data from NOAA
  const { isLoading, error, weeklyForecast, stationName } = useTideData({ location: currentLocation, station: selectedStation });

  // Helper function to add hours to a date
  const addHours = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  // Helper function to parse time string to Date
  const parseTime = (timeStr: string): Date => {
    try {
      const now = new Date();
      const [time, period] = timeStr.split(' ');
      if (!time || !period) return now;
      const [rawHours, minutes] = time.split(':').map(Number);
      let hours = rawHours;
      if (isNaN(hours) || isNaN(minutes)) return now;
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    } catch (error) {
      return new Date();
    }
  };

  // Get moon phase from weekly forecast
  const getMoonPhaseFromForecast = (
    date: Date,
    forecasts: TideForecast[]
  ): { phase: MoonPhase; illumination: number } => {
    const dateStr = format(date, 'yyyy-MM-dd'); // Match forecast date string
    const forecast = forecasts.find((f) => f.date === dateStr);
    if (forecast) {
      return {
        phase: forecast.moonPhase as MoonPhase,
        illumination: forecast.illumination,
      };
    }
    // Fallback if no matching forecast found
    return {
      phase: 'Waxing Crescent' as MoonPhase,
      illumination: 35,
    };
  };

  // Generate info combining moon data and real tide data
  const generateFishingInfoForDate = useCallback(
    (date: Date, forecasts: TideForecast[]): DayFishingInfo => {
      // Get moon phase from forecasts with fallback
      const { phase: moonPhase, illumination } =
        forecasts.length > 0
          ? getMoonPhaseFromForecast(date, forecasts)
          : { phase: 'Waxing Crescent' as MoonPhase, illumination: 35 };

      // Pull tides for this date from the weekly forecast
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayForecast = forecasts.find((f) => f.date === dateStr);
      const cycles: TideCycle[] =
        dayForecast?.cycles?.slice().sort((a, b) =>
          a.first.time.localeCompare(b.first.time)
        ) || [];

      const allEvents = cycles.flatMap((c) => [c.first, c.second]);
      const highTides = allEvents.filter((e) => e.isHigh);
      const lowTides = allEvents.filter((e) => !e.isHigh);

      // Calculate solar times using the user's coordinates when available
      const solarTimes = calculateSolarTimes(
        date,
        currentLocation?.lat ?? 41.4353,
        currentLocation?.lng ?? -71.4616
      );

      // Calculate optimal fishing windows (example logic)
      const optimalFishingWindows: {
        start: string;
        end: string;
        quality: 'good' | 'fair';
        reason: string;
      }[] = [];

      // Add window for high tide
      if (highTides.length > 0) {
        optimalFishingWindows.push({
          start: highTides[0].time,
          end: format(addHours(parseTime(highTides[0].time), 1), 'h:mm a'),
          quality: 'good',
          reason: 'High tide transition',
        });
      }

      // Add window for low tide
      if (lowTides.length > 0) {
        optimalFishingWindows.push({
          start: lowTides[0].time,
          end: format(addHours(parseTime(lowTides[0].time), 1), 'h:mm a'),
          quality: 'fair',
          reason: 'Low tide transition',
        });
      }

      return {
        date,
        moonPhase,
        illumination,
        tides: cycles,
        sunrise: solarTimes.sunrise,
        sunset: solarTimes.sunset,
        optimalFishingWindows,
      };
    },
    [currentLocation]
  );

  // When a date is selected, generate info based on the real tide data
  const handleSelectDate = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      if (!date) return;

      const dateStr = format(date, 'yyyy-MM-dd');

      // Generate info using real tide data
      const newInfo = generateFishingInfoForDate(date, weeklyForecast);
      setFishingInfo((prev) => ({
        ...prev,
        [dateStr]: newInfo,
      }));
    },
    [generateFishingInfoForDate, weeklyForecast]
  );

  // Generate info when tide data is loaded
  useEffect(() => {
    if (selectedDate) {
      handleSelectDate(selectedDate);
    }
  }, [handleSelectDate, selectedDate]);

  // Get the currently selected date info
  const selectedDateInfo = selectedDate ? fishingInfo[format(selectedDate, 'yyyy-MM-dd')] : undefined;

  return (
    <div className="min-h-screen pb-8 pt-24 relative">
      <StarsBackdrop />

      <FishingCalendarHeader currentLocation={currentLocation} stationName={stationName} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-700 p-3 mb-4 rounded">
            Error loading tide data: {error}
          </div>
        )}

        <div className="w-full">
          <CalendarCard selectedDate={selectedDate} />
        </div>

        {selectedDateInfo && (
          <SelectedDateDetails info={selectedDateInfo} isLoading={isLoading} />
        )}
      </main>
    </div>
  );
};

export default Calendar;
