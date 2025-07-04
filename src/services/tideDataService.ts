// src/services/tideDataService.ts
//--------------------------------------------------------------
//  Fetch 7-day tide data for the given NOAA station
//--------------------------------------------------------------

const NOAA_DATA_BASE =
  'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

export interface Prediction {
  /** ISO date-time in the station’s local time zone (e.g. “2025-06-25T04:36:00”) */
  timeIso: string;
  /** Height in feet */
  valueFt: number;
  /** High (H) or Low (L) */
  kind: 'H' | 'L';
}

export async function getTideData(
  stationId: string,
  /** date string from the UI in YYYY-MM-DD form */
  dateIso: string
): Promise<Prediction[]> {
  /* --- basic validation --------------------------------------------------- */
  const yyyymmdd = dateIso.replace(/-/g, '');
  if (!stationId || yyyymmdd.length !== 8) {
    throw new Error('Invalid parameters for tide data request');
  }

  /* --- build fetch URL ---------------------------------------------------- */
  const start = new Date(dateIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

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
  console.log('📡 getTideData fetch:', { stationId, url });
  let raw: any;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('❌ NOAA response error', resp.status);
      throw new Error('Unable to fetch tide data');
    }
    raw = await resp.json();
    console.log('🌊 NOAA raw response', raw);
  } catch (err) {
    console.error('❌ getTideData error', err);
    throw err;
  }

  /* --- NOAA returns: { predictions:[{ t:"YYYY-MM-DD HH:mm", v:"x.xx", type:"H|L" }, … ] } */
  const list = Array.isArray(raw?.predictions) ? raw.predictions : [];

  return list.map((p: { t: string; v: string; type: 'H' | 'L' }): Prediction => ({
    timeIso: `${p.t.replace(' ', 'T')}:00`,  // “YYYY-MM-DDTHH:mm:00”
    valueFt: parseFloat(p.v),
    kind: p.type,
  }));
}

/* ------------- optional helper re-export ---------------------------------- */
export { getStationsForUserLocation } from './noaaService';
