// src/services/tide/stationService.ts

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
  state?: string;
  distance?: number;
}

// Always fetch from backend API (dynamic, live, no mock data)
export async function getStationsForLocation(
  userInput: string
): Promise<Station[]> {
  const response = await fetch(
    `/api/noaa-stations?locationInput=${encodeURIComponent(userInput)}`
  );
  if (!response.ok) throw new Error("Unable to fetch station list.");
  const data = await response.json();
  return data.stations || [];
}
