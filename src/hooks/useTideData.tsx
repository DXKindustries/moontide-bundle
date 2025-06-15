
import { useState, useEffect } from 'react';
import { 
  getNearestStation, 
  getTidePredictions,
  getCurrentTideData,
  getWeeklyTideForecast,
  getStationForLocation,
  saveStationForLocation,
  TidePoint,
  TideForecast
} from '@/services/noaaService';

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

// Default coordinates for locations without lat/lng
const DEFAULT_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'USA': { lat: 37.7749, lng: -122.4194 }, // San Francisco
  'United States': { lat: 37.7749, lng: -122.4194 },
  'UK': { lat: 51.5074, lng: -0.1278 }, // London
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'Australia': { lat: -33.8688, lng: 151.2093 }, // Sydney
  'Canada': { lat: 43.6532, lng: -79.3832 }, // Toronto
};

// Memory cache for station lookups during the session
const sessionStationCache = new Map<string, string>();

// Helper function to get current date string
const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to get current time string
const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useTideData effect triggered with location:', location);
    
    // Always set current date and time, regardless of location
    setCurrentDate(getCurrentDateString());
    setCurrentTime(getCurrentTimeString());

    // If no location is provided, use mock data but keep current date/time
    if (!location) {
      console.log('⚠️ No location provided, using mock data');
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTideData = async () => {
      try {
        console.log('🚀 Starting tide data fetch for location:', location.name);
        setIsLoading(true);
        setError(null);
        
        let stationId = null;
        
        // First check the in-memory session cache (fastest and most reliable)
        if (location.id && sessionStationCache.has(location.id)) {
          stationId = sessionStationCache.get(location.id);
          console.log(`✅ Using cached station ID from memory for ${location.id}: ${stationId}`);
        }
        
        // If not in memory cache, try localStorage cache
        if (!stationId && location.id) {
          try {
            stationId = getStationForLocation(location.id);
            if (stationId) {
              // Cache it in memory for this session
              sessionStationCache.set(location.id, stationId);
              console.log(`✅ Found station ID for location ${location.id} in localStorage: ${stationId}`);
            }
          } catch (error) {
            console.warn('⚠️ Error getting station for location from localStorage:', error);
          }
        }
        
        // If no saved station, find nearest based on coords and ZIP
        if (!stationId) {
          // Determine coordinates to use
          let lat = 0;
          let lng = 0;
          
          if (location.lat && location.lng) {
            // Use provided coordinates
            lat = location.lat;
            lng = location.lng;
            console.log(`📍 Using provided coordinates: ${lat}, ${lng}`);
          } else {
            // Use default coordinates based on country
            const defaultCoord = DEFAULT_COORDINATES[location.country] || 
                              DEFAULT_COORDINATES['USA'];
            lat = defaultCoord.lat;
            lng = defaultCoord.lng;
            console.log(`📍 Using default coordinates for ${location.country}: ${lat}, ${lng}`);
          }
          
          console.log(`🔍 Looking up nearest station for ${location.name} at coordinates: ${lat}, ${lng}`);
          
          // Find nearest station - now prioritizes ZIP mapping
          try {
            console.log('🌐 Calling getNearestStation API...');
            const station = await getNearestStation(lat, lng);
            
            if (!station) {
              console.error('❌ No nearby tide stations found');
              throw new Error('No nearby tide stations found');
            }
            
            stationId = station.id;
            setStationName(station.name);
            console.log(`✅ Found nearest station: ${station.name} (${stationId})`);
            
            // Cache it both in localStorage and memory
            if (location.id) {
              try {
                saveStationForLocation(location.id, stationId);
                sessionStationCache.set(location.id, stationId);
                console.log(`💾 Saved station mapping to cache: ${location.id} -> ${stationId}`);
              } catch (error) {
                console.warn('⚠️ Error saving station for location to localStorage:', error);
                sessionStationCache.set(location.id, stationId);
              }
            }
          } catch (stationError) {
            console.error('❌ Error finding nearest station:', stationError);
            throw new Error('Could not find a nearby tide station');
          }
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
          
          setTideData(currentData.tideData);
          
          // Only update date if we got a valid date from the API
          if (currentData.date) {
            const apiDate = new Date(currentData.date);
            const formattedDate = apiDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
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
          setWeeklyForecast(forecast);
        } catch (forecastError) {
          console.error('⚠️ Error getting weekly forecast (non-fatal):', forecastError);
          setWeeklyForecast([]);
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

  return {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName
  };
};
