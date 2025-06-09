
import { TidePoint, NoaaTideResponse, TideForecast } from './types';
import { getMoonPhase } from './utils';

// Mock data for when the API is unavailable
const generateMockTideData = (startDate: Date, hours: number = 24): TidePoint[] => {
  const data: TidePoint[] = [];
  const baseHeight = 1.5;
  const amplitude = 0.8;
  const period = 12.42; // lunar semidiurnal tide period in hours
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(startDate);
    time.setHours(time.getHours() + i);
    
    // Simple sine wave to simulate tides
    const angle = (i / period) * 2 * Math.PI;
    const height = baseHeight + amplitude * Math.sin(angle);
    
    const timeString = time.toISOString().replace('T', ' ').substring(0, 16);
    
    data.push({
      time: timeString,
      height,
      isHighTide: null
    });
  }
  
  return data;
};

// Generate mock high/low tide data
const generateMockHighLowData = (startDate: Date, days: number = 1): TidePoint[] => {
  const data: TidePoint[] = [];
  const baseHeight = 1.5;
  const highTideAmplitude = 0.8;
  const lowTideAmplitude = 0.7;
  
  for (let i = 0; i < days; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);
    
    // Morning high tide (around 3-4 AM)
    const morningHigh = new Date(dayDate);
    morningHigh.setHours(3 + Math.random() * 2, Math.floor(Math.random() * 60));
    data.push({
      time: morningHigh.toISOString().replace('T', ' ').substring(0, 16),
      height: baseHeight + highTideAmplitude + (Math.random() * 0.2),
      isHighTide: true
    });
    
    // Morning low tide (around 9-10 AM)
    const morningLow = new Date(dayDate);
    morningLow.setHours(9 + Math.random() * 2, Math.floor(Math.random() * 60));
    data.push({
      time: morningLow.toISOString().replace('T', ' ').substring(0, 16),
      height: baseHeight - lowTideAmplitude - (Math.random() * 0.2),
      isHighTide: false
    });
    
    // Evening high tide (around 15-16 PM / 3-4 PM)
    const eveningHigh = new Date(dayDate);
    eveningHigh.setHours(15 + Math.random() * 2, Math.floor(Math.random() * 60));
    data.push({
      time: eveningHigh.toISOString().replace('T', ' ').substring(0, 16),
      height: baseHeight + highTideAmplitude + (Math.random() * 0.2),
      isHighTide: true
    });
    
    // Evening low tide (around 21-22 PM / 9-10 PM)
    const eveningLow = new Date(dayDate);
    eveningLow.setHours(21 + Math.random() * 2, Math.floor(Math.random() * 60));
    data.push({
      time: eveningLow.toISOString().replace('T', ' ').substring(0, 16),
      height: baseHeight - lowTideAmplitude - (Math.random() * 0.2),
      isHighTide: false
    });
  }
  
  // Sort by time
  return data.sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Generic function to get tide predictions, interval can be '6' (chart) or 'hilo' (high/lows)
 */
export const getTidePredictions = async (
  stationId: string,
  startDate: Date,
  endDate: Date,
  units: 'english' | 'metric' = 'english',
  datum: string = 'MLLW', // Ensure datum is explicitly set
  interval: '6' | 'hilo' = '6' // default: '6' for chart, 'hilo' for hi/lows
): Promise<TidePoint[]> => {
  try {
    const formatDate = (date: Date) =>
      date.toISOString().split('T')[0].replace(/-/g, '');
    const begin_date = formatDate(startDate);
    const end_date = formatDate(endDate);

    // FIX: Ensure datum parameter is always included with a value
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${begin_date}&end_date=${end_date}&station=${stationId}&product=predictions&datum=${datum}&time_zone=lst_ldt&units=${units}&interval=${interval}&application=MoonTide&format=json`;

    console.log('Fetching tide data from URL:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch tide predictions: ${response.status}`);
      
      const data = await response.json() as NoaaTideResponse;
      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('No predictions data available');
      }

      // Map the results
      if (interval === 'hilo') {
        // Only highs/lows: assign isHighTide based on flag in the API (should be 'H' or 'L')
        return data.predictions.map(pred => {
          const isHigh = pred.f === 'H' || /H/i.test(pred.f || '');
          const isLow = pred.f === 'L' || /L/i.test(pred.f || '');
          return {
            time: pred.t,
            height: parseFloat(pred.v),
            isHighTide: isHigh ? true : isLow ? false : null
          };
        });
      } else {
        // For chart curve: all points, no high/low flag (leave as null)
        return data.predictions.map(pred => ({
          time: pred.t,
          height: parseFloat(pred.v),
          isHighTide: null
        }));
      }
    } catch (apiError) {
      console.warn('NOAA API error, using mock tide data:', apiError);
      
      // Calculate days between start and end date
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Use mock data based on interval type
      if (interval === 'hilo') {
        console.log(`Generating ${diffDays} days of mock high/low tide data`);
        return generateMockHighLowData(startDate, diffDays);
      } else {
        // Calculate hours between dates for chart data
        const hours = Math.ceil(diffTime / (1000 * 60 * 60));
        console.log(`Generating ${hours} hours of mock chart tide data`);
        return generateMockTideData(startDate, hours);
      }
    }
  } catch (error) {
    console.error('Error fetching tide predictions:', error);
    
    // Final fallback - always provide some data
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (interval === 'hilo') {
      return generateMockHighLowData(startDate, diffDays);
    } else {
      const hours = Math.ceil(diffTime / (1000 * 60 * 60));
      return generateMockTideData(startDate, hours);
    }
  }
};

/** For the chart (continuous curve) */
export const getChartTideData = async (
  stationId: string, startDate: Date, endDate: Date
) => getTidePredictions(stationId, startDate, endDate, 'english', 'MLLW', '6');

/** For the high/low tide table */
export const getHighLowTideData = async (
  stationId: string, startDate: Date, endDate: Date
) => getTidePredictions(stationId, startDate, endDate, 'english', 'MLLW', 'hilo');

/**
 * Get current tide data for today's chart
 */
export const getCurrentTideData = async (stationId: string) => {
  try {
    // Get today's date at midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Create tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format the date for display
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    const formattedDate = today.toLocaleDateString('en-US', options);
    
    // Format the current time HH:MM
    const currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Get tide data for chart
    const tideData = await getChartTideData(stationId, today, tomorrow);
    
    return {
      tideData,
      date: formattedDate,
      currentTime
    };
  } catch (error) {
    console.error('Error getting current tide data:', error);
    return {
      tideData: [],
      date: new Date().toLocaleDateString(),
      currentTime: new Date().toLocaleTimeString()
    };
  }
};

/**
 * Get weekly tide forecast
 */
export const getWeeklyTideForecast = async (stationId: string): Promise<TideForecast[]> => {
  try {
    // Get today and next 6 days
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 6);
    
    // Get high/low tides for the week
    const weekTides = await getHighLowTideData(stationId, today, endDate);
    
    // Group tides by day
    const tidesByDay = weekTides.reduce((acc: Record<string, TidePoint[]>, tide) => {
      // Extract date part only (YYYY-MM-DD)
      const dateStr = tide.time.split(' ')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(tide);
      return acc;
    }, {});
    
    // Format each day's forecast
    const forecast: TideForecast[] = [];
    
    // Process each day
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Format date string to match tide data format (YYYY-MM-DD)
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Format for display
      const displayDate = currentDate.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Get moon phase for this day
      const { phase, illumination } = getMoonPhase(currentDate);
      
      // Get tides for this day
      const dayTides = tidesByDay[dateStr] || [];
      
      // Find high and low tides
      const highTides = dayTides.filter(tide => tide.isHighTide === true);
      const lowTides = dayTides.filter(tide => tide.isHighTide === false);
      
      // Default values
      let highTide = { time: 'N/A', height: 0 };
      let lowTide = { time: 'N/A', height: 0 };
      
      // Get first high and low tide of the day
      if (highTides.length > 0) {
        const tide = highTides[0];
        const timeOnly = tide.time.split(' ')[1].substring(0, 5); // Extract HH:MM
        highTide = { time: timeOnly, height: tide.height };
      }
      
      if (lowTides.length > 0) {
        const tide = lowTides[0];
        const timeOnly = tide.time.split(' ')[1].substring(0, 5); // Extract HH:MM
        lowTide = { time: timeOnly, height: tide.height };
      }
      
      // Add to forecast
      forecast.push({
        date: displayDate,
        day: dayName,
        moonPhase: phase,
        illumination: illumination,
        highTide,
        lowTide
      });
    }
    
    return forecast;
    
  } catch (error) {
    console.error('Error getting weekly tide forecast:', error);
    return [];
  }
};
