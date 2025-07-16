import { describe, it, expect } from 'vitest';
import { calculateMoonPhase } from '../src/utils/lunarUtils';

// Test a date mid-cycle far from reference to ensure accuracy
// July 16, 2025 should be Waning Gibbous according to trusted ephemeris

describe('calculateMoonPhase', () => {
  it('returns Waning Gibbous for July 16, 2025', () => {
    const date = new Date('2025-07-16T00:00:00Z');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('Waning Gibbous');
  });

  it('handles new moon in 2026 without drift', () => {
    const date = new Date('2026-07-15T00:00:00Z');
    const result = calculateMoonPhase(date);
    expect(result.phase).toBe('New Moon');
  });
});
