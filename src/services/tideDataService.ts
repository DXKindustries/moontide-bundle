// src/services/tideDataService.ts

// Fetches 7-day tide data for the selected station from backend
export async function getTideData(stationId: string, dateIso: string) {
  const yyyymmdd = dateIso.replace(/-/g, '');
  if (!stationId || yyyymmdd.length !== 8) {
    throw new Error('Invalid parameters for tide data request');
  }
  const response = await fetch(
    `/tides?stationId=${stationId}&date=${yyyymmdd}`
  );
  if (!response.ok) throw new Error("Unable to fetch tide data.");
  const data = await response.json();
  return data;
}

// If you need to get station options in this file:
import { getStationsForUserLocation } from "./noaaService";
// Usage: await getStationsForUserLocation(locationInput)
