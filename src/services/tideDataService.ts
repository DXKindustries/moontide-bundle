// src/services/tideDataService.ts

// Fetches 7-day tide data for the selected station from backend
export interface Prediction {
  timeIso: string;   // ISO string, local time
  valueFt: number;   // feet (already in response)
  kind: 'H' | 'L';   // NOAA's type field
}

export async function getTideData(
  stationId: string,
  dateIso: string
): Promise<Prediction[]> {
  const yyyymmdd = dateIso.replace(/-/g, '');
  if (!stationId || yyyymmdd.length !== 8) {
    throw new Error('Invalid parameters for tide data request');
  }

  const response = await fetch(
    `/tides?stationId=${stationId}&date=${yyyymmdd}`
  );

  if (!response.ok) throw new Error('Unable to fetch tide data.');

  const data = await response.json();
  const predictions = Array.isArray(data?.predictions) ? data.predictions : [];

  return predictions.map((p: { t: string; v: string; type: 'H' | 'L' }) => ({
    timeIso: `${p.t.replace(' ', 'T')}:00`,
    valueFt: parseFloat(p.v),
    kind: p.type,
  }));
}

// If you need to get station options in this file:
import { getStationsForUserLocation } from "./noaaService";
// Usage: await getStationsForUserLocation(locationInput)
