
import { useState, useEffect } from 'react';
import { TidePoint, TideForecast } from '@/services/noaaService';
import { fetchTideDataForLocation } from '@/services/tideDataService';
import { getCurrentDateString, getCurrentTimeString } from '@/utils/dateTimeUtils';

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

// Check if location is likely inland based on common inland state/region patterns
const isLikelyInlandLocation = (location: { zipCode?: string; name?: string; lat?: number; lng?: number }) => {
  if (!location.zipCode && !location.name) return false;
  
  // Common inland ZIP code patterns (very rough heuristic)
  const zipCode = location.zipCode;
  if (zipCode) {
    // Some inland regions (this is a basic check - in real app you'd use a more comprehensive database)
    const inlandZipPrefixes = [
      '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', // Western MA (many inland)
      '050', '051', '052', '053', '054', '055', '056', '057', '058', '059', // Vermont (mostly inland)
      '600', '601', '602', '603', '604', '605', '606', '607', '608', '609', // Illinois (mostly inland)
      '800', '801', '802', '803', '804', '805', '806', '807', '808', '809', // Colorado (landlocked)
    ];
    
    const zipPrefix = zipCode.substring(0, 3);
    if (inlandZipPrefixes.includes(zipPrefix)) {
      return true;
    }
  }
  
  // Check city name for obvious inland indicators
  const name = location.name?.toLowerCase() || '';
  const inlandKeywords = ['lake', 'mountain', 'valley', 'hills', 'forest', 'park', 'falls'];
  if (inlandKeywords.some(keyword => name.includes(keyword))) {
    return true;
  }
  
  return false;
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

    // If no location is provided, just set loading to false
    if (!location) {
      console.log('⚠️ No location provided');
      setIsLoading(false);
      setError(null);
      setTideData([]);
      setWeeklyForecast([]);
      setStationName(null);
      return;
    }

    // Check if this is likely an inland location
    if (isLikelyInlandLocation(location)) {
      console.log('🏔️ Detected likely inland location, skipping tide data fetch');
      setIsLoading(false);
      setError(null);
      setTideData([]); // Empty array will trigger the inland message in TideChart
      setWeeklyForecast([]);
      setStationName(null);
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
        
        // Set empty tide data on error
        setTideData([]);
        setWeeklyForecast([]);
        setStationName(null);
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
