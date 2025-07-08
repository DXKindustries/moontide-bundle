import { normalizeState } from './stateNames';
import { debugLog } from '@/utils/debugLogger';

export type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip' | 'stationId' | 'stationName';
  zipCode?: string;
  city?: string;
  state?: string;
  stationId?: string;
  stationName?: string;
};

export const parseLocationInput = (input: string): ParsedInput | null => {
  const trimmed = input.trim();
  debugLog('Parsing location input', trimmed);

  // NOAA station id (6-7 digits)
  if (/^\d{6,7}$/.test(trimmed)) {
    debugLog('Input recognized as station ID');
    return { type: 'stationId', stationId: trimmed };
  }
  
  // ZIP code only (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    debugLog('Input recognized as ZIP code');
    return { type: 'zip', zipCode: trimmed };
  }
  
  // City, State ZIP (e.g., "Newport, RI 02840" OR "Newport Rhode Island 02840")
  const cityStateZipMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z\s]+)\s+(\d{5})$/);
  if (cityStateZipMatch) {
    const state = normalizeState(cityStateZipMatch[2]);
    if (state) {
      debugLog('Input recognized as city/state/ZIP');
      return {
        type: 'cityStateZip',
        city: cityStateZipMatch[1].trim(),
        state,
        zipCode: cityStateZipMatch[3]
      };
    }
  }

  // City, State (e.g., "Newport, RI" OR "Newport Rhode Island")
  const cityStateMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z\s]+)$/);
  if (cityStateMatch) {
    const state = normalizeState(cityStateMatch[2]);
    if (state) {
      debugLog('Input recognized as city/state');
      return {
        type: 'cityState',
        city: cityStateMatch[1].trim(),
        state
      };
    }
  }

  // Fallback: treat as NOAA station name or free-form location text
  if (trimmed.length > 0) {
    debugLog('Input treated as station name or free-form');
    return { type: 'stationName', stationName: trimmed };
  }

  debugLog('Location input could not be parsed');
  return null;};