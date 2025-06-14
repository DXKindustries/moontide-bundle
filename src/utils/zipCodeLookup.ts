//--------------------------------------------------------------
// src/utils/zipCodeLookup.ts
//--------------------------------------------------------------

import { safeLocalStorage } from './localStorage';

/** Shape of the zippopotam.us API response we care about */
interface ZipApiResponse {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places: {
    'place name': string;
    state: string;
    latitude: string;
    longitude: string;
  }[];
}

//--------------------------------------------------------------
// Local-storage helpers  (unchanged)
//--------------------------------------------------------------

const ZIP_CACHE_KEY = 'zipCache';

function getZipCache(): Record<string, ZipApiResponse> {
  return safeLocalStorage.get(ZIP_CACHE_KEY) ?? {};
}

function saveZipCache(zip: string, data: ZipApiResponse) {
  const cache = getZipCache();
  cache[zip] = data;
  safeLocalStorage.set(ZIP_CACHE_KEY, cache);
}

//--------------------------------------------------------------
// Main function
//--------------------------------------------------------------

/**
 * Look up a ZIP code.
 * – First returns cached data if present
 * – Otherwise calls https://api.zippopotam.us/us/{ZIP}
 * – Returns null on 404 or network failure
 */
export const lookupZipCode = async (
  zipCode: string | number | Promise<any>
): Promise<ZipApiResponse | null> => {
  console.log('DEBUG lookupZipCode param →', zipCode);

  // unwrap accidental Promise input
  if (typeof (zipCode as any)?.then === 'function') {
    zipCode = await zipCode;
  }
/* ✱ Add this directly below ✱ */
if (typeof zipCode === 'object' && zipCode !== null) {
  zipCode = (zipCode as any).zipCode ?? (zipCode as any).zip ?? '';
}
  const cleanZip = String(zipCode).trim();
  if (!cleanZip) return null;

  //── 1. cache check ──────────────────────────────────────────
  const cache = getZipCache();
  if (cache[cleanZip]) return cache[cleanZip];

  //── 2. remote lookup ────────────────────────────────────────
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    if (!res.ok) {
      console.warn(`ZIP lookup failed with status ${res.status}`);
      return null; // graceful 404
    }

    const data = (await res.json()) as ZipApiResponse;
    saveZipCache(cleanZip, data);
    return data;
  } catch (err) {
    console.error('ZIP lookup network error:', err);
    return null;
  }
};
// ------------------------------------------------------------
// Convenience: turn ZIP →  "City, ST 01234"
// ------------------------------------------------------------
export async function formatCityStateFromZip(
  zipCode: string | number | Promise<any>
): Promise<string | null> {
  const data = await lookupZipCode(zipCode);
  if (!data) return null;

  const place   = data.places[0]['place name'];
  const state   = data.places[0].state;
  const clean   = String(zipCode).trim();

  return `${place}, ${state} ${clean}`;
}
