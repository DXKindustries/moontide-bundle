import { Router } from 'express';
import axios from 'axios';

const router = Router();

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

router.get('/api/tides', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const locationInput = req.query.locationInput as string | undefined; // not used but required by interface
  const stationId = req.query.stationId as string | undefined;

  if (!locationInput || !stationId) {
    res.status(400).json({ error: 'Missing locationInput or stationId' });
    return;
  }

  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 6);

  const params = new URLSearchParams({
    product: 'predictions',
    application: 'LunarWaveWatcher',
    format: 'json',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    units: 'english',
    station: stationId,
    begin_date: formatDate(start),
    end_date: formatDate(end)
  });

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params.toString()}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error('Tide fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch tide data' });
  }
});

export default router;
