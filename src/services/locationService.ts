// src/services/locationService.ts

import { getStationsForUserLocation } from './noaaService';
import { Station, getStationById as fetchStationById } from "./tide/stationService";

// Returns true if no stations for user location, false otherwise
export async function isInlandLocation(
  userInput: string,
  lat?: number,
  lon?: number,
  stationId?: string,
  state?: string,
): Promise<boolean> {
  const stations = await getStationsForUserLocation(userInput, lat, lon, state);
  if (stationId) {
    return !stations.some((station) => station.id === stationId);
  }
  return stations.length === 0;
}

// Returns all stations for the user's location input
export async function getStationsForLocationInput(
  userInput: string,
  lat?: number,
  lon?: number,
  state?: string,
): Promise<Station[]> {
  return getStationsForUserLocation(userInput, lat, lon, state);
}

export async function getStationById(id: string): Promise<Station | null> {
  return fetchStationById(id);
}
