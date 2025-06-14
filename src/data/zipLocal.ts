//--------------------------------------------------------------
// src/data/zipLocal.ts
//--------------------------------------------------------------

/**
 * Hand-picked ZIP-code entries that MUST work even if the
 * external geo API is down or incomplete.
 *
 * Add more rows as needed.  Keep lat/lng in decimal degrees.
 */
export const LOCAL_ZIP_DB: Record<
  string,
  { lat: number; lng: number; city: string; state: string }
> = {
  // Narragansett, Rhode Island
  '02882': {
    lat: 41.4353,
    lng: -71.4616,
    city: 'Narragansett',
    state: 'RI',
  },
};
