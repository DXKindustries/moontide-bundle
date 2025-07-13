/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { get7DayRange, makeCacheKey, fetchTidePredictions } from '../utils/api';
import { readForecast, writeForecast, isCacheValid } from '../utils/cache';

export interface TideDatum {
  t: string;   // ISO datetime
  v: string;   // height
  type?: 'H' | 'L';
}
export interface TideState {
  tideData: TideDatum[];                       // ← ALWAYS an array
  isLoading: boolean;
  error: null | 'no-station' | 'fetch-fail';
  cacheValid: boolean;
}

/** 7-day stale-while-revalidate tide data */
export function useTideData(stationId?: string): TideState {
  /* ① Guard: no station selected */
  if (!stationId) {
    return { tideData: [], isLoading: false, error: 'no-station', cacheValid: false };
  }

  const range = get7DayRange();                        // { start:'YYYY-MM-DD', end:'YYYY-MM-DD' }
  const key   = makeCacheKey(stationId, range.start, range.end, 'h');

  /* ② Seed state from cache (never undefined) */
  const cached = readForecast(key);
  const [state, set] = useState<TideState>({
    tideData: cached?.data ?? [],
    isLoading: false,
    error: null,
    cacheValid: isCacheValid(cached),
  });

  /* ③ Background refresh when cache stale & online */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (state.cacheValid || !navigator.onLine) return;

      set(s => ({ ...s, isLoading: true, error: null }));
      try {
        const fresh = await fetchTidePredictions(stationId, range.start, range.end, 'h');
        if (cancelled) return;

        writeForecast(key, fresh, range.start);                // persist 7-day block
        set({ tideData: fresh, isLoading: false, error: null, cacheValid: true });
      } catch {
        if (cancelled) return;
        set(s => ({ ...s, isLoading: false, error: 'fetch-fail' }));
        setTimeout(load, 30_000);                              // silent retry
      }
    }

    load();
    return () => { cancelled = true; };
  }, [stationId, key]);                                        // re-runs on station switch

  return state;                                                // safe, complete object
}
