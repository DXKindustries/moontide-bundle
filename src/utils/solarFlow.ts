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

  for (let d = new Date(start); d.getFullYear() === year; d.setTime(d.getTime() + dayMs)) {
    const times = calculateSolarTimes(new Date(d), lat, lng);
    days.push({ date: new Date(d), daylightHr: times.daylightMinutes / 60 });
  }

  let summerIndex = 0;
  let winterIndex = 0;
  let springEquinoxIndex = 0;
  let autumnEquinoxIndex = 0;

  let max = -Infinity;
  let min = Infinity;
  let prev = days[0]?.daylightHr ?? 0;

  for (let i = 0; i < days.length; i++) {
    const h = days[i].daylightHr;
    if (h > max) {
      max = h;
      summerIndex = i;
    }
    if (h < min) {
      min = h;
      winterIndex = i;
    }
    const month = days[i].date.getMonth();
    if (!springEquinoxIndex && month >= 2 && month <= 3 && prev < 12 && h >= 12) {
      springEquinoxIndex = i;
    }
    if (!autumnEquinoxIndex && month >= 8 && month <= 9 && prev > 12 && h <= 12) {
      autumnEquinoxIndex = i;
    }
    prev = h;
  }

  const total = days.length;
  const juneShiftedDays = days.slice(summerIndex).concat(days.slice(0, summerIndex));
  const shift = (idx: number) => (idx - summerIndex + total) % total;

  const series: SolarSeries = {
    year,
    days,
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

export const getCurrentDayIndexJuneShifted = (date: Date): number => {
  const year = date.getFullYear();
  const june21 = new Date(year, 5, 21);
  june21.setHours(0, 0, 0, 0);
  let diff = Math.floor((date.getTime() - june21.getTime()) / dayMs);
  if (diff < 0) {
    const prevJune21 = new Date(year - 1, 5, 21);
    prevJune21.setHours(0, 0, 0, 0);
    const daysInYear = Math.round((june21.getTime() - prevJune21.getTime()) / dayMs);
    diff += daysInYear;
  }
  return diff;
};

