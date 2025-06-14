/* -------------------------------------------------------------------------- */
/*  src/services/tide/tideService.ts                                          */
/* -------------------------------------------------------------------------- */
/*  Fetch daily and weekly tide predictions from NOAA’s new cloud endpoint.   */

import type { NoaaStation } from './stationService';

/* Cloud host — note the mandatory `/prod/` segment */
const BASE =
  'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

interface PredictionParams {
  station: string;          // NOAA station ID
  beginDate: string;        // YYYYMMDD
  endDate: string;          // YYYYMMDD
  interval?: 'hilo' | '6';  // hilo = highs/lows ; 6 = six-minute data
  units?: 'english' | 'metric';
}

/* ------------------------- internal helpers ------------------------------ */

function buildQuery(p: PredictionParams): string {
  const qs = new URLSearchParams({
    product: 'predictions',
    application: 'MoonTide',
    format: 'json',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    units: p.units ?? 'english',
    station: p.station,
    begin_date: p.beginDate,
    end_date: p.endDate,
    interval: p.interval ?? 'hilo',
  });
  return `${BASE}?${qs.toString()}`;
}

async function fetchPredictions(p: PredictionParams) {
  const url = buildQuery(p);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`noaaError:${res.status}`);
  return res.json();               // { predictions: [...] }
}

/* -------------------------- PUBLIC EXPORTS ------------------------------- */

/**
 * Fetch the two high / two low events for a single calendar day.
 */
export async function fetchDailyTides(
  station: NoaaStation,
  date: Date,
  units: 'english' | 'metric' = 'english'
) {
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return fetchPredictions({
    station: station.id,
    beginDate: yyyymmdd,
    endDate:   yyyymmdd,
    interval: 'hilo',
    units,
  });
}

/**
 * Fetch high / low events for a 7-day span (date + next 6 days).
 */
export async function fetchWeeklyTides(
  station: NoaaStation,
  start: Date,
  units: 'english' | 'metric' = 'english'
) {
  const begin = start.toISOString().slice(0, 10).replace(/-/g, '');
  const endObj = new Date(start);
  endObj.setDate(endObj.getDate() + 6);
  const end = endObj.toISOString().slice(0, 10).replace(/-/g, '');

  return fetchPredictions({
    station: station.id,
    beginDate: begin,
    endDate:   end,
    interval: 'hilo',
    units,
  });
}
