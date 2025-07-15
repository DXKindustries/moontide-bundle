/* -------------------------------------------------------------------------- */
/*  src/services/tide/tideService.ts                                          */
/* -------------------------------------------------------------------------- */
/*  Live tide fetcher with tiered fallback: 6-min ➜ hourly ➜ high/low         */

import { cacheService } from '../cacheService';

type NoaaStation = { id: string; name: string; lat: number; lng: number };

// Always call the NOAA production API directly.
const BASE = 'https://api.tidesandcurrents.noaa.gov';
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

/* ---------- validation helpers ---------- */

const isValidStationId = (id: string | null | undefined) =>
  typeof id === 'string' && /^\d+$/.test(id.trim());

const isValidYyyymmdd = (s: string | null | undefined) =>
  typeof s === 'string' && /^\d{8}$/.test(s);

const parseYyyymmdd = (s: string) =>
  new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);

function validateParams(p: Omit<QueryParams, 'product' | 'interval'>): string | null {
  if (!isValidStationId(p.station)) return 'Invalid station ID';
  if (!isValidYyyymmdd(p.beginDate) || !isValidYyyymmdd(p.endDate)) {
    return 'Invalid date format';
  }
  const start = parseYyyymmdd(p.beginDate);
  const end = parseYyyymmdd(p.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid date';
  }
  if (start > end) return 'Begin date is after end date';
  if (!p.units) return 'Missing units';
  return null;
}

/* ---------- helpers ---------- */

const yyyymmdd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const cacheKey = (p: QueryParams) =>
  [p.product, p.station, p.beginDate, p.endDate, p.interval, p.units].join(':');

const buildUrl = (p: QueryParams) =>
  `${BASE}/api/prod/datagetter?${new URLSearchParams({
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
  try {
    const r = await fetch(url);
    if (!r.ok) return { rows: null, err: `HTTP ${r.status}` };
    const data = await r.json();
    const rows = data.predictions ?? data.data ?? null;
    if (Array.isArray(rows) && rows.length) return { rows: data, err: null };
    return { rows: null, err: data?.error ?? 'empty' };
  } catch (err) {
    return { rows: null, err };
  }
}

import type { NoaaTideResponse } from './types';

async function fetchTier(
  base: Omit<QueryParams, 'product' | 'interval'>,
  station: NoaaStation,
): Promise<NoaaTideResponse> {
  const validationError = validateParams(base);
  if (validationError) {
    console.error('❌ NOAA request aborted:', validationError, base);
    return { predictions: [] };
  }
  const tiers: Array<Pick<QueryParams, 'product' | 'interval'>> = [
    { product: 'water_level', interval: '6' },
    { product: 'predictions', interval: 'h' },
    { product: 'predictions', interval: 'hilo' },
  ];

  for (const tier of tiers) {
    const p: QueryParams = { ...base, ...tier };
    const key = cacheKey(p);

    const cached = cacheService.get<NoaaTideResponse>(key);
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
