
import { 
  getCurrentTideData,
  getWeeklyTideForecast,
  TidePoint,
  TideForecast
} from '@/services/noaaService';
import { getStationId } from '@/services/locationService';
import { formatApiDate } from '@/utils/dateTimeUtils';

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
  console.log('🚀 Starting live tide data fetch for location:', location.name);
  console.log('🔍 Location ZIP code for station lookup:', location.zipCode);
  
  // Get station ID using the location service
  console.log('🏭 Calling getStationId...');
  const { stationId, stationName: foundStationName } = await getStationId(location);
  console.log('🏭 getStationId returned:', { stationId, foundStationName });
  console.log('🎯 Station mapping result - Station ID:', stationId, 'Station Name:', foundStationName);
  
  console.log(`🌊 Fetching live tide data for station: ${stationId}`);
  
  let resultDate = currentDate;
  let resultTime = currentTime;
  let tideData: TidePoint[] = [];
  let weeklyForecast: TideForecast[] = [];
  
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
  
  // Get weekly forecast from NOAA API
  try {
    console.log('📅 Calling getWeeklyTideForecast API...');
    weeklyForecast = await getWeeklyTideForecast(stationId);
    console.log('📅 Got weekly forecast from NOAA:', weeklyForecast.slice(0, 2));
  } catch (weeklyError) {
    console.error('❌ Error getting weekly forecast:', weeklyError);
    // Don't throw - allow the app to work with just daily data
    weeklyForecast = [];
  }
  
  console.log('✅ Live tide data fetch completed successfully');
  
  return {
    tideData,
    weeklyForecast,
    currentDate: resultDate,
    currentTime: resultTime,
    stationName: foundStationName
  };
};
