// src/services/noaaService.ts

import { getStationsNearCoordinates } from './tide/stationService';
import { Station } from './tide/stationService';
import { normalizeState } from '@/utils/stateNames';
import { getDistanceKm } from './tide/geo';

// Always use dynamic live lookup for NOAA stations
export async function getStationsForUserLocation(
  userInput: string,
  lat?: number,
  lon?: number,
  state?: string,
): Promise<Station[]> {
  const radius = 30;
  if (lat != null && lon != null) {    const all = await getStationsNearCoordinates(lat, lon, radius);

    const candidateStations = all.map((s) => ({
      ...s,
      distance: getDistanceKm(lat, lon, s.latitude, s.longitude),
    }));
    const filtered = candidateStations.filter(
      (s) =>
        typeof s.latitude === 'number' &&
        typeof s.longitude === 'number' &&
        s.distance <= radius,
    );
    if (filtered.length === 0) {
      const sortedByDistance = [...candidateStations]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      console.warn(
        'No nearby stations. Closest 10:',
        sortedByDistance.map((s) => ({ name: s.name, distance: s.distance })),
      );
    }

    if (state) {
      const target = normalizeState(state);
      const inState = filtered.filter(
        (s) => normalizeState(String(s.state ?? '')) === target,
      );
      if (inState.length > 0) return inState;
    }

    return filtered;
  }
  return [];
}

// There is no 'getNearestStation' or similar export.
// All station choice/selection is user-driven from the UI.
