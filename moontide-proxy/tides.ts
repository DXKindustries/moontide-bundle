// src/tides.ts
import { Router } from 'express';
import axios from 'axios';

const router = Router();

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseYYYYMMDD(s: string): Date | null {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  return new Date(y, mo - 1, d);
}

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/* ------------------------------------------------------------------ */
/*  /tides?stationId=8452660&date=20250625                            */
/* ------------------------------------------------------------------ */
router.get('/tides', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const stationId = req.query.stationId as string | undefined;
  const dateStr   = req.query.date      as string | undefined; // yyyymmdd

  /* ---- basic validation ------------------------------------------ */
  if (!stationId || !dateStr) {
    return res.status(400).json({ error: 'Missing stationId or date' });
  }
  const start = parseYYYYMMDD(dateStr);
  if (!start) {
    return res.status(400).json({ error: 'Invalid date format (expect yyyymmdd)' });
  }
  const end = new Date(start);
  end.setDate(start.getDate() + 7);      // 8-day window to capture cross-midnight cycles

  /* ---- build NOAA API call --------------------------------------- */
  const params = new URLSearchParams({
    product:    'predictions',
    application:'LunarWaveWatcher',
    format:     'json',
    datum:      'MLLW',
    time_zone:  'lst_ldt',
    // Return only high/low events so callers get two cycles per day
    interval:   'hilo',
    units:      'english',
    station:    stationId,
    begin_date: yyyymmdd(start),
    end_date:   yyyymmdd(end)
  });

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params}`;

  try {
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    console.error('Tide fetch error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Failed to fetch tide data' });
  }
});

export default router;
