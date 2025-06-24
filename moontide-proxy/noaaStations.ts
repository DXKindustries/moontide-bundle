import { Router } from 'express';
import axios from 'axios';

const router = Router();
const STATIONS_URL = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';

interface StationMeta {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

let stationCache: StationMeta[] | null = null;

async function loadStations(): Promise<StationMeta[]> {
  if (stationCache) {
    return stationCache;
  }
  const res = await axios.get(STATIONS_URL);
  const data = res.data;
  if (Array.isArray(data?.stations)) {
    stationCache = data.stations
      .filter((s: any) => s.lat && s.lng && s.id && s.name)
      .map((s: any) => ({
        id: String(s.id),
        name: s.name,
        lat: parseFloat(s.lat),
        lng: parseFloat(s.lng),
        state: s.state,
      }));
  } else {
    stationCache = [];
  }
  return stationCache ?? [];
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocode(input: string): Promise<{ lat: number; lng: number } | null> {
  const coordMatch = input.match(/^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    return { lat, lng };
  }

  if (/^\d{5}$/.test(input.trim())) {
    try {
      const res = await axios.get(`https://api.zippopotam.us/us/${input.trim()}`);
      const place = res.data.places?.[0];
      if (place) {
        return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
      }
    } catch {
      return null;
    }
  }

  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: input, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'lunar-wave-watcher' }
    });
    const loc = res.data[0];
    if (loc) {
      return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
    }
  } catch {
    return null;
  }
  return null;
}

router.get('/api/noaa-stations', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const input = (req.query.locationInput as string) || '';
  if (!input) {
    res.status(400).json({ error: 'Missing locationInput' });
    return;
  }

  try {
    const coords = await geocode(input);
    if (!coords) {
      res.status(400).json({ error: 'Unable to resolve location' });
      return;
    }
    const stations = await loadStations();
    const results = stations
      .map((s) => ({
        id: s.id,
        name: s.name,
        latitude: s.lat,
        longitude: s.lng,
        state: s.state,
        distance: haversine(coords.lat, coords.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
    res.json({ stations: results });
  } catch (err) {
    console.error('Station lookup error:', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

export default router;
