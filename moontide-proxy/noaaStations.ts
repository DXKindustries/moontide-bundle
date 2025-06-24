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
    console.log('Using cached NOAA station list');
    return stationCache;
  }
  console.log('Loading NOAA stations list');
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
  console.log(`Loaded ${stationCache.length} NOAA stations`);
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
  console.log('Geocode attempt:', input);
  const coordMatch = input.match(/^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    console.log('Geocode resolved (coords):', { lat, lng });
    return { lat, lng };
  }

  if (/^\d{5}$/.test(input.trim())) {
    try {
      const res = await axios.get(`https://api.zippopotam.us/us/${input.trim()}`);
      const place = res.data.places?.[0];
      if (place) {
        const result = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
        console.log('Geocode resolved (zip):', result);
        return result;
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
      const result = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
      console.log('Geocode resolved (search):', result);
      return result;
    }
  } catch {
    console.log('Geocode lookup failed for', input);
    return null;
  }
  console.log('Geocode lookup failed for', input);
  return null;
}

router.get('/api/noaa-stations', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const input = (req.query.locationInput as string) || '';
  console.log('/api/noaa-stations request:', input);
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
