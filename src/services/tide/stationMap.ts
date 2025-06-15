
//--------------------------------------------------------------
// src/services/tide/stationMap.ts
//--------------------------------------------------------------

/**
 * Direct ZIP → NOAA station mapping for locations where the
 * radius search sometimes fails or is too slow.
 *
 * Each entry must include the official NOAA station ID *and*
 * a human-readable name you'd like shown in the UI.
 */
export const STATION_BY_ZIP: Record<
  string,
  { id: string; name: string }
> = {
  // Narragansett, Rhode Island  (South Ferry)
  '02882': {
    id: '8452660',
    name: 'SOUTH FERRY, NARRAGANSETT BAY',
  },
  
  // Newport, Rhode Island - Using Newport specific station
  '02840': {
    id: '8452660', // This is correct - Newport uses the same NOAA station
    name: 'NEWPORT - NARRAGANSETT BAY', // But let's make the name more specific to Newport
  },
};

console.log('🗺️ Station mapping loaded:', STATION_BY_ZIP);
