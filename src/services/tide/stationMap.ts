
/**
 * This file previously contained hardcoded station mappings.
 * We now use real NOAA station data fetched from their API.
 * 
 * Keeping this file for backwards compatibility, but it's no longer used
 * for station lookups. Real station data is fetched from realStationService.ts
 */

// Empty mapping - we now use real NOAA data
export const STATION_BY_ZIP: Record<string, { id: string; name: string }> = {};

console.log('🗺️ Station mapping is now using real NOAA data instead of hardcoded values');
