import { Router } from 'express';
import axios from 'axios';
import zipcodes from 'zipcodes';

const router = Router();
// Include subordinate (S) stations along with reference (R) stations
// by requesting the tide prediction station list from NOAA's MDAPI
const STATIONS_URL =
  'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions';

interface StationMeta {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
  type?: string;          // "R" for reference, "S" for subordinate
  reference_id?: string;  // reference station id for subordinate stations
}

let stationCache: StationMeta[] | null = null;
const stationZipCache = new Map<string, string>();

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
        type: s.type,
        reference_id: s.reference_id,
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

  const trimmed = input.trim();

  // ZIP code lookup
  if (/^\d{5}$/.test(trimmed)) {
    try {
      const res = await axios.get(`https://api.zippopotam.us/us/${trimmed}`);
      const place = res.data.places?.[0];
      if (place) {
        const result = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
        console.log('Geocode resolved (zip):', result);
        return result;
      }
    } catch {
      return null;
    }
    return null;
  }

  // City/state lookup (e.g. "Narragansett RI" or "Narragansett, RI")
  const cityState = trimmed.match(/^(.+?)[,\s]+([A-Za-z]{2})$/);
  if (cityState) {
    const city = encodeURIComponent(cityState[1].trim());
    const state = cityState[2].toUpperCase();
    try {
      const url = `https://api.zippopotam.us/us/${state}/${city}`;
      const res = await axios.get(url);
      const place = res.data.places?.[0];
      if (place) {
        const result = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
        console.log('Geocode resolved (city/state):', result);
        return result;
      }
    } catch {
      return null;
    }
  }

  console.log('Geocode lookup failed for', input);
  return null;
}

router.get('/noaa-stations', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const input = (req.query.locationInput as string) || '';
  console.log('/noaa-stations request:', input);

  try {
    const coords = await geocode(input);
    if (!coords) {
      res.status(400).json({ error: 'Unable to resolve location' });
      return;
    }
    const stations = await loadStations();
    const isZip = /^\d{5}$/.test(input.trim());

    let processed = stations.map((s) => {
      const key = `${s.lat},${s.lng}`;
      let zip = stationZipCache.get(key);
      if (!zip) {
        const lookup = zipcodes.lookupByCoords(s.lat, s.lng) as any;
        zip = lookup?.zip || '';
        if (zip) stationZipCache.set(key, zip);
      }

      return {
        id: s.id,
        name: s.name,
        latitude: s.lat,
        longitude: s.lng,
        state: s.state,
        zip,
        distance: haversine(coords.lat, coords.lng, s.lat, s.lng),
      };
    });

    if (isZip) {
      processed = processed.filter((p) => p.zip === input.trim());
    }

    const results = processed
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
    res.json({ stations: results });
  } catch (err) {
    console.error('Station lookup error:', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

export default router;
