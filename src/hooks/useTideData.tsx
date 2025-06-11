
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

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stationName, setStationName] = useState<string | null>(null);

  useEffect(() => {
    // If no location is provided, use mock data
    if (!location) {
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTideData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let stationId = null;
        
        // First check the in-memory session cache (fastest and most reliable)
        if (location.id && sessionStationCache.has(location.id)) {
          stationId = sessionStationCache.get(location.id);
          console.log(`Using cached station ID from memory for ${location.id}: ${stationId}`);
        }
        
        // If not in memory cache, try localStorage cache
        if (!stationId && location.id) {
          try {
            stationId = getStationForLocation(location.id);
            if (stationId) {
              // Cache it in memory for this session
              sessionStationCache.set(location.id, stationId);
              console.log(`Found station ID for location ${location.id} in localStorage: ${stationId}`);
            }
          } catch (error) {
            console.warn('Error getting station for location from localStorage:', error);
          }
        }
        
        // If no saved station, find nearest based on coords
        if (!stationId) {
          // Determine coordinates to use
          let lat = 0;
          let lng = 0;
          
          if (location.lat && location.lng) {
            // Use provided coordinates
            lat = location.lat;
            lng = location.lng;
          } else {
            // Use default coordinates based on country
            const defaultCoord = DEFAULT_COORDINATES[location.country] || 
                              DEFAULT_COORDINATES['USA'];
            lat = defaultCoord.lat;
            lng = defaultCoord.lng;
          }
          
          console.log(`Looking up nearest station for ${location.name} at coordinates: ${lat}, ${lng}`);
          
          // Find nearest station
          try {
            const station = await getNearestStation(lat, lng);
            
            if (!station) {
  setStationName("FORCED FALLBACK: Winchendon, CA");
  throw new Error('No nearby tide stations found');
}

            
            stationId = station.id;
            setStationName(station.name);
            console.log(`Found nearest station: ${station.name} (${stationId})`);
            
            // Cache it both in localStorage and memory
            if (location.id) {
              try {
                saveStationForLocation(location.id, stationId);
                // Always update the session cache
                sessionStationCache.set(location.id, stationId);
              } catch (error) {
                console.warn('Error saving station for location to localStorage:', error);
                // Still update the session cache
                sessionStationCache.set(location.id, stationId);
              }
            }
          } catch (stationError) {
            console.error('Error finding nearest station:', stationError);
            throw new Error('Could not find a nearby tide station');
          }
        }
        
        // Get current tide data for chart
        try {
          const currentData = await getCurrentTideData(stationId);
          setTideData(currentData.tideData);
          setCurrentDate(currentData.date);
          setCurrentTime(currentData.currentTime);
        } catch (currentDataError) {
          console.error('Error getting current tide data:', currentDataError);
          throw new Error('Failed to fetch current tide data');
        }
        
        // Get weekly forecast
        try {
          const forecast = await getWeeklyTideForecast(stationId);
          setWeeklyForecast(forecast);
        } catch (forecastError) {
          console.error('Error getting weekly forecast:', forecastError);
          // Don't fail completely if just the forecast fails
          setWeeklyForecast([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tide data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        
        // Set empty data
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
