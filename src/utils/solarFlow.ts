import { calculateSolarTimes } from './solarUtils';

export type SolarDay = {
  date: Date;
  daylightHr: number;
};

export type SolarSeries = {
  year: number;
  days: SolarDay[];
  juneShiftedDays: SolarDay[];
  indices: {
    summer: number;
    winter: number;
    spring: number;
    autumn: number;
  };
};

const cache = new Map<string, SolarSeries>();

const dayMs = 1000 * 60 * 60 * 24;

export const getSolarSeries = (lat: number, lng: number, year: number): SolarSeries => {
  const key = `${year}:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const days: SolarDay[] = [];
  const start = new Date(year, 0, 1);
  start.setHours(12, 0, 0, 0);

  // Current year
  for (let d = new Date(start); d.getFullYear() === year; d.setTime(d.getTime() + dayMs)) {
    const times = calculateSolarTimes(new Date(d), lat, lng);
    days.push({ date: new Date(d), daylightHr: times.daylightMinutes / 60 });
  }

  // First half of the following year (through June)
  const nextYearStart = new Date(year + 1, 0, 1);
  nextYearStart.setHours(12, 0, 0, 0);
  const nextYearDays: SolarDay[] = [];
  for (
    let d = new Date(nextYearStart);
    d.getFullYear() === year + 1 && d.getMonth() < 6;
    d.setTime(d.getTime() + dayMs)
  ) {
    const times = calculateSolarTimes(new Date(d), lat, lng);
    nextYearDays.push({ date: new Date(d), daylightHr: times.daylightMinutes / 60 });
  }

  const combinedDays = days.concat(nextYearDays);

  let summerIndex = 0;
  let winterIndex = 0;
  let springEquinoxIndex = 0; // next year's spring
  let autumnEquinoxIndex = 0;

  let max = days[0]?.daylightHr ?? 0;
  let min = max;

  // start loop from second element to allow interpolation with previous
  for (let i = 1; i < days.length; i++) {
    const h = days[i].daylightHr;
    const prev = days[i - 1].daylightHr;

    if (h > max) {
      max = h;
      summerIndex = i;
    }
    if (h < min) {
      min = h;
      winterIndex = i;
    }

    // autumn equinox (~September) where daylight crosses 12h going down
    if (!autumnEquinoxIndex) {
      const month = days[i].date.getMonth();
      if (month >= 8 && month <= 9 && prev > 12 && h <= 12) {
        const frac = (prev - 12) / (prev - h);
        autumnEquinoxIndex = i - 1 + frac;
      }
    }
  }

  // Find next year's spring equinox (~March) in the concatenated range
  for (let i = 1; i < nextYearDays.length; i++) {
    const h = nextYearDays[i].daylightHr;
    const prev = nextYearDays[i - 1].daylightHr;
    if (!springEquinoxIndex) {
      const month = nextYearDays[i].date.getMonth();
      if (month >= 2 && month <= 3 && prev < 12 && h >= 12) {
        const frac = (12 - prev) / (h - prev);
        springEquinoxIndex = days.length + i - 1 + frac;
      }
    }
  }

  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const total = isLeap(year + 1) ? 366 : 365;
  const juneShiftedDays = combinedDays.slice(summerIndex, summerIndex + total);
  if (juneShiftedDays.length !== total) {
    console.warn('Unexpected juneShiftedDays length', juneShiftedDays.length);
  }
  const shift = (idx: number) => (idx - summerIndex + total) % total;

  const series: SolarSeries = {
    year,
    days: combinedDays,
    juneShiftedDays,
    indices: {
      summer: 0,
      winter: shift(winterIndex),
      spring: shift(springEquinoxIndex),
      autumn: shift(autumnEquinoxIndex),
    },
  };

  cache.set(key, series);
  return series;
};

export const getCurrentDayIndexJuneShifted = (
  series: SolarSeries,
  date: Date
): number => {
  const start = new Date(series.juneShiftedDays[0].date);
  const diff = (date.getTime() - start.getTime()) / dayMs;
  const total = series.juneShiftedDays.length;
  return diff < 0 ? diff + total : diff;
};

