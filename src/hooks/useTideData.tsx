import { useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import { getTideData, Prediction } from '@/services/tideDataService';
import { fetchSixMinuteRange } from '@/services/tide/tideService';
import { Station } from '@/services/tide/stationService';
import {
  getCurrentIsoDateString,
  getCurrentTimeString,
  formatDateAsLocalIso,
} from '@/utils/dateTimeUtils';
import { TidePoint, TideForecast, TideCycle, TideEvent } from '@/services/tide/types';
import { calculateMoonPhase } from '@/utils/lunarUtils';

// Internal shape for grouping tide events by date

function groupTideEventsByDay(events: TideEvent[], targetDate: Date): TideEvent[] {
  const filtered = events
    .filter((e) => isSameDay(new Date(e.time), targetDate))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return filtered.slice(0, 4);
}

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

  // Update current time every minute so the "Now" indicator stays accurate
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
      // Keep previously loaded data so navigating away doesn't clear charts
      return;
    }

    const checkInlandAndFetch = async () => {
      setIsLoading(true);
      setError(null);
      setIsInland(false);
      console.log('🚀 Tide data fetch triggered for', {
        location,
        stationId: station?.id,
      });

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
        const dateIso = formatDateAsLocalIso(startDate);

        // Debug logging before fetching tide data
        console.log('📍 Selected station id:', station?.id);
        console.log('ZIP:', location?.zipCode);
        console.log('Lat/Lng:', location?.lat, location?.lng);

        const idStr = String(chosen.id);
        console.log('🌐 useTideData getTideData:', {
          stationId: idStr,
          date: dateIso
        });
        const predictions: Prediction[] = await getTideData(
          idStr,
          dateIso
        );
        console.log('🌊 NOAA predictions length:', predictions.length);

        // Fetch detailed six-minute data around today for smooth chart lines
        const rangeStart = new Date();
        rangeStart.setDate(rangeStart.getDate() - 1);
        const rangeEnd = new Date();
        rangeEnd.setDate(rangeEnd.getDate() + 1);
        console.log('🌐 useTideData fetchSixMinuteRange:', {
          stationId: idStr,
          rangeStart,
          rangeEnd
        });
        const detailedRaw = await fetchSixMinuteRange(
          {
            id: idStr,
            name: chosen.name,
            lat: chosen.latitude,
            lng: chosen.longitude
          },
          rangeStart,
          rangeEnd
        );
        console.log('🌊 NOAA six-minute raw:', detailedRaw);
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

        // Group tide events by their local date
        const eventsByDate: Record<string, TideEvent[]> = {};
        tidePoints.forEach((tp) => {
          if (tp.isHighTide === null) return;
          const date = tp.time.slice(0, 10);
          if (!eventsByDate[date]) eventsByDate[date] = [];
          eventsByDate[date].push({
            time: tp.time,
            height: tp.height,
            isHigh: tp.isHighTide === true,
          });
        });

        // Build cycles strictly within each day to ensure two cycles per day
        const cyclesByDate: Record<string, TideCycle[]> = {};
        Object.keys(eventsByDate).forEach((date) => {
          const events = eventsByDate[date].sort((a, b) =>
            a.time.localeCompare(b.time)
          );
          cyclesByDate[date] = [];
          for (let i = 0; i < events.length - 1; i += 2) {
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
        setCurrentDate(getCurrentIsoDateString());
        setCurrentTime(getCurrentTimeString());
        setStationName(chosen.name || location.name || null);
        setStationId(idStr);
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
