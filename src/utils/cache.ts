import { safeLocalStorage } from './localStorage';
import type { TideDatum } from '@/hooks/useTideData';

export interface CachedForecast {
  data: TideDatum[];
  fetchedAt: number;
  expiresAt: number;
}

export function readForecast(k: string): CachedForecast | null {
  return safeLocalStorage.get<CachedForecast>(k) ?? null;
}

export function writeForecast(k: string, d: TideDatum[], start: string): void {
  const expiresAt = new Date(start).getTime() + 7 * 24 * 60 * 60 * 1000;
  const value: CachedForecast = { data: d, fetchedAt: Date.now(), expiresAt };
  safeLocalStorage.set(k, value);
}

export function isCacheValid(c?: CachedForecast | null): boolean {
  return !!c && Date.now() <= c.expiresAt;
}
