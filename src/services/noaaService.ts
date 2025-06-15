
// src/services/noaaService.ts
// Unified tide + station API helpers for MoonTide app

import {
  getNearestStation as _getNearestStation,
  getSavedStationForLocation,
  Station,
} from './tide/stationService';
import { fetchDailyTides, fetchWeeklyTides } from './tide/tideService';
import { getMoonPhase } from './tide/utils';

import type { TidePoint, TideForecast } from './tide/types';

// Used for localStorage station cache (by app location id)
const LOC_STORAGE_KEY = 'moontide_station_by_location';

export async function getNearestStation(lat: number, lng: number): Promise<Station | null> {
  // Use lat/lng as fallback key (in case no zip)
  const zipKey = lat + ',' + lng;
  return _getNearestStation(zipKey, lat, lng);
}

/**
 * Get a stored NOAA stationId for a location key (location.id or zip).
 */
export function getStationForLocation(locationId: string): string | null {
  try {
    const stringified = localStorage.getItem(LOC_STORAGE_KEY);
    if (!stringified) return null;
    const map = JSON.parse(stringified) as Record<string, string>;
    return map[locationId] ?? null;
  } catch {
    return null;
  }
}

/**
 * Save station ID for this location to localStorage.
 */
export function saveStationForLocation(locationId: string, stationId: string) {
  try {
    const stringified = localStorage.getItem(LOC_STORAGE_KEY);
    const map = stringified ? (JSON.parse(stringified) as Record<string,string>) : {};
    map[locationId] = stationId;
    localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* silent non-fatal */
  }
}

/**
 * Gets tide predictions for this station for the current day (in local time).
 * Returns an array of { time, height } points for charting.
 */
export async function getCurrentTideData(stationId: string): Promise<{
  tideData: TidePoint[];
  date: string;
  currentTime: string;
}> {
  // Default to today (local date)
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10);
  // The fetchDailyTides method returns an object with { predictions: [...] }
  const fakeStation = { id: stationId, name: 'NOAA', lat: 0, lng: 0 };
  const res = await fetchDailyTides(fakeStation, now);
  // Parse prediction points
  const tideData: TidePoint[] = ((res && res.predictions) || []).map((p: any) => ({
    time: p.t, // e.g. "2025-06-15 02:00"
    height: parseFloat(p.v),
    isHighTide: null // hilo only returns highs/lows which can be derived in chart if needed
  }));

  // For most charts, just use array of time-point-height
  return {
    tideData,
    date: dateStr,
    currentTime: tideData.length > 0 ? tideData[0].time : "",
  };
}

/**
 * Returns an array of TideForecasts for 7 days starting today.
 */
export async function getWeeklyTideForecast(stationId: string): Promise<TideForecast[]> {
  // We call fetchWeeklyTides which gets hi/lo for 7 days
  const now = new Date();
  const fakeStation = { id: stationId, name: 'NOAA', lat: 0, lng: 0 };
  const res = await fetchWeeklyTides(fakeStation, now);

  // NOAA returns { predictions: [{ t, v, type, ... }] }
  const predictions = ((res && res.predictions) || []).map((p: any) => ({
    time: p.t,
    height: parseFloat(p.v),
    type: p.type // "H" or "L"
  }));

  // Chunk by day
  const dailyGroups: Record<string, {highs: any[], lows: any[]}> = {};
  for (const p of predictions) {
    const d = p.time.slice(0,10); // YYYY-MM-DD
    if (!dailyGroups[d]) dailyGroups[d] = { highs:[], lows:[] };
    if (p.type === "H") dailyGroups[d].highs.push(p);
    if (p.type === "L") dailyGroups[d].lows.push(p);
  }

  // Generate output for up to 7 days
  const out: TideForecast[] = [];
  const days = Object.keys(dailyGroups).slice(0,7);
  for (const date of days) {
    const info = dailyGroups[date];
    // Pick 1st hi/lo per day, fallback to 0 if missing
    const high = info.highs[0] || { time: `${date} 00:00`, height: 0 };
    const low = info.lows[0] || { time: `${date} 00:00`, height: 0 };
    // Determine weekday
    const dt = new Date(date);
    const day = dt.toLocaleDateString(undefined, { weekday: "short" });
    // Fake moon phase for now
    const { phase, illumination } = getMoonPhase(dt);

    out.push({
      date,
      day,
      moonPhase: phase,
      illumination,
      highTide: {
        time: high.time.slice(11,16),
        height: high.height
      },
      lowTide: {
        time: low.time.slice(11,16),
        height: low.height
      }
    });
  }

  return out;
}

/**
 * Fetches raw (hi/lo points) for today only.
 * Not needed, but kept for API parity in hooks.
 */
export async function getTidePredictions(stationId: string, dateISO: string): Promise<TidePoint[]> {
  const fakeStation = { id: stationId, name: 'NOAA', lat: 0, lng: 0 };
  // Use fetchDailyTides (returns { predictions: [...] })
  const res = await fetchDailyTides(fakeStation, new Date(dateISO));
  return ((res && res.predictions) || []).map((p: any) => ({
    time: p.t,
    height: parseFloat(p.v),
    isHighTide: null // Leaves to chart logic to determine
  }));
}

// You may extend with other utility exports as needed

