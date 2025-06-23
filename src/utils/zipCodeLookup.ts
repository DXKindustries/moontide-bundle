import { safeLocalStorage } from '@/utils/localStorage';
import { cacheService } from '@/services/cacheService';

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

const ZIP_API_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/*───────────────────────────────────────────────────────────*/
/*  Small cache stored in localStorage (legacy support)      */
/*───────────────────────────────────────────────────────────*/

const ZIP_CACHE_KEY = 'zipCache';

function getZipCache(): Record<string, ZipApiResponse> {
  return safeLocalStorage.get(ZIP_CACHE_KEY) ?? {};
}

function saveZipCache(zip: string, data: ZipApiResponse) {
  const cache = safeLocalStorage.get(ZIP_CACHE_KEY) ?? {};
  cache[zip] = data;
  safeLocalStorage.set(ZIP_CACHE_KEY, cache);
}

export const lookupZipCode = async (
  zipCode: string | number | Promise<any> | Record<string, unknown>
): Promise<ZipApiResponse | null> => {
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
  if (!/^\d{5}$/.test(cleanZip)) return null;

  const cacheKey = `zip-api:${cleanZip}`;

  // ── 1. NEW CACHE SYSTEM ──────────────────────────────────
  const cached = cacheService.get<ZipApiResponse>(cacheKey);
  if (cached) {
    console.log(`✅ ZIP ${cleanZip} found in new cache system`);
    return cached;
  }

  // ── 2. LEGACY LOCAL CACHE ────────────────────────────────
  const legacyCache = getZipCache();
  if (legacyCache[cleanZip]) {
    const result = legacyCache[cleanZip];
    // Migrate to new cache system
    cacheService.set(cacheKey, result, ZIP_API_CACHE_TTL);
    console.log(`✅ ZIP ${cleanZip} found in legacy cache and migrated`);
    return result;
  }

  // ── 3. REMOTE LOOK-UP ────────────────────────────────────
  try {
    console.log(`🌐 Fetching ZIP ${cleanZip} from remote API`);
    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    if (!res.ok) return null;

    const data = (await res.json()) as ZipApiResponse;
    
    // Save to both cache systems
    cacheService.set(cacheKey, data, ZIP_API_CACHE_TTL);
    saveZipCache(cleanZip, data);
    
    console.log(`✅ ZIP ${cleanZip} fetched and cached successfully`);
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
) {
  // ...rest of your function
}
