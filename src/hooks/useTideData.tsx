
import { useState, useEffect } from 'react';
import { TidePoint, TideForecast } from '@/services/noaaService';
import { fetchTideDataForLocation } from '@/services/tideDataService';
import { getCurrentDateString, getCurrentTimeString } from '@/utils/dateTimeUtils';
import { generateWeeklyForecastFromCurrentDate } from '@/utils/mockForecastGenerator';

type UseTideDataParams = {
  location: {
    id: string;
    name: string;
    country: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  } | null;
};

type UseTideDataReturn = {
  isLoading: boolean;
  error: string | null;
  tideData: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  stationName: string | null;
};

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  console.log('🪝 useTideData hook called with location:', location);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useTideData effect triggered with location:', location);
    console.log('📍 Location details - ZIP:', location?.zipCode, 'Name:', location?.name, 'Lat/Lng:', location?.lat, location?.lng);
    
    // Always set current date and time, regardless of location
    const newDate = getCurrentDateString();
    const newTime = getCurrentTimeString();
    console.log('📅 Setting current date/time:', { newDate, newTime });
    setCurrentDate(newDate);
    setCurrentTime(newTime);

    // If no location is provided, use calculated forecast with proper dates and moon phases
    if (!location) {
      console.log('⚠️ No location provided, generating calculated weekly forecast');
      
      // Generate weekly forecast with proper moon phase calculations and current dates
      const calculatedForecast = generateWeeklyForecastFromCurrentDate();
      console.log('📅 Generated calculated weekly forecast:', calculatedForecast);
      
      setWeeklyForecast(calculatedForecast);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchTideDataForLocation(location, newDate, newTime);
        
        setTideData(result.tideData);
        setWeeklyForecast(result.weeklyForecast);
        setCurrentDate(result.currentDate);
        setCurrentTime(result.currentTime);
        
        if (result.stationName) {
          setStationName(result.stationName);
          console.log('🏷️ Set station name:', result.stationName);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('💥 Fatal error fetching tide data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        
        // Set empty tide data but use calculated forecast for weekly forecast
        setTideData([]);
        const calculatedForecast = generateWeeklyForecastFromCurrentDate();
        setWeeklyForecast(calculatedForecast);
      }
    };

    fetchData();
  }, [location]);

  const result = {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName
  };

  console.log('🪝 useTideData returning:', {
    ...result,
    tideDataLength: result.tideData.length,
    weeklyForecastLength: result.weeklyForecast.length
  });

  return result;
};
