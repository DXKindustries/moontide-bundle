import { describe, it, expect } from 'vitest';
import { calculateMoonPhase, calculateMoonTimes, getFullMoonName } from '../src/utils/lunarUtils';
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
    expect(moonrise).toBe('2025-07-16T03:04:12');
    expect(moonset).toBe('2025-07-16T15:43:26');
  });
});

describe('getFullMoonName', () => {
  it('returns "Corn Moon" for a September date', () => {
    const date = new Date('2025-09-01');
    const moonName = getFullMoonName(date);
    expect(moonName?.name).toBe('Corn Moon');
  });
});

describe('calculateMoonPhase with full moon fix', () => {
  it('correctly identifies a full moon on the exact date', () => {
    const date = parseIsoAsLocal('2025-09-07T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('Full Moon');
    expect(result.illumination).toBe(100);
  });

  it('does not identify the day before a full moon as a full moon', () => {
    const date = parseIsoAsLocal('2025-09-06T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).not.toBe('Full Moon');
    expect(result.phase).toBe('Waxing Gibbous');
  });
});

describe('calculateMoonPhase with new moon fix', () => {
  it('correctly identifies a new moon on the exact date', () => {
    const date = parseIsoAsLocal('2025-09-22T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('New Moon');
    expect(result.illumination).toBe(0);
  });

  it('does not identify the day after a new moon as a new moon', () => {
    const date = parseIsoAsLocal('2025-09-23T00:00:00');
    const result = calculateMoonPhase(date);
    expect(result.phase).not.toBe('New Moon');
    expect(result.phase).toBe('Waxing Crescent');
  });
});
