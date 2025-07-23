
/**
 * This file previously contained hardcoded station mappings.
 * We now use real NOAA station data fetched from their API.
 * 
 * Keeping this file for backwards compatibility, but it's no longer used
 * for station lookups. Real station data is fetched from realStationService.ts
 */

// Basic ZIP -> station mapping used as a fallback when live
// station lookups fail. Only contains a few well known ZIP
// codes and their associated NOAA station ids.
export const STATION_BY_ZIP: Record<string, { id: string; name: string }> = {
  // Newport, Rhode Island
  '02840': { id: '8452660', name: 'Newport, RI' },
};

