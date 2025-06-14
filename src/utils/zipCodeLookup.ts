//--------------------------------------------------------------
// src/utils/zipCodeLookup.ts
//--------------------------------------------------------------

import { safeLocalStorage } from '@/utils/localStorage';

/** zippopotam.us response shape (only the fields we use) */
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

/*───────────────────────────────────────────────────────────*/
/*  Local in-memory fallback cache                           */
/*───────────────────────────────────────────────────────────*/

const ZIP_CACHE_KEY = 'zipCache';

function getZipCache(): Record<string, ZipApiResponse> {
  return safeLocalStorage.get(ZIP_CACHE_KEY) ?? {};
}

function saveZipCache(zip: string, data: ZipApiResponse) {
  const cache = getZipCache();
  cache[zip] = data;
  safeLocalStorage.set(ZIP_CACHE_KEY, cache);
}

/*───────────────────────────────────────────────────────────*/
/*  Main function                                            */
/*───────────────────────────────────────────────────────────*/

/**
 * Look up a ZIP code → city/state + lat/lng.
 *
 * • First returns cached data if present
 * • Accepts string, number, Promise, or {zip: …}/{zipCode: …}
 * • Falls back to https://api.zippopotam.us/us/{ZIP}
 * • Returns null on 404 / network error / invalid ZIP
 */
export const lookupZipCode = async (
  zipCode: string | number | Promise<any> | Record<string, unknown>
): Promise<ZipApiResponse | null> => {
  console.log('DEBUG lookupZipCode param →', zipCode);

  // ── 1. unwrap Promise input ──────────────────────────────
  if (typeof (zipCode as any)?.then === 'function') {
    zipCode = await zipCode;
  }

  // ── 2. unwrap common object shapes ───────────────────────
  if (typeof zipCode === 'object' && zipCode !== null) {
    zipCode =
      (zipCode as any).zip ??
      (zipCode as any).zipCode ??
      (zipCode as any).value ??
      '';
  }

  // ── 3. ensure we now have a trimmed 5-digit string ───────
  const cleanZip = String(zipCode).trim();
  if (!/^\d{5}$/.test(cleanZip)) {
    console.warn('lookupZipCode: invalid ZIP →', zipCode);
    return null;
  }

  // ── 4. return cached result if we already know it ────────
  const cache = getZipCache();
  if (cache[cleanZip]) return cache[cleanZip];

  // ── 5. remote lookup ─────────────────────────────────────
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

/*───────────────────────────────────────────────────────────*/
/*  Convenience helper for UI labels                         */
/*───────────────────────────────────────────────────────────*/

/** Turn “02882” → “Narragansett, Rhode Island 02882” */
export async function formatCityStateFromZip(
  zipCode: string | number | Promise<any> | Record<string, unknown>
): Promise<string | null> {
  const data = await lookupZipCode(zipCode);
  if (!data) return null;

  const place = data.places[0]['place name'];
  const state = data.places[0].state;
  const clean = String(zipCode).trim();

  return `${place}, ${state} ${clean}`;
}
