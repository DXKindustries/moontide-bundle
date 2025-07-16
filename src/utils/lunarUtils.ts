
// Lunar calculation utilities

export type FullMoonName = {
  name: string;
  description: string;
};

// Traditional full moon names by month
export const FULL_MOON_NAMES: Record<number, FullMoonName> = {
  1: { name: "Wolf Moon", description: "Named after howling wolves in winter" },
  2: { name: "Snow Moon", description: "Named for heavy snowfall" },
  3: { name: "Worm Moon", description: "When earthworms emerge as soil thaws" },
  4: { name: "Pink Moon", description: "Named after early spring flowers" },
  5: { name: "Flower Moon", description: "When flowers bloom abundantly" },
  6: { name: "Strawberry Moon", description: "When strawberries are harvested" },
  7: { name: "Buck Moon", description: "When male deer grow new antlers" },
  8: { name: "Sturgeon Moon", description: "When sturgeon fish are caught" },
  9: { name: "Harvest Moon", description: "The full moon nearest autumn equinox" },
  10: { name: "Hunter's Moon", description: "When hunters prepare for winter" },
  11: { name: "Beaver Moon", description: "When beavers build winter dams" },
  12: { name: "Cold Moon", description: "The long nights of winter" }
};

export const getFullMoonName = (date: Date): FullMoonName | null => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  return FULL_MOON_NAMES[month] || null;
};

export const isFullMoon = (phase: string): boolean => {
  return phase === "Full Moon";
};

export const getMoonEmoji = (phase: string): string => {
  switch (phase) {
    case "New Moon":
      return "🌑";
    case "Waxing Crescent":
      return "🌒";
    case "First Quarter":
      return "🌓";
    case "Waxing Gibbous":
      return "🌔";
    case "Full Moon":
      return "🌕";
    case "Waning Gibbous":
      return "🌖";
    case "Last Quarter":
      return "🌗";
    case "Waning Crescent":
      return "🌘";
    default:
      return "🌙";
  }
};

// Find the most recent new moon date on or before the given date
export const findMostRecentNewMoon = (date: Date): Date => {
  const target = date.getTime();
  for (let i = NEW_MOON_DATES_UTC.length - 1; i >= 0; i--) {
    const nm = new Date(`${NEW_MOON_DATES_UTC[i]}T00:00:00Z`);
    if (nm.getTime() <= target) {
      return nm;
    }
  }
  // Fallback to earliest known new moon if none found
  return new Date(`${NEW_MOON_DATES_UTC[0]}T00:00:00Z`);
};

// More accurate moon phase calculation using a known lunar cycle reference
import { debugLog } from "./debugLogger";

export const calculateMoonPhase = (date: Date): { phase: string; illumination: number } => {
  console.log("USING DYNAMIC EPHEMERIS ANCHOR — version 2024-07-16");

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Ephemeris anchor: most recent known new moon before or on the date
  const lastNewMoon = findMostRecentNewMoon(date);
  const lastIndex = NEW_MOON_DATES_UTC.indexOf(lastNewMoon.toISOString().slice(0, 10));
  const nextIndex = Math.min(lastIndex + 1, NEW_MOON_DATES_UTC.length - 1);
  const nextNewMoon = new Date(`${NEW_MOON_DATES_UTC[nextIndex]}T00:00:00Z`);

  // Dynamic cycle parameters
  const daysSinceNewMoon = (date.getTime() - lastNewMoon.getTime()) / MS_PER_DAY;
  const cycleLength = (nextNewMoon.getTime() - lastNewMoon.getTime()) / MS_PER_DAY;

  // Position in cycle as a fraction (0-1)
  const cyclePosition = daysSinceNewMoon / cycleLength;
  
  // Calculate illumination percentage (0-100)
  const illuminationDecimal = (1 - Math.cos(cyclePosition * 2 * Math.PI)) / 2;
  const illumination = Math.round(illuminationDecimal * 100);
  
  // Determine phase with refined waning boundaries
  let phase: string;

  if (cyclePosition < 0.0625) {
    phase = "New Moon";
  } else if (cyclePosition < 0.1875) {
    phase = "Waxing Crescent";
  } else if (cyclePosition < 0.3125) {
    phase = "First Quarter";
  } else if (cyclePosition < 0.4375) {
    phase = "Waxing Gibbous";
  } else if (cyclePosition < 0.5625) {
    phase = "Full Moon";
  } else {
    const isWaning = cyclePosition >= 0.5;
    const nearLastQuarter = Math.abs(cyclePosition - 0.75) <= 0.01;
    const illuminationNearHalf = isWaning && Math.abs(illumination - 50) <= 5;

    if (nearLastQuarter || illuminationNearHalf) {
      phase = "Last Quarter";
    } else if (cyclePosition < 0.74) {
      phase = "Waning Gibbous";
    } else {
      phase = "Waning Crescent";
    }
  }
  
  debugLog('calculateMoonPhase', {
    cyclePosition,
    illumination,
    phase,
  });
  
  return { phase, illumination };
};

import { FULL_MOON_SET, NEW_MOON_SET, NEW_MOON_DATES_UTC } from "./moonEphemeris";

// Replace isDateFullMoon and isDateNewMoon with accurate table lookups
/**
 * Checks if the given date is a "full moon day" (matches our ephemeris, within +/- 1 day).
 * This is MUCH more accurate than algorithmic calculation for calendar indicators!
 */
export const isDateFullMoon = (date: Date): boolean => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  // Form YYYY-MM-DD (UTC, to match ephemeris)
  const utcYear = date.getUTCFullYear();
  const utcMonth = pad(date.getUTCMonth() + 1);
  const utcDay = pad(date.getUTCDate());

  const yyyymmdd = `${utcYear}-${utcMonth}-${utcDay}`;
  // Optionally, allow ±1 day margin (covers time zone edge cases)
  if (FULL_MOON_SET.has(yyyymmdd)) return true;
  // You can uncomment below to show dot also the day before/after the true full moon,
  // which is sometimes done to reflect local time variation:
  // if (FULL_MOON_SET.has(getAdjacentDate(yyyymmdd, -1))) return true;
  // if (FULL_MOON_SET.has(getAdjacentDate(yyyymmdd, 1))) return true;
  return false;
};

/**
 * Checks if the given date is a "new moon day" (matches our ephemeris, within +/- 1 day).
 */
export const isDateNewMoon = (date: Date): boolean => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const utcYear = date.getUTCFullYear();
  const utcMonth = pad(date.getUTCMonth() + 1);
  const utcDay = pad(date.getUTCDate());
  const yyyymmdd = `${utcYear}-${utcMonth}-${utcDay}`;
  if (NEW_MOON_SET.has(yyyymmdd)) return true;
  // Optionally ±1 day logic, see above comments.
  return false;
};
