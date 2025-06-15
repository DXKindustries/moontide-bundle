
import { useState, useEffect } from 'react';
import { 
  getCurrentTideData,
  getWeeklyTideForecast,
  TidePoint,
  TideForecast
} from '@/services/noaaService';
import { getStationId } from '@/services/locationService';
import { getCurrentDateString, getCurrentTimeString, formatApiDate } from '@/utils/dateTimeUtils';
import { calculateMoonPhase } from '@/utils/lunarUtils';

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

// Generate mock weekly forecast data for demo purposes
const generateMockWeeklyForecast = (): TideForecast[] => {
  const forecast: TideForecast[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Calculate actual moon phase for each specific day
    const moonData = calculateMoonPhase(date);
    
    // Generate realistic tide times and heights with proper progression
    const baseHighTime1 = 6 + (i * 0.8); // Gradually shifting tide times
    const baseHighTime2 = 18 + (i * 0.8);
    const baseLowTime1 = 12 + (i * 0.8);
    const baseLowTime2 = 0 + (i * 0.8);
    
    const formatTime = (hour: number) => {
      const h = Math.floor(hour) % 24;
      const m = Math.floor((hour % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    forecast.push({
      date: dateStr,
      day,
      moonPhase: moonData.phase, // Use calculated moon phase for this specific date
      illumination: moonData.illumination, // Use calculated illumination for this specific date
      highTide: {
        time: formatTime(baseHighTime1),
        height: 3.2 + Math.sin(i * 0.5) * 0.8 // Varying heights between 2.4-4.0m
      },
      lowTide: {
        time: formatTime(baseLowTime1),
        height: 0.6 + Math.sin(i * 0.3) * 0.4 // Varying heights between 0.2-1.0m
      }
    });
  }
  
  console.log('📅 Generated mock weekly forecast with calculated moon phases:', forecast.map(f => ({
    date: f.date,
    day: f.day,
    moonPhase: f.moonPhase,
    illumination: f.illumination
  })));
  
  return forecast;
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

    // If no location is provided, use mock data but include weekly forecast
    if (!location) {
      console.log('⚠️ No location provided, generating mock data including weekly forecast');
      
      // Generate mock weekly forecast with proper moon phase calculations
      const mockForecast = generateMockWeeklyForecast();
      console.log('📅 Generated mock weekly forecast:', mockForecast);
      
      setWeeklyForecast(mockForecast);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTideData = async () => {
      try {
        console.log('🚀 Starting tide data fetch for location:', location.name);
        console.log('🔍 Location ZIP code for station lookup:', location.zipCode);
        setIsLoading(true);
        setError(null);
        
        // Get station ID using the location service
        console.log('🏭 Calling getStationId...');
        const { stationId, stationName: foundStationName } = await getStationId(location);
        console.log('🏭 getStationId returned:', { stationId, foundStationName });
        console.log('🎯 Station mapping result - Station ID:', stationId, 'Station Name:', foundStationName);
        
        if (foundStationName) {
          setStationName(foundStationName);
          console.log('🏷️ Set station name:', foundStationName);
        }
        
        console.log(`🌊 Fetching tide data for station: ${stationId}`);
        
        // Get current tide data for chart
        try {
          console.log('📊 Calling getCurrentTideData API...');
          const currentData = await getCurrentTideData(stationId);
          console.log('📊 getCurrentTideData response:', {
            tideDataLength: currentData.tideData.length,
            date: currentData.date,
            currentTime: currentData.currentTime,
            sampleData: currentData.tideData.slice(0, 3)
          });
          
          // Log first few data points to verify they're for the right location
          if (currentData.tideData.length > 0) {
            console.log('🌊 First few tide data points:', currentData.tideData.slice(0, 5));
          }
          
          setTideData(currentData.tideData);
          console.log('📊 Set tide data with length:', currentData.tideData.length);
          
          // Only update date if we got a valid date from the API
          if (currentData.date) {
            const formattedDate = formatApiDate(currentData.date);
            setCurrentDate(formattedDate);
            console.log(`📅 Updated date from API: ${formattedDate}`);
          } else {
            console.log('📅 No date from API, keeping current date');
          }
          
          // Only update time if we got valid time from the API
          if (currentData.currentTime) {
            setCurrentTime(currentData.currentTime);
            console.log(`⏰ Updated time from API: ${currentData.currentTime}`);
          } else {
            console.log('⏰ No time from API, keeping current time');
          }
        } catch (currentDataError) {
          console.error('❌ Error getting current tide data:', currentDataError);
          throw new Error('Failed to fetch current tide data');
        }
        
        // Get weekly forecast
        try {
          console.log('📅 Calling getWeeklyTideForecast API...');
          const forecast = await getWeeklyTideForecast(stationId);
          console.log('📅 getWeeklyTideForecast response:', {
            forecastLength: forecast.length,
            sampleForecast: forecast.slice(0, 2)
          });
          
          // Log forecast details to verify correctness
          if (forecast.length > 0) {
            console.log('📊 First forecast day details:', forecast[0]);
          }
          
          setWeeklyForecast(forecast);
          console.log('📅 Set weekly forecast with length:', forecast.length);
        } catch (forecastError) {
          console.error('⚠️ Error getting weekly forecast (non-fatal):', forecastError);
          // If API fails, generate mock forecast as fallback
          const mockForecast = generateMockWeeklyForecast();
          console.log('📅 Using mock weekly forecast as fallback');
          setWeeklyForecast(mockForecast);
        }
        
        console.log('✅ Tide data fetch completed successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('💥 Fatal error fetching tide data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        
        // Set empty data but keep current date/time
        setTideData([]);
        setWeeklyForecast([]);
      }
    };

    fetchTideData();
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
