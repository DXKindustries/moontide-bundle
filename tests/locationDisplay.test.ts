import { describe, it, expect } from 'vitest';
import { formatLocationSubtext } from '../src/utils/locationFormatting';
import { LocationData } from '../src/types/locationTypes';

describe('formatLocationSubtext', () => {
  it('prefers userSelectedState over NOAA state', () => {
    const location: LocationData = {
      zipCode: '00000',
      city: 'Test',
      state: 'XX',
      userSelectedState: 'YY',
      lat: 1,
      lng: 2,
      stationId: '123',
      stationName: 'Station',
      isManual: false,
    };
    const stationStates: Record<string, string> = { '123': 'ZZ' };
    const result = formatLocationSubtext(location, stationStates);
    expect(result.startsWith('YY')).toBe(true);
  });
});
