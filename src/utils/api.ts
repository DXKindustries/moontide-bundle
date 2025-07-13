export interface TidePredictionRaw { t: string; v: string; type?: 'H' | 'L'; }

export function get7DayRange() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export function makeCacheKey(stationId: string, start: string, end: string, interval: string) {
  return `tide:${stationId}:${start}:${end}:${interval}`;
}

export async function fetchTidePredictions(
  stationId: string,
  start: string,
  end: string,
  interval: 'h' | '6' | 'hilo' = 'h'
): Promise<TidePredictionRaw[]> {
  const params = new URLSearchParams({
    product: 'predictions',
    application: 'MoonTide',
    format: 'json',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    units: 'english',
    station: stationId,
    begin_date: start.replace(/-/g, ''),
    end_date: end.replace(/-/g, ''),
    interval,
  });
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('fetch');
  const json = await resp.json();
  const list: TidePredictionRaw[] = Array.isArray(json?.predictions) ? json.predictions : [];
  const uniq: Record<string, TidePredictionRaw> = {};
  for (const p of list) {
    const iso = `${p.t.replace(' ', 'T')}:00`;
    uniq[iso] = { t: iso, v: p.v, type: p.type };
  }
  return Object.values(uniq);
}
