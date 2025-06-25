import { useState, useEffect } from 'react';
import { getTideData, Prediction } from '@/services/tideDataService';
import { getStationsForUserLocation } from '@/services/noaaService';
import { getCurrentDateString, getCurrentTimeString } from '@/utils/dateTimeUtils';
import { TidePoint } from '@/services/tide/types';
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

        // Otherwise, fetch tide data for the nearest station
        const station = stations[0];
        if (!station?.id) {
          console.warn('No station ID available for location', location);
          setIsLoading(false);
          return;
        }
        const dateIso = new Date().toISOString().split('T')[0];
        const predictions: Prediction[] = await getTideData(station.id, dateIso);

        const tidePoints: TidePoint[] = predictions.map((p) => ({
          time: p.timeIso,
          height: p.valueFt,
          isHighTide: p.kind === 'H' ? true : p.kind === 'L' ? false : null,
        }));

        setTideData(tidePoints);
        setWeeklyForecast([]);
        setCurrentDate(getCurrentDateString());
        setCurrentTime(getCurrentTimeString());
        setStationName(station.name || location.name || null);
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
