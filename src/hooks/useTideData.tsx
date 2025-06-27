import { useState, useEffect } from 'react';
import { getTideData, Prediction } from '@/services/tideDataService';
import { fetchSixMinuteRange } from '@/services/tide/tideService';
import { Station } from '@/services/tide/stationService';
import {
  getCurrentIsoDateString,
  getCurrentTimeString,
} from '@/utils/dateTimeUtils';
import { TidePoint, TideForecast, TideCycle } from '@/services/tide/types';
import { calculateMoonPhase } from '@/utils/lunarUtils';

// Internal shape for grouping tide events by date
type TideEvent = {
  time: string;
  height: number;
  isHighTide: boolean | null;
};

type UseTideDataParams = {
  location: {
    id: string;        // stationId
    name: string;      // user label, city/state, etc
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

  useEffect(() => {
    setCurrentDate(getCurrentIsoDateString());
    setCurrentTime(getCurrentTimeString());

    if (!location || !station) {
      setIsLoading(false);
      setError(null);
      setTideData([]);
      setTideEvents([]);
      setWeeklyForecast([]);
      setStationName(null);
      setStationId(null);
      setIsInland(false);
      return;
    }

    const checkInlandAndFetch = async () => {
      setIsLoading(true);
      setError(null);
      setIsInland(false);

      try {
        const chosen = station;

        // At this point we should have a chosen station
        if (!chosen?.id) {
          console.warn('No station ID available for location', location);
          setStationId(null);
          setIsLoading(false);
          return;
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1); // include prior day for smoother charts
        const dateIso = startDate.toISOString().split('T')[0];
        console.log('🌐 useTideData getTideData:', {
          stationId: chosen.id,
          date: dateIso
        });
        const predictions: Prediction[] = await getTideData(
          chosen.id,
          dateIso,
          7
        );

        // Fetch detailed six-minute data around today for smooth chart lines
        const rangeStart = new Date();
        rangeStart.setDate(rangeStart.getDate() - 1);
        const rangeEnd = new Date();
        rangeEnd.setDate(rangeEnd.getDate() + 1);
        console.log('🌐 useTideData fetchSixMinuteRange:', {
          stationId: chosen.id,
          rangeStart,
          rangeEnd
        });
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

        // Build tide cycles across the full dataset so pairs can cross midnight
        const cyclesByDate: Record<string, TideCycle[]> = {};
        let pendingLow: TideEvent | null = null;

        tidePoints.forEach((tp) => {
          const event: TideEvent = {
            time: tp.time,
            height: tp.height,
            isHighTide: tp.isHighTide,
          };

          if (event.isHighTide === false) {
            // store low tide until the next high tide appears
            pendingLow = event;
          } else if (event.isHighTide === true && pendingLow) {
            const date = pendingLow.time.slice(0, 10);
            if (!cyclesByDate[date]) cyclesByDate[date] = [];
            cyclesByDate[date].push({
              low: { time: pendingLow.time, height: pendingLow.height },
              high: { time: event.time, height: event.height },
            });
            pendingLow = null;
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

        setTideData(detailedPoints);
        setTideEvents(tidePoints);
        setWeeklyForecast(forecast);
        setCurrentDate(getCurrentIsoDateString());
        setCurrentTime(getCurrentTimeString());
        setStationName(chosen.name || location.name || null);
        setStationId(chosen.id);
        setIsInland(false);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        setTideData([]);
        setTideEvents([]);
        setWeeklyForecast([]);
        setStationName(null);
        setStationId(null);
        setIsInland(false);
      }
    };

    checkInlandAndFetch();
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
  };
};
