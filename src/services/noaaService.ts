// src/services/noaaService.ts
// ────────────────────────────────────────────────────────────────────────────
// Wrapper that resolves the nearest tide station for a ZIP / coords
// and (optionally) fetches readings from NOAA.
// ────────────────────────────────────────────────────────────────────────────

import {
  getNearestStation,
  getSavedStationForLocation,
  Station,
} from './tide/stationService';

// ---------------------------------------------------------------------------
// 1. Resolve a station for the current location
// ---------------------------------------------------------------------------

/**
 * Return the nearest NOAA water-level station for this ZIP / coordinates.
 * Falls back to a previously saved pick (for speed).
 */
export async function resolveStation(
  zip: string,
  lat: number,
  lng: number
): Promise<Station | null> {
  // quick path: use any cached value
  const saved = getSavedStationForLocation(zip);
  if (saved) return saved;

  // otherwise compute + persist a fresh nearest
  return getNearestStation(zip, lat, lng);
}

// ---------------------------------------------------------------------------
// 2. Fetch tide readings for a station + date  (extend as needed)
// ---------------------------------------------------------------------------

interface TideReading {
  time: string;   // ISO 8601
  height: number; // feet (NOAA default is feet when units=english)
}

/**
 * Example tide-fetch call — customise or replace with your own hook/service.
 */
export async function fetchTideReadings(
  station: Station,
  dateISO: string // e.g. '2025-06-14'
): Promise<TideReading[]> {
  const url =
    'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter' +
    `?product=predictions&application=moontide` +
    `&datum=MLLW&station=${station.id}` +
    `&begin_date=${dateISO.replace(/-/g, '')}` +
    `&end_date=${dateISO.replace(/-/g, '')}` +
    `&interval=hilo&units=english&time_zone=lst_ldt&format=json`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to fetch tide data');

  const raw = await resp.json();
  return (raw?.predictions ?? []).map((p: any) => ({
    time: p.t,           // 'YYYY-MM-DD HH:mm'
    height: parseFloat(p.v),
  }));
}
