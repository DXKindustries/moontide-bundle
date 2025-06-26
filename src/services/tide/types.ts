
// Types for NOAA API responses
export type NoaaTideData = {
  t: string; // Time in UTC or local, depending on API param
  v: string; // Water level value
  s: string; // Sigma (standard deviation)
  f: string; // Flags
  q: string; // Quality
};

export type NoaaTideResponse = {
  predictions: NoaaTideData[];
};

export type NoaaStation = {
  id: string;
  name: string;
  lat: string;
  lng: string;
  state?: string;
};

export type TidePoint = {
  time: string;
  height: number;
  isHighTide: boolean | null; // null for continuous points, true/false for hilo
};

export type TideCycle = {
  low: { time: string; height: number };
  high: { time: string; height: number };
};

export type TideForecast = {
  date: string;
  day: string;
  moonPhase: string;
  illumination: number;
  cycles: TideCycle[];
};
