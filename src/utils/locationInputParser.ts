import { normalizeState } from './stateNames';

export type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip' | 'stationId' | 'stationName';
  zipCode?: string;
  city?: string;
  state?: string;
  stationId?: string;
  stationName?: string;
};

export const parseLocationInput = (input: string): ParsedInput | null => {
  console.log('[DEBUG] Parser Input:', input);
  const trimmed = input.trim();
  let result: ParsedInput | null = null;

  // NOAA station id (6-7 digits)
  if (/^\d{6,7}$/.test(trimmed)) {
    result = { type: 'stationId', stationId: trimmed };
  }
  
  // ZIP code only (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    result = { type: 'zip', zipCode: trimmed };
  }
  
  // City, State ZIP (e.g., "Newport, RI 02840" OR "Newport Rhode Island 02840")
  if (!result) {
    const cityStateZipMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z\s]+)\s+(\d{5})$/);
    if (cityStateZipMatch) {
      const state = normalizeState(cityStateZipMatch[2]);
      if (state) {
        result = {
          type: 'cityStateZip',
          city: cityStateZipMatch[1].trim(),
          state,
          zipCode: cityStateZipMatch[3]
        };
      }
    }
  }

  // City, State (e.g., "Newport, RI" OR "Newport Rhode Island")
  if (!result) {
    const cityStateMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z\s]+)$/);
    if (cityStateMatch) {
      const state = normalizeState(cityStateMatch[2]);
      if (state) {
        result = {
          type: 'cityState',
          city: cityStateMatch[1].trim(),
          state
        };
      }
    }
  }

  // Fallback: treat as NOAA station name or free-form location text
  if (!result && trimmed.length > 0) {
    result = { type: 'stationName', stationName: trimmed };
  }

  console.log('[DEBUG] Parser Output:', {
    zipCode: result?.zipCode,
    stationId: result?.stationId,
  });
  return result;
};