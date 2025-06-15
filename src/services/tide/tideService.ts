
/* -------------------------------------------------------------------------- */
/*  src/services/tide/tideService.ts                                          */
/* -------------------------------------------------------------------------- */
/*  Fetch daily and weekly tide predictions from NOAA's new cloud endpoint.   */

import { getProxyConfig } from './proxyConfig';

// Use an inline type instead of external import to avoid build issues
type NoaaStation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/* Cloud host — note the mandatory `/prod/` segment */
const BASE =
  'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

/* Local proxy for CORS resolution */
const LOCAL_PROXY_BASE = 'http://localhost:3001/api/noaa';
const FALLBACK_PROXY_BASE = 'https://api.allorigins.win/raw?url=';

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

async function fetchPredictions(p: PredictionParams) {
  const noaaUrl = buildQuery(p);
  const config = getProxyConfig();
  
  if (config.useLocalProxy) {
    // Try local proxy first
    try {
      console.log('🌐 Using local proxy for tide predictions (preferred)...');
      const localProxyUrl = `${config.localProxyUrl}?url=${encodeURIComponent(noaaUrl)}`;
      
      const res = await fetch(localProxyUrl);
      if (!res.ok) {
        throw new Error(`Local proxy returned ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        console.error('❌ NOAA API returned an error via local proxy:', data.error.message);
        throw new Error(`NOAA API Error: ${data.error.message}`);
      }
      
      console.log('✅ Local proxy response received for tide predictions:', data);
      return data;
      
    } catch (localError) {
      console.log('⚠️ Local proxy failed for tide predictions, trying fallback...', localError.message);
      
      // Fallback to external proxy
      const fallbackProxyUrl = `${config.fallbackProxyUrl}${encodeURIComponent(noaaUrl)}`;
      
      const res = await fetch(fallbackProxyUrl);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Fallback proxy request failed:', res.status, res.statusText, errorText);
        throw new Error(`Fallback proxy request failed with status: ${res.status}. Error: ${errorText}`);
      }
      
      const data = await res.json();

      if (data.error) {
        console.error('❌ NOAA API returned an error via fallback proxy:', data.error.message);
        throw new Error(`NOAA API Error: ${data.error.message}`);
      }

      console.log('✅ Fallback proxy (api.allorigins.win) response received for tide predictions:', data);
      return data;
    }
  } else {
    // Use fallback proxy directly
    console.log('🌐 Using fallback proxy directly for tide predictions...');
    const fallbackProxyUrl = `${config.fallbackProxyUrl}${encodeURIComponent(noaaUrl)}`;
    
    const res = await fetch(fallbackProxyUrl);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Fallback proxy request failed:', res.status, res.statusText, errorText);
      throw new Error(`Fallback proxy request failed with status: ${res.status}. Error: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.error) {
      console.error('❌ NOAA API returned an error via fallback proxy:', data.error.message);
      throw new Error(`NOAA API Error: ${data.error.message}`);
    }

    console.log('✅ Fallback proxy (api.allorigins.win) response received for tide predictions:', data);
    return data;
  }
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
  const begin = dateToYYYYMMDD(start);
  const endObj = new Date(start);
  endObj.setDate(endObj.getDate() + 6);
  const end = dateToYYYYMMDD(endObj);

  return fetchPredictions({
    station: station.id,
    beginDate: begin,
    endDate:   end,
    interval: 'hilo',
    units,
  });
}
