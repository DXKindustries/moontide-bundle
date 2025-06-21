// src/services/tideDataService.ts

// Fetches 7-day tide data for the selected location and station from backend
export async function getTideData(locationInput: string, stationId: string) {
  const response = await fetch(
    `/api/tides?locationInput=${encodeURIComponent(locationInput)}&stationId=${encodeURIComponent(stationId)}`
  );
  if (!response.ok) throw new Error("Unable to fetch tide data.");
  const data = await response.json();
  return data;
}

// If you need to get station options in this file:
import { getStationsForUserLocation } from "./noaaService";
// Usage: await getStationsForUserLocation(locationInput)
