import React, { useState, useEffect } from 'react';
import { format, addDays, addMonths, parse } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudMoon, Moon, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import StarsBackdrop from '@/components/StarsBackdrop';
import { safeLocalStorage } from '@/utils/localStorage';
import { useTideData } from '@/hooks/useTideData';
import { TideForecast, TidePoint } from '@/services/noaaService';
import { getFullMoonName, isFullMoon, getMoonEmoji } from '@/utils/lunarUtils';
import { getSolarEvents, calculateSolarTimes } from '@/utils/solarUtils';

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
    // Fall back to default
    return {
      id: "sf",
      name: "San Francisco", 
      country: "USA",
      zipCode: "94105"
    };
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

  // Define modifiers for the calendar (for styling full/new moon dates and solar events)
  const modifiers = {
    fullMoon: (date: Date) => {
      // Check if this date corresponds to a full moon in our forecast data
      const dateStr = format(date, 'MMM d');
      const forecast = weeklyForecast.find(f => f.date === dateStr);
      return forecast ? isFullMoon(forecast.moonPhase) : false;
    },
    newMoon: (date: Date) => {
      // Check if this date corresponds to a new moon in our forecast data
      const dateStr = format(date, 'MMM d');
      const forecast = weeklyForecast.find(f => f.date === dateStr);
      return forecast ? forecast.moonPhase === 'New Moon' : false;
    },
    solarEvent: (date: Date) => {
      return getSolarEvents(date) !== null;
    }
  };

  // Get moon phase visual class
  const getMoonPhaseVisual = (phase: MoonPhase) => {
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

  return (
    <div className="min-h-screen pb-8 relative">
      {/* Stars background */}
      <StarsBackdrop />
      
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudMoon className="h-8 w-8 text-moon-primary mr-2" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
                MoonTide
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden md:inline">
                {currentLocation.name}, {currentLocation.country}
                {currentLocation.zipCode && ` (${currentLocation.zipCode})`}
                {stationName && ` - ${stationName}`}
              </span>
              <Link to="/">
                <Button variant="ghost" className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-700 p-3 mb-4 rounded">
            Error loading tide data: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Fishing Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                modifiers={modifiers}
                modifiersClassNames={{
                  fullMoon: "bg-yellow-400/20 text-yellow-100",
                  newMoon: "bg-gray-600/20 text-gray-100", 
                  solarEvent: "bg-orange-400/20 text-orange-100"
                }}
                footer={
                  <div className="mt-3 pt-3 border-t border-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-muted-foreground">Full Moon</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-xs text-muted-foreground">New Moon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-xs text-muted-foreground">Solar Event</span>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Selected day details */}
          {isLoading ? (
            <Card className="bg-card/50 backdrop-blur-md md:col-span-2">
              <CardContent className="flex items-center justify-center h-full p-12">
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Loading tide data...
                </p>
              </CardContent>
            </Card>
          ) : selectedDateInfo ? (
            <Card className="bg-card/50 backdrop-blur-md md:col-span-2">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {format(selectedDateInfo.date, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Solar event indicator */}
                    {selectedDate && getSolarEvents(selectedDate) && (
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-100 border-orange-500/30">
                        {getSolarEvents(selectedDate)!.emoji} {getSolarEvents(selectedDate)!.name}
                      </Badge>
                    )}
                    <Badge variant={selectedDateInfo.optimalFishingWindows.length > 0 ? "default" : "outline"}>
                      {selectedDateInfo.optimalFishingWindows.length > 0 ? "Fishing Recommended" : "Regular Day"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Solar event information - show if present */}
                {selectedDate && getSolarEvents(selectedDate) && (
                  <div className="p-4 rounded-md bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getSolarEvents(selectedDate)!.emoji}</span>
                      <h3 className="text-lg font-medium text-orange-100">{getSolarEvents(selectedDate)!.name}</h3>
                    </div>
                    <p className="text-orange-200">{getSolarEvents(selectedDate)!.description}</p>
                  </div>
                )}

                {/* Moon phase info */}
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 rounded-full ${getMoonPhaseVisual(selectedDateInfo.moonPhase)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getMoonEmoji(selectedDateInfo.moonPhase)}</span>
                      <h3 className="text-lg font-medium">{selectedDateInfo.moonPhase}</h3>
                    </div>
                    <p className="text-muted-foreground">Illumination: {selectedDateInfo.illumination}%</p>
                    {/* Show full moon name if applicable */}
                    {isFullMoon(selectedDateInfo.moonPhase) && selectedDate && (
                      <div className="mt-2">
                        {(() => {
                          const fullMoonName = getFullMoonName(selectedDate);
                          return fullMoonName ? (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-500/30">
                              🌕 {fullMoonName.name}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tide information */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Tide Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">High Tides</h4>
                      {selectedDateInfo.tides.highTide.length > 0 ? (
                        selectedDateInfo.tides.highTide.map((tide, i) => (
                          <div key={`high-${i}`} className="flex justify-between">
                            <span>{tide.time}</span>
                            <span className="font-semibold">{tide.height.toFixed(1)}m</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No high tide data available</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Low Tides</h4>
                      {selectedDateInfo.tides.lowTide.length > 0 ? (
                        selectedDateInfo.tides.lowTide.map((tide, i) => (
                          <div key={`low-${i}`} className="flex justify-between">
                            <span>{tide.time}</span>
                            <span className="font-semibold">{tide.height.toFixed(1)}m</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No low tide data available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Daylight information */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Light Conditions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sunrise</p>
                      <p className="font-semibold">{selectedDateInfo.sunrise}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sunset</p>
                      <p className="font-semibold">{selectedDateInfo.sunset}</p>
                    </div>
                  </div>
                </div>
                
                {/* Fishing windows */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Optimal Fishing Windows</h3>
                  {selectedDateInfo.optimalFishingWindows.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateInfo.optimalFishingWindows.map((window, idx) => (
                        <div key={idx} className="p-3 rounded-md bg-muted/30 backdrop-blur-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{window.start} - {window.end}</span>
                            <Badge variant={
                              window.quality === 'excellent' ? 'default' :
                              window.quality === 'good' ? 'secondary' : 'outline'
                            }>
                              {window.quality.charAt(0).toUpperCase() + window.quality.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{window.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No optimal fishing windows for this day.</p>
                  )}
                </div>
                
                {/* Fishing tips based on conditions */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Fishing Tips</h3>
                  {selectedDateInfo.moonPhase === 'Full Moon' ? (
                    <p>During a full moon, fish tend to feed more actively at night. Focus on the outgoing tide after high tide for best results.</p>
                  ) : selectedDateInfo.moonPhase === 'New Moon' ? (
                    <p>New moon provides excellent night fishing with minimal light. Fish are often less cautious during this time.</p>
                  ) : (
                    <p>Quarter moon phases provide moderate fishing conditions. Focus on the tide transitions for best results.</p>
                  )}
                </div>
              </CardContent>
            </Card>
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
