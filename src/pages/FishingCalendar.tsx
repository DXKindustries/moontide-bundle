import React, { useState, useEffect } from 'react';
import { format, addDays, addMonths, parse } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import StarsBackdrop from '@/components/StarsBackdrop';
import { safeLocalStorage } from '@/utils/localStorage';
import { useTideData } from '@/hooks/useTideData';
import { TideForecast, TidePoint } from '@/services/noaaService';
import { calculateSolarTimes } from '@/utils/solarUtils';
import FishingCalendarHeader from '@/components/fishing/FishingCalendarHeader';
import CalendarCard from '@/components/fishing/CalendarCard';
import SelectedDateDetails from '@/components/fishing/SelectedDateDetails';

// Types for fishing conditions
type MoonPhase = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
                 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

type TideInfo = {
  highTide: { time: string, height: number }[];
  lowTide: { time: string, height: number }[];
};

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
    quality: 'excellent' | 'good' | 'fair';
    reason: string;
  }[];
};

const FishingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [fishingInfo, setFishingInfo] = useState<Record<string, DayFishingInfo>>({});
  const [currentLocation, setCurrentLocation] = useState(() => {
    // Try to get the saved location first
    try {
      const savedLocation = safeLocalStorage.getItem('moontide-current-location');
      if (savedLocation) {
        return savedLocation;
      }
    } catch (error) {
      console.warn('Error reading location data:', error);
    }
    // NO more fallback — begin with null so app prompts for user location
    return null;
  });

  // Fetch real tide data from NOAA
  const { isLoading, error, weeklyForecast, tideData, stationName } = useTideData({ location: currentLocation });

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
      
      if (!time || !period) {
        return now;
      }
      
      let [hours, minutes] = time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return now;
      }
      
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    } catch (error) {
      console.error('Error parsing time string:', error);
      return new Date();
    }
  };

  // Get moon phase from weekly forecast
  const getMoonPhaseFromForecast = (date: Date, forecasts: TideForecast[]): {
    phase: MoonPhase,
    illumination: number
  } => {
    const dateStr = format(date, 'MMM d'); // Format to match forecast date format
    const forecast = forecasts.find(f => f.date === dateStr);
    
    if (forecast) {
      return {
        phase: forecast.moonPhase as MoonPhase,
        illumination: forecast.illumination
      };
    }
    
    // Fallback if no matching forecast found
    return {
      phase: 'Waxing Crescent' as MoonPhase,
      illumination: 35
    };
  };

  // Generate fishing info combining moon data and real tide data
  const generateFishingInfoForDate = (date: Date, forecasts: TideForecast[], tides: TidePoint[]): DayFishingInfo => {
    // Get moon phase from forecasts with fallback
    const { phase: moonPhase, illumination } = forecasts.length > 0 
      ? getMoonPhaseFromForecast(date, forecasts)
      : { phase: 'Waxing Crescent' as MoonPhase, illumination: 35 };
    
    // Generate high and low tides
    const highTides: { time: string, height: number }[] = [];
    const lowTides: { time: string, height: number }[] = [];
    
    // If we have real tide data, use it
    if (tides && tides.length > 0) {
      tides.filter(tide => tide.isHighTide).forEach(tide => {
        highTides.push({
          time: tide.time,
          height: tide.height
        });
      });
      
      tides.filter(tide => !tide.isHighTide).forEach(tide => {
        lowTides.push({
          time: tide.time,
          height: tide.height
        });
      });
    } else {
      // Fallback to mock data
      highTides.push({
        time: '10:30 AM',
        height: 1.5
      });
      
      lowTides.push({
        time: '4:15 PM',
        height: 0.3
      });
    }

    // Calculate real solar times
    const solarTimes = calculateSolarTimes(date);

    // Generate optimal fishing windows based on moon phase and tides
    const optimalFishingWindows = [];
    
    // If we have high tide data and it's a full or new moon
    if (highTides.length > 0 && (moonPhase === 'Full Moon' || moonPhase === 'New Moon')) {
      // Use first high tide as an example
      optimalFishingWindows.push({
        start: highTides[0].time,
        end: format(addHours(parseTime(highTides[0].time), 3), 'h:mm a'),
        quality: 'excellent' as const,
        reason: `${moonPhase} with high tide at ${highTides[0].time}`
      });
    } 
    // If it's a quarter moon with high tide
    else if (highTides.length > 0 && (moonPhase === 'First Quarter' || moonPhase === 'Last Quarter')) {
      optimalFishingWindows.push({
        start: highTides[0].time,
        end: format(addHours(parseTime(highTides[0].time), 2), 'h:mm a'),
        quality: 'good' as const,
        reason: `${moonPhase} with high tide at ${highTides[0].time}`
      });
    }
    
    // Add window for low tide
    if (lowTides.length > 0) {
      optimalFishingWindows.push({
        start: lowTides[0].time,
        end: format(addHours(parseTime(lowTides[0].time), 1), 'h:mm a'),
        quality: 'fair' as const,
        reason: 'Low tide transition'
      });
    }
    
    return {
      date,
      moonPhase,
      illumination,
      tides: {
        highTide: highTides,
        lowTide: lowTides,
      },
      sunrise: solarTimes.sunrise,
      sunset: solarTimes.sunset,
      optimalFishingWindows
    };
  };
  
  // When a date is selected, generate fishing info based on the real tide data
  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Generate fishing info using real tide data or mock data if not available
    const newInfo = generateFishingInfoForDate(date, weeklyForecast, tideData);
    setFishingInfo(prev => ({
      ...prev,
      [dateStr]: newInfo
    }));
  };
  
  // Generate info when tide data is loaded
  useEffect(() => {
    if (selectedDate) {
      handleSelectDate(selectedDate);
    }
  }, [isLoading, weeklyForecast, tideData]);
  
  // Get the currently selected date info
  const selectedDateInfo = selectedDate 
    ? fishingInfo[format(selectedDate, 'yyyy-MM-dd')] 
    : undefined;

  return (
    <div className="min-h-screen pb-8 relative">
      <StarsBackdrop />
      
      <FishingCalendarHeader 
        currentLocation={currentLocation}
        stationName={stationName}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-700 p-3 mb-4 rounded">
            Error loading tide data: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CalendarCard
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            weeklyForecast={weeklyForecast}
          />

          {isLoading ? (
            <Card className="bg-card/50 backdrop-blur-md md:col-span-2">
              <CardContent className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Loading tide data...
                </p>
              </CardContent>
            </Card>
          ) : selectedDateInfo && selectedDate ? (
            <SelectedDateDetails
              selectedDate={selectedDate}
              selectedDateInfo={selectedDateInfo}
            />
          ) : (
            <Card className="bg-card/50 backdrop-blur-md md:col-span-2">
              <CardContent className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground">Select a date to see fishing conditions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default FishingCalendar;
