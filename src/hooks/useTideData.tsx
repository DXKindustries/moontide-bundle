import { useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import { getTideData, Prediction } from '@/services/tideDataService';
import { debugLog } from '@/utils/debugLogger';
import { fetchSixMinuteRange } from '@/services/tide/tideService';
import { Station } from '@/services/tide/stationService';
import {
  getCurrentIsoDateString,
  getCurrentTimeString,
  formatDateAsLocalIso,
  parseIsoAsLocal,
} from '@/utils/dateTimeUtils';
import { TidePoint, TideForecast, TideCycle, TideEvent } from '@/services/tide/types';
import { calculateMoonPhase } from '@/utils/lunarUtils';
import { tideCache, TideCacheEntry } from '@/utils/tideCache';

function groupTideEventsByDay(events: TideEvent[], targetDate: Date): TideEvent[] {
  const filtered = events
    .filter((e) => isSameDay(new Date(e.time), targetDate))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return filtered.slice(0, 4);
}

type UseTideDataParams = {
  location: {
    id: string;
    name: string;
    country?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  } | null;
  station?: Station | null;
};

type UseTideDataReturn = {
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
  banner: string | null;
};

export const useTideData = ({ location, station }: UseTideDataParams): UseTideDataReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [tideEvents, setTideEvents] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentIsoDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [isInland, setIsInland] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentDate(getCurrentIsoDateString());
    setCurrentTime(getCurrentTimeString());

    if (!location || !station) {
      setIsLoading(false);
      setError(null);
      setBanner(null);
      return;
    }

    const startIso = getCurrentIsoDateString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6);
    const endIso = formatDateAsLocalIso(endDate);

    const cacheKey = tideCache.makeKey(station.id, startIso, endIso, 'english');
    const cached = tideCache.get(cacheKey);

    if (cached) {
      setTideData(cached.tideData);
      setTideEvents(cached.tideEvents);
      setWeeklyForecast(cached.weeklyForecast);
      setStationName(cached.stationName);
      setStationId(cached.stationId);
      if (cached.expiresAt < Date.now()) {
        setBanner('Forecast expired');
      } else if (!navigator.onLine) {
        setBanner('Offline – showing saved forecast');
      } else {
        setBanner(null);
      }
    }

    const fetchAndUpdate = async () => {
      setIsLoading(true);
      setError(null);
      setIsInland(false);
      debugLog('Fetching tide data for station', station);

      try {
        const chosen = station;
        if (!chosen?.id) {
          setStationId(null);
          setIsLoading(false);
          return;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const dateIso = formatDateAsLocalIso(startDate);

        debugLog('Requesting 8 day predictions', { stationId: chosen.id, dateIso });
        const predictions: Prediction[] = await getTideData(
          chosen.id,
          dateIso
        );
        debugLog('Predictions received', { count: predictions.length });

        const rangeStart = new Date();
        rangeStart.setDate(rangeStart.getDate() - 1);
        const rangeEnd = new Date();
        rangeEnd.setDate(rangeEnd.getDate() + 1);
        
        debugLog('Fetching 6 minute range');
        const detailedRaw = await fetchSixMinuteRange(
          {
            id: chosen.id,
            name: chosen.name,
            lat: chosen.latitude,
            lng: chosen.longitude
          },
          rangeStart,
          rangeEnd
        );
        debugLog('6 minute range fetched', { hasData: !!detailedRaw?.predictions?.length });

        const detailedPoints: TidePoint[] = Array.isArray(detailedRaw?.predictions)
          ? detailedRaw.predictions.map((p: { t: string; v: string }) => ({
              time: `${p.t.replace(' ', 'T')}:00`,
              height: parseFloat(p.v),
              isHighTide: null
            }))
          : [];

        const tidePoints: TidePoint[] = predictions
          .map((p) => ({
            time: p.timeIso,
            height: p.valueFt,
            isHighTide: p.kind === 'H' ? true : p.kind === 'L' ? false : null,
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        const curveData = detailedPoints.length > 0 ? detailedPoints : tidePoints;

        const eventList: TideEvent[] = tidePoints
          .filter((tp) => tp.isHighTide !== null)
          .map((tp) => ({
            time: tp.time,
            height: tp.height,
            isHigh: tp.isHighTide === true,
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        const uniqueDates = Array.from(
          new Set(eventList.map((e) => e.time.slice(0, 10)))
        ).sort();

        const cyclesByDate: Record<string, TideCycle[]> = {};
        uniqueDates.forEach((date) => {
          const start = parseIsoAsLocal(`${date}T00:00:00`);
          const end = new Date(start);
          end.setHours(end.getHours() + 30);

          const events = eventList.filter((e) => {
            const ts = parseIsoAsLocal(e.time).getTime();
            return ts >= start.getTime() && ts < end.getTime();
          });

          cyclesByDate[date] = [];
          for (let i = 0; i < events.length - 1 && cyclesByDate[date].length < 2; i += 2) {
            cyclesByDate[date].push({
              first: events[i],
              second: events[i + 1],
            });
          }
        });

        const todayStr = getCurrentIsoDateString();
        const forecast: TideForecast[] = Object.keys(cyclesByDate)
          .sort()
          .filter(d => d >= todayStr)
          .slice(0, 7)
          .map((date) => {
            const dayObj = new Date(`${date}T00:00:00`);
            const day = dayObj.toLocaleDateString('en-US', { weekday: 'short' });
            const { phase, illumination } = calculateMoonPhase(dayObj);

            return {
              date,
              day,
              moonPhase: phase,
              illumination,
              cycles: cyclesByDate[date].slice(0, 2),
            } as TideForecast;
          });

        setTideData(curveData);
        setTideEvents(tidePoints);
        setWeeklyForecast(forecast);
        setStationName(chosen.name || location.name || null);
        setStationId(chosen.id);

        const expiry = parseIsoAsLocal(`${startIso}T00:00:00`);
        expiry.setDate(expiry.getDate() + 7);

        const cacheEntry: TideCacheEntry = {
          fetchedAt: Date.now(),
          expiresAt: expiry.getTime(),
          tideData: curveData,
          tideEvents: tidePoints,
          weeklyForecast: forecast,
          stationName: chosen.name || location.name || null,
          stationId: chosen.id,
        };
        tideCache.set(cacheKey, cacheEntry);
        setBanner(null);
        debugLog('Tide data state updated', {
          points: curveData.length,
          events: tidePoints.length,
          forecastDays: forecast.length,
        });
        setIsLoading(false);
      } catch (err) {
        debugLog('Tide data fetch failed', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        if (cached) {
          setBanner(cached.expiresAt < Date.now() ? 'Forecast expired' : 'Offline – showing saved forecast');
        } else {
          setTideData([]);
          setTideEvents([]);
          setWeeklyForecast([]);
          setStationName(null);
          setStationId(null);
        }
        setIsLoading(false);
      }
    };

    if (navigator.onLine) {
      fetchAndUpdate();
    } else {
      setIsLoading(false);
      if (!cached) {
        setBanner('Offline – no forecast data');
      }
    }

    const handleOnline = () => fetchAndUpdate();
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [location, station]);

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
    isInland,
    banner,
  };
};