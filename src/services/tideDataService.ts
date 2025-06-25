// src/services/tideDataService.ts
//--------------------------------------------------------------
//  Fetch 7-day tide data for the given NOAA station
//--------------------------------------------------------------

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

  /* --- hit our proxy ------------------------------------------------------ */
  const resp = await fetch(`/tides?stationId=${stationId}&date=${yyyymmdd}`);
  if (!resp.ok) throw new Error('Unable to fetch tide data');

  const raw = await resp.json();

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
