// src/services/tide/metadata.ts
// --------------------------------------------------
// Provides the NOAA station metadata (list of all stations)
// --------------------------------------------------

/**
 * Fetches the full NOAA station metadata (static asset or remote endpoint).
 * Returns an array of { id, name, lat, lng }
 */
export async function fetchStationMetadata(): Promise<Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
}>> {
  // You would typically load a static asset or API; this is a placeholder
  // Try to load from a public/data/stations.json file if present
  // It's important this keeps the same interface as before
  const res = await fetch('/data/stations.json');
  if (!res.ok) {
    throw new Error('Failed to load station metadata');
  }
  return res.json();
}
