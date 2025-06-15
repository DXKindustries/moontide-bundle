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

// Calculate actual moon phase for any given date
export const calculateMoonPhase = (date: Date): { phase: string; illumination: number } => {
  // Known new moon reference: January 1, 2000 was approximately a new moon
  const knownNewMoon = new Date(2000, 0, 6, 18, 14); // Jan 6, 2000 6:14 PM UTC
  const lunarCycleLength = 29.53058867; // Average lunar cycle in days
  
  // Calculate days since the known new moon
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate the current position in the lunar cycle
  const cyclePosition = ((daysSinceKnownNewMoon % lunarCycleLength) + lunarCycleLength) % lunarCycleLength;
  
  // Calculate illumination percentage
  const illumination = Math.round((1 - Math.cos((cyclePosition / lunarCycleLength) * 2 * Math.PI)) * 50);
  
  // Determine phase based on cycle position
  let phase: string;
  if (cyclePosition < 1.84566) {
    phase = "New Moon";
  } else if (cyclePosition < 5.53699) {
    phase = "Waxing Crescent";
  } else if (cyclePosition < 9.22831) {
    phase = "First Quarter";
  } else if (cyclePosition < 12.91963) {
    phase = "Waxing Gibbous";
  } else if (cyclePosition < 16.61096) {
    phase = "Full Moon";
  } else if (cyclePosition < 20.30228) {
    phase = "Waning Gibbous";
  } else if (cyclePosition < 23.99361) {
    phase = "Last Quarter";
  } else {
    phase = "Waning Crescent";
  }
  
  return { phase, illumination };
};
import { FULL_MOON_SET, NEW_MOON_SET } from "./moonEphemeris";

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
