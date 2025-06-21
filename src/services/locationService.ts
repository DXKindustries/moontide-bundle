// src/services/locationService.ts

import { getStationsForUserLocation } from "./noaaService";
import { Station } from "./tide/stationService";

// Returns true if no stations for user location, false otherwise
export async function isInlandLocation(userInput: string, stationId?: string): Promise<boolean> {
  const stations = await getStationsForUserLocation(userInput);
  if (stationId) {
    return !stations.some((station) => station.id === stationId);
  }
  return stations.length === 0;
}

// Returns all stations for the user's location input
export async function getStationsForLocationInput(userInput: string): Promise<Station[]> {
  return getStationsForUserLocation(userInput);
}
