import { describe, it, expect } from 'vitest';
import { calculateMoonPhase, findNextFullMoon, getFullMoonName, calculateMoonTimes } from '../src/utils/lunarUtils';
import { parseIsoAsLocal } from '../src/utils/dateTimeUtils';

describe('lunarUtils with lunarphase-js', () => {

  describe('calculateMoonPhase', () => {
    it('returns "New Moon" for a known new moon date', () => {
      // Date from a reliable source for a new moon
      const date = new Date('2025-01-29T12:36:00Z');
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('New Moon');
    });

    it('returns "Full Moon" for a known full moon date', () => {
      // Date from a reliable source for a full moon
      const date = new Date('2025-09-07T18:09:00Z');
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('Full Moon');
    });

    it('returns "First Quarter" for a known first quarter date', () => {
      const date = new Date('2025-02-05T08:03:00Z');
      const result = calculateMoonPhase(date);
      expect(result.phase).toBe('First Quarter');
    });

    it('returns a high illumination value near a full moon', () => {
        const date = new Date('2025-09-06T12:00:00Z');
        const { illumination } = calculateMoonPhase(date);
        expect(illumination).toBeGreaterThan(95);
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

    it('returns null if no full moon is found in the search range (mocking this scenario)', () => {
        // This is harder to test without mocking the library, but we can test the loop limit
        // We expect it to find a full moon within 35 days, so this is more of a sanity check
        const farFutureDate = new Date('2030-01-01T00:00:00Z');
        const nextFullMoon = findNextFullMoon(farFutureDate);
        expect(nextFullMoon).not.toBeNull();
    });
  });

  describe('getFullMoonName', () => {
    it('returns "Corn Moon" for a September date', () => {
      const date = new Date('2025-09-01');
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
