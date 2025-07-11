// src/services/tideDataService.ts
//--------------------------------------------------------------
//  Fetch 8-day tide data for the given NOAA station
//--------------------------------------------------------------

const NOAA_DATA_BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
import { debugLog } from '@/utils/debugLogger';

export interface Prediction {
  timeIso: string;
  valueFt: number;
  kind: 'H' | 'L';
}

export async function getTideData(
  stationId: string,
  dateIso: string
): Promise<Prediction[]> {
  const yyyymmdd = dateIso.replace(/-/g, '');
  if (!stationId || yyyymmdd.length !== 8) {
    throw new Error('Invalid parameters for tide data request');
  }

  const start = new Date(dateIso);
  const end = new Date(start);
  // Fetch one extra day to ensure the last day's cycles are complete
  end.setDate(start.getDate() + 8);

  const format = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

  const url = `${NOAA_DATA_BASE}?${new URLSearchParams({
    product: 'predictions',
    application: 'LunarWaveWatcher',
    format: 'json',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    interval: 'hilo',
    units: 'english',
    station: stationId,
    begin_date: format(start),
    end_date: format(end),
  }).toString()}`;

  debugLog('Fetching tide data', { stationId, url });

  let raw: unknown;
  try {
    const resp = await fetch(url);
    debugLog('Tide data HTTP status', { stationId, status: resp.status });
    if (!resp.ok) throw new Error('Unable to fetch tide data');
    raw = await resp.json();
    debugLog('Tide data response received', { stationId, raw });
  } catch (err) {
    debugLog('Tide data fetch error', err);
    throw err instanceof Error ? err : new Error('Failed to fetch tide data');
  }

  const data = raw as { predictions?: { t: string; v: string; type: 'H' | 'L' }[] };
  const list = Array.isArray(data?.predictions) ? data.predictions : [];
  if (!Array.isArray(data?.predictions)) {
    debugLog('Predictions missing in response', { stationId, raw });
  }
  debugLog('Parsed tide predictions', { stationId, count: list.length });
  return list.map((p: { t: string; v: string; type: 'H' | 'L' }): Prediction => ({
    timeIso: `${p.t.replace(' ', 'T')}:00`,
    valueFt: parseFloat(p.v),
    kind: p.type,
  }));}

export { getStationsForUserLocation } from './noaaService';
