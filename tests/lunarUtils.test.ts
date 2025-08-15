import { describe, it, expect } from 'vitest';
import { calculateMoonPhase, calculateMoonTimes } from '../src/utils/lunarUtils';
import { parseIsoAsLocal } from '../src/utils/dateTimeUtils';

// Test a date mid-cycle far from reference to ensure accuracy
// July 16, 2025 should be Waning Gibbous according to trusted ephemeris

describe('calculateMoonPhase', () => {
  it('returns Waning Gibbous for July 16, 2025', () => {
    const date = parseIsoAsLocal('2025-07-16T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('Waning Gibbous');
  });

  it('handles new moon in 2026 without drift', () => {
    const date = parseIsoAsLocal('2026-07-15T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('New Moon');
  });
});

describe('calculateMoonTimes', () => {
  it('computes moonrise and moonset for Newport on July 16, 2025', () => {
    const date = parseIsoAsLocal('2025-07-16T00:00:00');
    const { moonrise, moonset } = calculateMoonTimes(date, 41.4353, -71.4616);
    expect(moonrise).toBe('2025-07-16T16:42:34');
    expect(moonset).toBe('2025-07-16T04:02:44');
  });
});
