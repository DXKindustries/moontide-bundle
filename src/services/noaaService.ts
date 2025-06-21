// src/services/noaaService.ts

import { getStationsForLocation } from "./tide/stationService";
import { Station } from "./tide/stationService";

// Always use dynamic live lookup for NOAA stations
export async function getStationsForUserLocation(userInput: string): Promise<Station[]> {
  return getStationsForLocation(userInput);
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
