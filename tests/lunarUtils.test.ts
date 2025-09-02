import { describe, it, expect } from 'vitest';
import { calculateMoonPhase, findNextFullMoon, getFullMoonName, calculateMoonTimes } from '../src/utils/lunarUtils';
import { parseIsoAsLocal } from '../src/utils/dateTimeUtils';

describe('lunarUtils with @tubular/astronomy', () => {

  describe('calculateMoonPhase', () => {
    it('returns "Full Moon" on the day of a full moon', () => {
      const date = new Date('2025-09-07T12:00:00Z'); // Day of the full moon
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('Full Moon');
    });

    it('returns "New Moon" on the day of a new moon', () => {
      const date = new Date('2025-01-29T12:00:00Z'); // Day of the new moon
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('New Moon');
    });

    it('returns "Waxing Crescent" after a new moon', () => {
      const date = new Date('2025-01-31T12:00:00Z'); // 2 days after new moon
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('Waxing Crescent');
    });

    it('returns "Waning Gibbous" after a full moon', () => {
      const date = new Date('2025-09-09T12:00:00Z'); // 2 days after full moon
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('Waning Gibbous');
    });

    it('returns high illumination near a full moon', () => {
        const date = new Date('2025-09-06T12:00:00Z'); // Day before full moon
        const { illumination } = calculateMoonPhase(date);
        expect(illumination).toBeGreaterThan(95);
    });

    it('returns low illumination near a new moon', () => {
        const date = new Date('2025-01-30T12:00:00Z'); // Day after new moon
        const { illumination } = calculateMoonPhase(date);
        expect(illumination).toBeLessThan(5);
    });
  });

  describe('findNextFullMoon', () => {
    it('finds the correct upcoming full moon', () => {
      const startDate = new Date('2025-09-01T00:00:00Z');
      const nextFullMoon = findNextFullMoon(startDate);
      // The next full moon is Sep 7, 2025
      expect(nextFullMoon).not.toBeNull();
      expect(nextFullMoon?.getUTCFullYear()).toBe(2025);
      expect(nextFullMoon?.getUTCMonth()).toBe(8); // 0-indexed for September
      expect(nextFullMoon?.getUTCDate()).toBe(7);
    });
  });

  describe('getFullMoonName', () => {
    it('returns "Corn Moon" for a September date', () => {
      const date = new Date('2025-09-07T12:00:00Z');
      const moonName = getFullMoonName(date);
      expect(moonName?.name).toBe('Corn Moon');
    });
  });

  describe('calculateMoonTimes', () => {
    // This test is for a function that was not modified, so it's kept for regression.
    it('computes moonrise and moonset for Newport on July 16, 2025', () => {
      const date = parseIsoAsLocal('2025-07-16T00:00:00');
      const { moonrise, moonset } = calculateMoonTimes(date, 41.4353, -71.4616);
      expect(moonrise).toBe('2025-07-16T03:04:12');
      expect(moonset).toBe('2025-07-16T15:43:26');
    });
  });

});
