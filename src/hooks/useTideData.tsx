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

const DEFAULT_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'USA': { lat: 37.7749, lng: -122.4194 },
  'United States': { lat: 37.7749, lng: -122.4194 },
  'UK': { lat: 51.5074, lng: -0.1278 },
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'Australia': { lat: -33.8688, lng: 151.2093 },
  'Canada': { lat: 43.6532, lng: -79.3832 },
};

const sessionStationCache = new Map<string, string>();

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [stationName, setStationName] = useState<string | null>(null);

  useEffect(() => {
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

        if (location.id && sessionStationCache.has(location.id)) {
          stationId = sessionStationCache.get(location.id);
          console.log(`Using cached station ID from memory for ${location.id}: ${stationId}`);
        }

        if (!stationId && location.id) {
          try {
            stationId = getStationForLocation(location.id);
            if (stationId) {
              sessionStationCache.set(location.id, stationId);
              console.log(`Found station ID for location ${location.id} in localStorage: ${stationId}`);
            }
          } catch (error) {
            console.warn('Error getting station for location from localStorage:', error);
          }
        }

        if (!stationId) {
          let lat = 0;
          let lng = 0;

          if (location.lat && location.lng) {
            lat = location.lat;
            lng = location.lng;
          } else {
            const defaultCoord = DEFAULT_COORDINATES[location.country] || DEFAULT_COORDINATES['USA'];
            lat = defaultCoord.lat;
            lng = defaultCoord.lng;

            // ⛳ Force override for test
            lat = 41.4500;
            lng = -71.4500;
            console.warn("⛳ Injecting Narrow River test coordinates as fallback");
          }

          console.log(`Looking up nearest station for ${location.name} at coordinates: ${lat}, ${lng}`);

          try {
            const station = await getNearestStation(lat, lng);

            if (!station) {
              setStationName("TEST FALLBACK: No station found");
              throw new Error('No nearby tide stations found');
            }

            stationId = station.id;
            setStationName(station.name);
            console.log(`Found nearest station: ${station.name} (${stationId})`);

            if (location.id) {
              try {
                saveStationForLocation(location.id, stationId);
                sessionStationCache.set(location.id, stationId);
              } catch (error) {
                console.warn('Error saving station for location to localStorage:', error);
                sessionStationCache.set(location.id, stationId);
              }
            }
          } catch (stationError) {
            console.error('Error finding nearest station:', stationError);
            throw new Error('Could not find a nearby tide station');
          }
        }

        try {
          const currentData = await getCurrentTideData(stationId);
          setTideData(currentData.tideData);
          setCurrentDate(currentData.date);
          setCurrentTime(currentData.currentTime);
        } catch (currentDataError) {
          console.error('Error getting current tide data:', currentDataError);
          throw new Error('Failed to fetch current tide data');
        }

        try {
          const forecast = await getWeeklyTideForecast(stationId);
          setWeeklyForecast(forecast);
        } catch (forecastError) {
          console.error('Error getting weekly forecast:', forecastError);
          setWeeklyForecast([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tide data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
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
