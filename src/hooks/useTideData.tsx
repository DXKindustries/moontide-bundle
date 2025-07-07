import { useState, useEffect } from 'react';
import { isSameDay, isToday } from 'date-fns';
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

      try {
        const chosen = station;

        // At this point we should have a chosen station
        if (!chosen?.id) {
          console.warn('No station ID available for location', location);
          setStationId(null);
          setIsLoading(false);
          return;
        }
        const initialStartDate = new Date();
        initialStartDate.setDate(initialStartDate.getDate() - 1); // include prior day for smoother charts
        const dateIso = formatDateAsLocalIso(initialStartDate);

        // Debug logging before fetching tide data
        console.log("ZIP:", location?.zipCode);
        console.log("Lat/Lng:", location?.latitude, location?.longitude);
        console.log("Station ID:", station?.id);

        console.log('🌐 useTideData getTideData:', {
          stationId: chosen.id,
          date: dateIso
        });
        const hiLoPredictions: Prediction[] = await getTideData(
          chosen.id,
          dateIso,
          7
        );
        console.log('🌊 NOAA predictions length:', hiLoPredictions.length);

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
        const rawData = await fetchSixMinuteRange(
          {
            id: chosen.id,
            name: chosen.name,
            lat: chosen.latitude,
            lng: chosen.longitude
          },
          rangeStart,
          rangeEnd
        );
        const startDate = rangeStart.toISOString();
        const endDate = rangeEnd.toISOString();
        console.log('🌊 NOAA six-minute raw:', rawData);

        const formatYYYYMMDD = (d: Date) =>
          `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        const noaaRequestURL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${new URLSearchParams({
          product: 'water_level',
          application: 'MoonTide',
          format: 'json',
          datum: 'MLLW',
          time_zone: 'lst_ldt',
          units: 'english',
          station: chosen.id,
          begin_date: formatYYYYMMDD(rangeStart),
          end_date: formatYYYYMMDD(rangeEnd),
          interval: '6'
        }).toString()}`;

        if (!rawData?.predictions) {
          console.error('[TIDE-ERROR] NOAA Data Validation Failed:', {
            stationId,
            rawData: rawData ?? 'NULL_RESPONSE',
            requestURL: noaaRequestURL
          });
          throw new Error('Invalid tide data: predictions array missing');
        }

        console.log('[TIDE-SAFE] Validated Data:', {
          station: stationId,
          predictionCount: rawData.predictions.length,
          firstLast: {
            first: rawData.predictions[0]?.t || 'N/A',
            last: rawData.predictions.slice(-1)[0]?.t || 'N/A'
          },
          cycles: {
            high: rawData.predictions.filter(p => p.type === 'H').length,
            low: rawData.predictions.filter(p => p.type === 'L').length
          }
        });

        const safePredictions = rawData?.predictions?.map(p => ({
          time: p.t,
          height: p.v,
          type: p.type
        })) || [];

        console.log('[TIDE-DEBUG] Raw API Response:', {
          station: stationId,
          predictions: safePredictions,
          requestWindow: `${startDate} → ${endDate}`
        });

        console.log('[TIDE-SAFE] Processed:', {
          count: safePredictions.length,
          today: safePredictions.filter(p => isToday(new Date(p.time)))
        });

        console.log('[TIDE] Filtered Cycles:', {
          today: safePredictions.filter(p => isToday(new Date(p.time))),
          overnight: safePredictions.filter(p => {
            const date = new Date(p.time);
            return date.getHours() >= 18 || date.getHours() <= 6;
          })
        });
        console.log('[TIDE-DEBUG] Processed Cycles:', {
          today: safePredictions.filter(p => {
            const date = new Date(p.time);
            return isToday(date);
          }),
          overnight: safePredictions.filter(p => {
            const date = new Date(p.time);
            return date.getHours() >= 18 || date.getHours() <= 6; // 6PM-6AM
          })
        });
        const detailedPoints: TidePoint[] = safePredictions.map((p: { time: string; height: string }) => ({
            time: `${p.time.replace(' ', 'T')}:00`,
            height: parseFloat(p.height),
            isHighTide: null
          }));

        const tidePoints: TidePoint[] = hiLoPredictions
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

        console.log('[DEBUG] useTideData processed data:', {
          curvePoints: curveData.length,
          tidePoints: tidePoints.length,
          forecastDays: forecast.length,
        });

        setTideData(curveData);
        setTideEvents(tidePoints);
        setWeeklyForecast(forecast);
        setCurrentDate(getCurrentIsoDateString());
        setCurrentTime(getCurrentTimeString());
        setStationName(chosen.name || location.name || null);
        setStationId(chosen.id);
        setIsInland(false);
        setIsLoading(false);
      } catch (err) {
        console.error('[DEBUG] useTideData error:', err);
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
