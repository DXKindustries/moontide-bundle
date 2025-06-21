import { useState, useEffect } from 'react';
import { getTideData } from '@/services/tideDataService';
import { getStationsForUserLocation } from '@/services/noaaService';
import { getCurrentDateString, getCurrentTimeString } from '@/utils/dateTimeUtils';

// Types (adjust if you have real types)
type TidePoint = any;
type TideForecast = any;

type UseTideDataParams = {
  location: {
    id: string;        // stationId
    name: string;      // user label, city/state, etc
    country?: string;
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
  isInland: boolean;
};

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);
  const [isInland, setIsInland] = useState<boolean>(false);

  useEffect(() => {
    setCurrentDate(getCurrentDateString());
    setCurrentTime(getCurrentTimeString());

    if (!location) {
      setIsLoading(false);
      setError(null);
      setTideData([]);
      setWeeklyForecast([]);
      setStationName(null);
      setIsInland(false);
      return;
    }

    const checkInlandAndFetch = async () => {
      setIsLoading(true);
      setError(null);
      setIsInland(false);

      try {
        // Always check if any stations exist for this location
        const stations = await getStationsForUserLocation(location.name);

        if (!stations || stations.length === 0) {
          setIsInland(true);
          setTideData([]);
          setWeeklyForecast([]);
          setStationName(null);
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch tide data for the selected station
        const stationId = location.id;
        const result = await getTideData(location.name, stationId);

        setTideData(result.data?.tideData || []);
        setWeeklyForecast(result.data?.weeklyForecast || []);
        setCurrentDate(result.data?.currentDate || getCurrentDateString());
        setCurrentTime(result.data?.currentTime || getCurrentTimeString());
        setStationName(result.data?.stationName || location.name || null);
        setIsInland(false);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        setTideData([]);
        setWeeklyForecast([]);
        setStationName(null);
        setIsInland(false);
      }
    };

    checkInlandAndFetch();
  }, [location]);

  return {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName,
    isInland,
  };
};
