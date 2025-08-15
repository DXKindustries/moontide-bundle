
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

export const calculateMoonPhase = (date: Date): { phase: string; illumination: number } => {
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

  return { phase, illumination };
};

import { formatDateTimeAsLocalIso } from "./dateTimeUtils";
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

// Calculate moonrise and moonset times for a given date and location.
// Algorithm adapted from the SunCalc library (https://github.com/mourner/suncalc)
export const calculateMoonTimes = (
  date: Date,
  lat: number = 41.4353,
  lng: number = -71.4616
): { moonrise: string; moonset: string } => {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);

  const rad = Math.PI / 180;
  const dayMs = 1000 * 60 * 60 * 24;
  const J1970 = 2440588;
  const J2000 = 2451545;

  const toJulian = (d: Date) => d.getTime() / dayMs - 0.5 + J1970;
  const toDays = (d: Date) => toJulian(d) - J2000;

  const e = rad * 23.4397;

  const rightAscension = (l: number, b: number) =>
    Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const declination = (l: number, b: number) =>
    Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));

  const altitude = (H: number, phi: number, dec: number) =>
    Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));

  const siderealTime = (d: number, lw: number) => rad * (280.16 + 360.9856235 * d) - lw;

  const moonCoords = (d: number) => {
    const L = rad * (218.316 + 13.176396 * d);
    const M = rad * (134.963 + 13.064993 * d);
    const F = rad * (93.272 + 13.229350 * d);

    const l = L + rad * 6.289 * Math.sin(M);
    const b = rad * 5.128 * Math.sin(F);

    return { ra: rightAscension(l, b), dec: declination(l, b) };
  };

  const getMoonPosition = (d: Date, lat: number, lng: number) => {
    const lw = rad * -lng;
    const phi = rad * lat;
    const days = toDays(d);

    const c = moonCoords(days);
    const H = siderealTime(days, lw) - c.ra;
    const h = altitude(H, phi, c.dec) - rad * 0.017; // parallax correction

    return { altitude: h };
  };

  const hoursLater = (d: Date, h: number) => new Date(d.getTime() + h * 60 * 60 * 1000);

  const hc = 0.133 * rad;
  let h0 = getMoonPosition(t, lat, lng).altitude - hc;
  let rise: number | null = null;
  let set: number | null = null;
  let h1: number, h2: number, ye: number;

  for (let i = 1; i <= 24; i += 2) {
    h1 = getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
    h2 = getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

    const a = (h0 + h2) / 2 - h1;
    const b = (h2 - h0) / 2;
    const xe = -b / (2 * a);
    ye = (a * xe + b) * xe + h1;
    const d = b * b - 4 * a * h1;
    let roots = 0;
    let x1 = 0;
    let x2 = 0;

    if (d >= 0) {
      const dx = Math.sqrt(d) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) roots++;
      if (Math.abs(x2) <= 1) roots++;
      if (x1 < -1) x1 = x2;
    }

    if (roots === 1) {
      if (h0 < 0) rise = i + x1;
      else set = i + x1;
    } else if (roots === 2) {
      rise = i + (ye < 0 ? x2 : x1);
      set = i + (ye < 0 ? x1 : x2);
    }

    if (rise !== null && set !== null) break;
    h0 = h2;
  }

  const result: {
    rise: Date | null;
    set: Date | null;
    alwaysUp?: boolean;
    alwaysDown?: boolean;
  } = {
    rise: rise !== null ? hoursLater(t, rise) : null,
    set: set !== null ? hoursLater(t, set) : null,
  };

  if (rise === null && set === null) {
    result[ye! > 0 ? 'alwaysUp' : 'alwaysDown'] = true;
  }

  return {
    moonrise: result.rise ? formatDateTimeAsLocalIso(result.rise) : '',
    moonset: result.set ? formatDateTimeAsLocalIso(result.set) : '',
  };
};
