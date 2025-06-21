
/* -------------------------------------------------------------------------- */
/*  src/services/tide/tideService.ts                                          */
/* -------------------------------------------------------------------------- */
/*  Fetch daily and weekly tide predictions from NOAA - LIVE DATA ONLY */

import { getProxyConfig } from './proxyConfig';

// Use an inline type instead of external import to avoid build issues
type NoaaStation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/* Cloud host — note the mandatory `/prod/` segment */
const BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

interface PredictionParams {
  station: string;          // NOAA station ID
  beginDate: string;        // YYYYMMDD
  endDate: string;          // YYYYMMDD
  interval?: 'hilo' | '6';  // hilo = highs/lows ; 6 = six-minute data
  units?: 'english' | 'metric';
}

/* ------------------------- internal helpers ------------------------------ */

function dateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

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

async function fetchPredictions(p: PredictionParams, station: NoaaStation) {
  const noaaUrl = buildQuery(p);
  console.log('🌐 Fetching live tide data from NOAA...');
  
  // Try direct NOAA API first
  try {
    console.log('🎯 Trying direct NOAA API call...');
    const response = await fetch(noaaUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.predictions && data.predictions.length > 0) {
        console.log('✅ Direct NOAA API call successful');
        return data;
      }
    }
  } catch (error) {
    console.log('⚠️ Direct NOAA API call failed (expected due to CORS)');
  }

  // Try with CORS proxy
  const config = getProxyConfig();
  try {
    console.log('🌐 Trying CORS proxy...');
    const proxyUrl = `${config.fallbackProxyUrl}${encodeURIComponent(noaaUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.predictions && data.predictions.length > 0) {
        console.log('✅ CORS proxy successful');
        return data;
      }
    }
  } catch (error) {
    console.log('⚠️ CORS proxy failed:', error.message);
  }

  // Phase 1: No more mock data fallbacks - throw error if no live data available
  console.error('❌ All attempts to fetch live NOAA data failed');
  throw new Error('Unable to fetch live tide data from NOAA. Please check your internet connection.');
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
  const yyyymmdd = dateToYYYYMMDD(date);
  return fetchPredictions({
    station: station.id,
    beginDate: yyyymmdd,
    endDate: yyyymmdd,
    interval: 'hilo',
    units,
  }, station);
}

/**
 * Fetch high / low events for a 7-day span (date + next 6 days).
 */
export async function fetchWeeklyTides(
  station: NoaaStation,
  start: Date,
  units: 'english' | 'metric' = 'english'
) {
  const begin = dateToYYYYMMDD(start);
  const endObj = new Date(start);
  endObj.setDate(endObj.getDate() + 6);
  const end = dateToYYYYMMDD(endObj);

  return fetchPredictions({
    station: station.id,
    beginDate: begin,
    endDate: end,
    interval: 'hilo',
    units,
  }, station);
}
