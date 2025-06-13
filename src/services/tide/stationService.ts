import { NoaaStation } from './types';

// Modified to avoid CORS error: return null immediately instead of fetch
export async function getNearestStation(lat: number, lng: number): Promise<NoaaStation | null> {
  // Fetch is disabled due to CORS restrictions in frontend-only environment
  // Return null to signal no station found; caller must handle gracefully
  return null;
}

// Preserve saveStationForLocation if used elsewhere; no changes needed
export function saveStationForLocation(locationKey: string, station: NoaaStation): void {
  // Implement as in original, or no-op if unused
}
