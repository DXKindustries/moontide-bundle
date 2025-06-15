
import { 
  getCurrentTideData,
  getWeeklyTideForecast,
  TidePoint,
  TideForecast
} from '@/services/noaaService';
import { getStationId } from '@/services/locationService';
import { formatApiDate } from '@/utils/dateTimeUtils';
import { generateMockWeeklyForecast } from '@/utils/mockForecastGenerator';

type Location = {
  id: string;
  name: string;
  country: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
};

type TideDataResult = {
  tideData: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  stationName: string | null;
};

export const fetchTideDataForLocation = async (
  location: Location,
  currentDate: string,
  currentTime: string
): Promise<TideDataResult> => {
  console.log('🚀 Starting tide data fetch for location:', location.name);
  console.log('🔍 Location ZIP code for station lookup:', location.zipCode);
  
  // Get station ID using the location service
  console.log('🏭 Calling getStationId...');
  const { stationId, stationName: foundStationName } = await getStationId(location);
  console.log('🏭 getStationId returned:', { stationId, foundStationName });
  console.log('🎯 Station mapping result - Station ID:', stationId, 'Station Name:', foundStationName);
  
  console.log(`🌊 Fetching tide data for station: ${stationId}`);
  
  let resultDate = currentDate;
  let resultTime = currentTime;
  let tideData: TidePoint[] = [];
  
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
    
    tideData = currentData.tideData;
    console.log('📊 Set tide data with length:', currentData.tideData.length);
    
    // Only update date if we got a valid date from the API
    if (currentData.date) {
      const formattedDate = formatApiDate(currentData.date);
      resultDate = formattedDate;
      console.log(`📅 Updated date from API: ${formattedDate}`);
    } else {
      console.log('📅 No date from API, keeping current date');
    }
    
    // Only update time if we got valid time from the API
    if (currentData.currentTime) {
      resultTime = currentData.currentTime;
      console.log(`⏰ Updated time from API: ${currentData.currentTime}`);
    } else {
      console.log('⏰ No time from API, keeping current time');
    }
  } catch (currentDataError) {
    console.error('❌ Error getting current tide data:', currentDataError);
    throw new Error('Failed to fetch current tide data');
  }
  
  // Get weekly forecast
  let weeklyForecast: TideForecast[] = [];
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
    
    weeklyForecast = forecast;
    console.log('📅 Set weekly forecast with length:', forecast.length);
  } catch (forecastError) {
    console.error('⚠️ Error getting weekly forecast (non-fatal):', forecastError);
    // If API fails, generate mock forecast as fallback
    const mockForecast = generateMockWeeklyForecast();
    console.log('📅 Using mock weekly forecast as fallback');
    weeklyForecast = mockForecast;
  }
  
  console.log('✅ Tide data fetch completed successfully');
  
  return {
    tideData,
    weeklyForecast,
    currentDate: resultDate,
    currentTime: resultTime,
    stationName: foundStationName
  };
};
