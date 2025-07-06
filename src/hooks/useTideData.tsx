import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { isSameDay } from 'date-fns';
import { getTideData, Prediction, buildNoaaUrl } from '@/services/tideDataService';
import { fetchSixMinuteRange } from '@/services/tide/tideService';
import { Station } from '@/services/tide/stationService';
import { getCurrentIsoDateString, getCurrentTimeString, formatDateAsLocalIso } from '@/utils/dateTimeUtils';
import { TidePoint, TideForecast, TideCycle, TideEvent } from '@/services/tide/types';
import { calculateMoonPhase } from '@/utils/lunarUtils';

interface UseTideDataParams {
  location: {
    id: string;
    name: string;
    country?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  } | null;
  station?: Station | null;
}

interface UseTideDataReturn {
  isLoading: boolean;
  error: string | null;
  tideData: TidePoint[];
  tideEvents: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  stationName: string | null;
  stationId: string | null;
  isInland: boolean;
}

export const useTideData = ({ location, station }: UseTideDataParams): UseTideDataReturn => {
  // State declarations
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [tideEvents, setTideEvents] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate] = useState(getCurrentIsoDateString());
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [isInland, setIsInland] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoized station selection
  const nearestStation = useMemo(() => {
    if (!location?.lat || !location.lng || !stations.length) return null;
    
    return stations.reduce((closest, s) => {
      const dist = getDistanceKm(location.lat!, location.lng!, s.latitude, s.longitude);
      return !closest || dist < closest.distance ? { ...s, distance: dist } : closest;
    }, null as (Station & { distance: number }) | null);
  }, [stations, location?.lat, location?.lng]);

  // Process and format tide data
  const processTideData = useCallback((predictions: Prediction[], detailed: any) => {
    const tidePoints: TidePoint[] = predictions.map(p => ({
      time: p.timeIso,
      height: p.valueFt,
      isHighTide: p.kind === 'H' ? true : p.kind === 'L' ? false : null,
    }));

    const detailedPoints: TidePoint[] = Array.isArray(detailed?.predictions)
      ? detailed.predictions.map((p: { t: string; v: string }) => ({
          time: `${p.t.replace(' ', 'T')}:00`,
          height: parseFloat(p.v),
          isHighTide: null
        }))
      : [];

    // Group events by day for forecast
    const eventsByDate: Record<string, TideEvent[]> = {};
    tidePoints.forEach(tp => {
      if (tp.isHighTide === null) return;
      const date = tp.time.slice(0, 10);
      if (!eventsByDate[date]) eventsByDate[date] = [];
      eventsByDate[date].push({
        time: tp.time,
        height: tp.height,
        isHigh: tp.isHighTide === true,
      });
    });

    // Build weekly forecast
    const today = new Date();
    const forecast: TideForecast[] = Object.keys(eventsByDate)
      .sort()
      .filter(date => isSameDay(new Date(date), today) || new Date(date) > today)
      .slice(0, 7)
      .map(date => {
        const dateObj = new Date(date);
        return {
          date,
          day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          moonPhase: calculateMoonPhase(dateObj).phase,
          illumination: calculateMoonPhase(dateObj).illumination,
          cycles: groupTideEvents(eventsByDate[date])
        };
      });

    return {
      curveData: detailedPoints.length > 0 ? detailedPoints : tidePoints,
      tidePoints,
      forecast
    };
  }, []);

  // Group tide events into cycles
  const groupTideEvents = useCallback((events: TideEvent[]): TideCycle[] => {
    const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time));
    const cycles: TideCycle[] = [];
    for (let i = 0; i < sorted.length - 1; i += 2) {
      cycles.push({
        first: sorted[i],
        second: sorted[i + 1]
      });
    }
    return cycles;
  }, []);

  // Main data fetching function
  const fetchTideData = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const targetStation = station || nearestStation;
    if (!location || !targetStation?.id) {
      setError(!location ? 'No location provided' : 'No station available');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStationName(targetStation.name);
    setStationId(targetStation.id);
    setIsInland(false);

    try {
      // Set date range (yesterday to tomorrow for smooth charts)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      // Fetch data in parallel
      const [predictions, detailed] = await Promise.all([
        getTideData(targetStation.id, formatDateAsLocalIso(startDate), { signal }),
        fetchSixMinuteRange(targetStation, startDate, endDate, { signal })
      ]);

      // Process and set data
      const { curveData, tidePoints, forecast } = processTideData(predictions, detailed);
      setTideData(curveData);
      setTideEvents(tidePoints);
      setWeeklyForecast(forecast);
    } catch (err) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load tide data');
        setIsInland(true);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [location, station, nearestStation, processTideData]);

  // Station fetching effect
  useEffect(() => {
    if (station || !location?.lat || !location.lng) return;

    const controller = new AbortController();
    const fetchStations = async () => {
      try {
        const stations = await getCachedStations(
          { lat: location.lat!, lng: location.lng! },
          controller.signal
        );
        setStations(stations);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to fetch stations');
        }
      }
    };

    fetchStations();
    return () => controller.abort();
  }, [location?.lat, location?.lng, station]);

  // Data fetching effect with debounce
  useEffect(() => {
    clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      fetchTideData();
    }, 300);

    return () => {
      clearTimeout(fetchTimeoutRef.current);
      abortControllerRef.current?.abort();
    };
  }, [fetchTideData]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    isLoading,
    error,
    tideData,
    tideEvents,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName,
    stationId,
    isInland
  };
};