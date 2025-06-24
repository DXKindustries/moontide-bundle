// src/services/tideDataService.ts

// Fetches 7-day tide data for the selected station from backend
export async function getTideData(stationId: string, dateIso: string) {
  const response = await fetch(
    `/tides?stationId=${encodeURIComponent(stationId)}&date=${encodeURIComponent(dateIso)}`
  );
  if (!response.ok) throw new Error("Unable to fetch tide data.");
  const data = await response.json();
  return data;
}

// If you need to get station options in this file:
import { getStationsForUserLocation } from "./noaaService";
// Usage: await getStationsForUserLocation(locationInput)
