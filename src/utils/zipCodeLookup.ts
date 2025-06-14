//--------------------------------------------------------------
// src/utils/zipCodeLookup.ts
//--------------------------------------------------------------

import { safeLocalStorage } from '@/utils/localStorage';
import { LOCAL_ZIP_DB } from '@/data/zipLocal';          //  ← new import

/** zippopotam.us response shape (minimal) */
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
/*  Small cache stored in localStorage                       */
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

export const lookupZipCode = async (
  zipCode: string | number | Promise<any> | Record<string, unknown>
): Promise<ZipApiResponse | null> => {
  console.log('DEBUG lookupZipCode param →', zipCode);

  // unwrap Promise
  if (typeof (zipCode as any)?.then === 'function') {
    zipCode = await zipCode;
  }

  // unwrap common object shapes
  if (typeof zipCode === 'object' && zipCode !== null) {
    zipCode =
      (zipCode as any).zip ??
      (zipCode as any).zipCode ??
      (zipCode as any).value ??
      '';
  }

  const cleanZip = String(zipCode).trim();
  if (!/^\d{5}$/.test(cleanZip)) return null;      // not a 5-digit ZIP

  // ── 1. LOCAL FALLBACK TABLE ──────────────────────────────
  if (LOCAL_ZIP_DB[cleanZip]) {
    const z = LOCAL_ZIP_DB[cleanZip];
    return {
      'post code': cleanZip,
      country: 'United States',
      'country abbreviation': 'US',
      places: [
        {
          'place name': z.city,
          state: z.state,
          latitude:  String(z.lat),
          longitude: String(z.lng),
        },
      ],
    };
  }

  // ── 2. LOCAL CACHE ───────────────────────────────────────
  const cache = getZipCache();
  if (cache[cleanZip]) return cache[cleanZip];

  // ── 3. REMOTE LOOK-UP ────────────────────────────────────
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    if (!res.ok) return null;               // graceful 404

    const data = (await res.json()) as ZipApiResponse;
    saveZipCache(cleanZip, data);
    return data;
  } catch (err) {
    console.error('ZIP lookup network error:', err);
    return null;
  }
};

/*───────────────────────────────────────────────────────────*/
/*  Convenience label                                        */
/*───────────────────────────────────────────────────────────*/

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
