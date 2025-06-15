
// Default coordinates for locations without lat/lng
export const DEFAULT_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'USA': { lat: 37.7749, lng: -122.4194 }, // San Francisco
  'United States': { lat: 37.7749, lng: -122.4194 },
  'UK': { lat: 51.5074, lng: -0.1278 }, // London
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'Australia': { lat: -33.8688, lng: 151.2093 }, // Sydney
  'Canada': { lat: 43.6532, lng: -79.3832 }, // Toronto
};
