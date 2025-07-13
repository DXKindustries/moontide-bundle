import { useEffect, useState } from 'react';
import { safeLocalStorage } from '@/utils/localStorage';
import { fetchSixMinuteRange } from '@/services/tide/tideService';
import type { TidePoint } from '@/services/tide/types';

/** Build a unique cache key for a tide data request */
const makeCacheKey = (
  stationId: string,
  startDate: string,
  endDate: string,
  units: string,
) => `tide:${stationId}:${startDate}:${endDate}:${units}`;

const readCache = (key: string): TidePoint[] | null => {
  return safeLocalStorage.get<TidePoint[]>(key) ?? null;
};

const writeCache = (key: string, data: TidePoint[]): void => {
  safeLocalStorage.set(key, data);
};

async function fetchTidePredictions(
  stationId: string,
  startDate: string,
  endDate: string,
  units: 'english' | 'metric' = 'english',
): Promise<TidePoint[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const raw = await fetchSixMinuteRange(
    { id: stationId, name: '', lat: 0, lng: 0 },
    start,
    end,
    units,
  );
  return Array.isArray(raw?.predictions)
    ? raw.predictions.map(p => ({
        time: `${p.t.replace(' ', 'T')}:00`,
        height: parseFloat(p.v),
        isHighTide: null,
      }))
    : [];
}

interface Params {
  stationId: string;
  startDate: string;
  endDate: string;
  units?: 'english' | 'metric';
}

interface Result {
  data: TidePoint[];
  isLoading: boolean;
  error: string | null;
}

export function useTideData({
  stationId,
  startDate,
  endDate,
  units = 'english',
}: Params): Result {
  const key = makeCacheKey(stationId, startDate, endDate, units);
  const [state, set] = useState<Result>(() => ({
    data: readCache(key) || [],
    isLoading: false,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!navigator.onLine) return;

      set(s => ({ ...s, isLoading: true, error: null }));
      try {
        const fresh = await fetchTidePredictions(
          stationId,
          startDate,
          endDate,
          units,
        );
        if (cancelled) return;

        writeCache(key, fresh);
        set({ data: fresh, isLoading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        set(s => ({ ...s, isLoading: false, error: 'fetch-fail' }));
        setTimeout(load, 30_000);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stationId, key]);

  return state;
}
