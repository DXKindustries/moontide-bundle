// Solar calculation utilities

export type SolarTimes = {
  sunrise: string;
  sunset: string;
  daylight: string;
  daylightMinutes: number; // Total daylight in minutes for comparison
  darkness: string;
  changeFromPrevious?: string; // Change from previous day
  changeSinceSolstice?: string; // Difference from summer solstice
};

export type SolarEvent = {
  name: string;
  emoji: string;
  description: string;
};

// Calculate sunrise and sunset times for the given location
// Algorithm adapted from the SunCalc library (https://github.com/mourner/suncalc)
export const calculateSolarTimes = (
  date: Date,
  lat: number = 41.4353,
  lng: number = -71.4616
): SolarTimes => {
  const rad = Math.PI / 180;
  const dayMs = 1000 * 60 * 60 * 24;
  const J1970 = 2440588;
  const J2000 = 2451545;

  const toJulian = (d: Date) => d.getTime() / dayMs - 0.5 + J1970;
  const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs);
  const toDays = (d: Date) => toJulian(d) - J2000;

  const solarMeanAnomaly = (d: number) =>
    rad * (357.5291 + 0.98560028 * d);
  const eclipticLongitude = (M: number) =>
    M +
    rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) +
    Math.PI +
    rad * 102.9372;
  const declination = (L: number) =>
    Math.asin(Math.sin(L) * Math.sin(rad * 23.4397));
  const julianCycle = (d: number, lw: number) =>
    Math.round(d - 0.0009 - lw / (2 * Math.PI));
  const approxTransit = (Ht: number, lw: number, n: number) =>
    0.0009 + (Ht + lw) / (2 * Math.PI) + n;
  const solarTransit = (ds: number, M: number, L: number) =>
    J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const hourAngle = (h: number, phi: number, d: number) =>
    Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));

  const getTimes = (d: Date, latitude: number, longitude: number) => {
    const lw = rad * -longitude;
    const phi = rad * latitude;
    const days = toDays(d);
    const n = julianCycle(days, lw);
    const ds = approxTransit(0, lw, n);
    const M = solarMeanAnomaly(ds);
    const L = eclipticLongitude(M);
    const dec = declination(L);
    const h0 = rad * -0.833; // Sun altitude for sunrise/sunset
    const w0 = hourAngle(h0, phi, dec);
    const a0 = approxTransit(w0, lw, n);
    const a1 = approxTransit(-w0, lw, n);
    const Jset = solarTransit(a0, M, L);
    const Jrise = solarTransit(a1, M, L);
    const sunriseDate = fromJulian(Jrise);
    const sunsetDate = fromJulian(Jset);
    const daylightMinutes = (sunsetDate.getTime() - sunriseDate.getTime()) / 60000;
    return { sunriseDate, sunsetDate, daylightMinutes };
  };

  const current = getTimes(date, lat, lng);
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const previous = getTimes(prevDate, lat, lng);

  const format = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const daylight = `${Math.floor(current.daylightMinutes / 60)}h ${Math.round(current.daylightMinutes % 60)}m`;
  const daylightMinutes = Math.round(current.daylightMinutes);
  const darknessMinutes = Math.round(24 * 60 - daylightMinutes);
  const darkness = `${Math.floor(darknessMinutes / 60)}h ${Math.round(darknessMinutes % 60)}m`;
  const diff = daylightMinutes - Math.round(previous.daylightMinutes);

  let changeFromPrevious = '';
  if (Math.abs(diff) < 1) {
    changeFromPrevious = 'same as yesterday';
  } else if (diff > 0) {
    changeFromPrevious = `+${diff}m longer`;
  } else {
    changeFromPrevious = `${diff}m shorter`;
  }

  // Difference in daylight from the summer solstice (June 21)
  const solsticeDate = new Date(date.getFullYear(), 5, 21);
  const solstice = getTimes(solsticeDate, lat, lng);
  const diffSolstice = daylightMinutes - Math.round(solstice.daylightMinutes);
  let changeSinceSolstice = '';
  if (diffSolstice !== 0) {
    const sign = diffSolstice > 0 ? '+' : '-';
    const abs = Math.abs(diffSolstice);
    changeSinceSolstice = `${sign}${Math.floor(abs / 60)}h ${abs % 60}m`;
  } else {
    changeSinceSolstice = '0m';
  }

  return {
    sunrise: format(current.sunriseDate),
    sunset: format(current.sunsetDate),
    daylight,
    daylightMinutes,
    darkness,
    changeFromPrevious,
    changeSinceSolstice,
  };
};

// Solar events (solstices and equinoxes) with precise dates - only exact astronomical dates
export const getSolarEvents = (date: Date): SolarEvent | null => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 2025 solar event dates (exact astronomical dates only)
  if (year === 2025) {
    // Spring Equinox: March 20, 2025 (exact date only)
    if (month === 3 && day === 20) {
      return { name: "Spring Equinox", emoji: "🌱", description: "First day of spring - equal day and night" };
    }
    // Summer Solstice: June 21, 2025 (exact date only)
    if (month === 6 && day === 21) {
      return { name: "Summer Solstice", emoji: "☀️", description: "Longest day of the year" };
    }
    // Autumn Equinox: September 22, 2025 (exact date only)
    if (month === 9 && day === 22) {
      return { name: "Autumn Equinox", emoji: "🍂", description: "First day of autumn - equal day and night" };
    }
    // Winter Solstice: December 21, 2025 (exact date only)
    if (month === 12 && day === 21) {
      return { name: "Winter Solstice", emoji: "❄️", description: "Shortest day of the year" };
    }
  }

  // For other years, use exact dates only (no ranges)
  if (year === 2024) {
    if (month === 3 && day === 20) {
      return { name: "Spring Equinox", emoji: "🌱", description: "First day of spring" };
    }
    if (month === 6 && day === 20) {
      return { name: "Summer Solstice", emoji: "☀️", description: "Longest day of the year" };
    }
    if (month === 9 && day === 22) {
      return { name: "Autumn Equinox", emoji: "🍂", description: "First day of autumn" };
    }
    if (month === 12 && day === 21) {
      return { name: "Winter Solstice", emoji: "❄️", description: "Shortest day of the year" };
    }
  }

  if (year === 2026) {
    if (month === 3 && day === 20) {
      return { name: "Spring Equinox", emoji: "🌱", description: "First day of spring" };
    }
    if (month === 6 && day === 21) {
      return { name: "Summer Solstice", emoji: "☀️", description: "Longest day of the year" };
    }
    if (month === 9 && day === 23) {
      return { name: "Autumn Equinox", emoji: "🍂", description: "First day of autumn" };
    }
    if (month === 12 && day === 21) {
      return { name: "Winter Solstice", emoji: "❄️", description: "Shortest day of the year" };
    }
  }

  return null;
};
