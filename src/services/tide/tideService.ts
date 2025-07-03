/* -------------------------------------------------------------------------- */
/*  src/services/tide/tideService.ts                                          */
/* -------------------------------------------------------------------------- */
/*  Live tide fetcher with tiered fallback: 6-min ➜ hourly ➜ high/low         */

import { getProxyConfig } from './proxyConfig';
import { cacheService } from '../cacheService';
import { IS_DEV } from '../env';

type NoaaStation = { id: string; name: string; lat: number; lng: number };

// Switch API base URL depending on environment. During development we hit the
// local proxy to avoid CORS issues.
const API_URL = IS_DEV
  ? '/noaa-proxy'
  : 'https://api.tidesandcurrents.noaa.gov';
const BASE = `${API_URL}/api/prod/datagetter`;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

type Units = 'english' | 'metric';
type Product = 'predictions' | 'water_level';
type Interval = '6' | 'h' | 'hilo';

interface QueryParams {
  product: Product;
  station: string;
  beginDate: string;
  endDate: string;
  interval: Interval;
  units: Units;
}

/* ---------- helpers ---------- */

const yyyymmdd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const cacheKey = (p: QueryParams) =>
  [p.product, p.station, p.beginDate, p.endDate, p.interval, p.units].join(':');

const buildUrl = (p: QueryParams) =>
  `${BASE}?${new URLSearchParams({
    product: p.product,
    application: 'MoonTide',
    format: 'json',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    units: p.units,
    station: p.station,
    begin_date: p.beginDate,
    end_date: p.endDate,
    interval: p.interval,
  }).toString()}`;

/* ---------- core fetch ---------- */

async function tryFetch(url: string) {
  const config = getProxyConfig();
  let fetchUrl = url;

  // When running in the browser, route through a proxy to avoid CORS issues
  if (typeof window !== 'undefined') {
    if (config.useLocalProxy) {
      fetchUrl = `${config.localProxyUrl}?url=${encodeURIComponent(url)}`;
    } else if (config.fallbackProxyUrl) {
      fetchUrl = `${config.fallbackProxyUrl}${encodeURIComponent(url)}`;
    }
  }

  try {
    const r = await fetch(fetchUrl);
    if (!r.ok) return { rows: null, err: `HTTP ${r.status}` };
    const data = await r.json();
    const rows = data.predictions ?? data.data ?? null;
    if (Array.isArray(rows) && rows.length) return { rows: data, err: null };
    return { rows: null, err: data?.error ?? 'empty' };
  } catch (err) {
    return { rows: null, err };
  }
}

async function fetchTier(
  base: Omit<QueryParams, 'product' | 'interval'>,
  station: NoaaStation,
): Promise<any> {
  const tiers: Array<Pick<QueryParams, 'product' | 'interval'>> = [
    { product: 'water_level', interval: '6' },
    { product: 'predictions', interval: 'h' },
    { product: 'predictions', interval: 'hilo' },
  ];

  for (const tier of tiers) {
    const p: QueryParams = { ...base, ...tier };
    const key = cacheKey(p);

    const cached = cacheService.get<any>(key);
    if (cached) {
      console.log(`✅ Cache HIT for ${key}`);
      return cached;
    }

    const { rows, err } = await tryFetch(buildUrl(p));
    if (rows) {
      cacheService.set(key, rows, CACHE_TTL);
      return rows;
    }

    console.info(
      `ℹ️ No data for ${tier.product}/${tier.interval} → trying next tier`,
      err,
    );
  }

  console.warn('⚠️ NOAA returned no data for any tier', {
    station: station.id,
    err,
  });
  return { predictions: [] }; // allow UI to show “no data”
}

/* ---------- public API ---------- */

export const fetchDailyTides = (
  station: NoaaStation,
  date: Date,
  units: Units = 'english',
) =>
  fetchTier(
    {
      station: station.id,
      beginDate: yyyymmdd(date),
      endDate: yyyymmdd(date),
      units,
    },
    station,
  );

export const fetchSixMinuteRange = (
  station: NoaaStation,
  start: Date,
  end: Date,
  units: Units = 'english',
) =>
  fetchTier(
    {
      station: station.id,
      beginDate: yyyymmdd(start),
      endDate: yyyymmdd(end),
      units,
    },
    station,
  );
