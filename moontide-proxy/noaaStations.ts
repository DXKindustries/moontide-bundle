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

interface NOAAStationRaw {
  id: string;
  name: string;
  lat: string;
  lng: string;
  state?: string;
  type?: string;
  reference_id?: string;
}

interface StationResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  city?: string;
  zip?: string;
  distance: number;
}

let stationCache: StationMeta[] | null = null;
interface GeoInfo { zip?: string; city?: string; state?: string }
const stationGeoCache = new Map<string, GeoInfo>();
const geocodeCache = new Map<string, { lat: number; lng: number; expiry: number }>();
const lookupCache = new Map<string, { stations: StationResult[]; expiry: number }>();

const GEO_TTL = 24 * 60 * 60 * 1000; // 24 hours
const LOOKUP_TTL = 12 * 60 * 60 * 1000; // 12 hours

async function loadStations(): Promise<StationMeta[]> {
  if (stationCache) {
    console.log('Using cached NOAA station list');
    return stationCache;
  }
  console.log('Loading NOAA stations list');
  const res = await axios.get(STATIONS_URL);
  const data = res.data;
  if (Array.isArray(data?.stations)) {
    stationCache = (data.stations as NOAAStationRaw[])
      .filter((s) => s.lat && s.lng && s.id && s.name)
      .map((s) => ({
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

async function geocodeQuery(query: string) {
  const key = query.toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    console.log('Using cached geocode for', query);
    return { lat: cached.lat, lng: cached.lng };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await axios.get(url, { headers: { 'User-Agent': 'MoonTideApp' } });
    const place = res.data?.[0];
    if (place) {
      const result = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
      geocodeCache.set(key, { ...result, expiry: Date.now() + GEO_TTL });
      console.log('Geocode resolved (nominatim):', result);
      return result;
    }
  } catch (err) {
    console.error('Nominatim geocode error:', err);
  }

  return null;
}

async function geocode(input: string): Promise<{ lat: number; lng: number } | null> {
  console.log('Geocode attempt:', input);

  const trimmed = input.trim();
  let result = await geocodeQuery(trimmed);
  if (result) return result;

  // Fallback: remove common POI terms like "Visitor Center"
  const fallback = trimmed
    .replace(/\bvisitors? center\b/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();

  if (fallback && fallback !== trimmed) {
    console.log('Geocode fallback attempt:', fallback);
    result = await geocodeQuery(fallback);
    if (result) return result;
  }

  console.log('Geocode lookup failed for', input);
  return null;
}

async function findStationsByName(name: string): Promise<StationResult[]> {
  const query = name.trim().toLowerCase();
  if (!query) return [];

  const stations = await loadStations();

  const matches = stations
    .filter((s) => s.name.toLowerCase().includes(query))
    .slice(0, 10);

  return matches.map((s) => {
    const key = `${s.lat},${s.lng}`;
    let info = stationGeoCache.get(key);
    if (!info) {
      const lookup = zipcodes.lookupByCoords(s.lat, s.lng) as {
        zip?: string;
        city?: string;
        state?: string;
      } | null;
      info = {
        zip: lookup?.zip || '',
        city: lookup?.city || '',
        state: lookup?.state || s.state,
      };
      stationGeoCache.set(key, info);
    }

    return {
      id: s.id,
      name: s.name,
      latitude: s.lat,
      longitude: s.lng,
      state: info.state,
      city: info.city,
      zip: info.zip,
      distance: 0,
    } as StationResult;
  });
}

router.get('/noaa-stations', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const input = (req.query.locationInput as string) || '';
  console.log('/noaa-stations request:', input);

  const lookupKey = input.trim().toLowerCase();
  const cachedLookup = lookupCache.get(lookupKey);
  if (cachedLookup && cachedLookup.expiry > Date.now()) {
    console.log('Using cached station lookup for', input);
    res.json({ stations: cachedLookup.stations });
    return;
  }

  try {
    const coords = await geocode(input);
    if (!coords) {
      const nameMatches = await findStationsByName(input);
      if (nameMatches.length > 0) {
        lookupCache.set(lookupKey, { stations: nameMatches, expiry: Date.now() + LOOKUP_TTL });
        res.json({ stations: nameMatches });
        return;
      }
      res.status(400).json({ error: 'Unable to resolve location' });
      return;
    }
    const stations = await loadStations();
    const isZip = /^\d{5}$/.test(input.trim());

    let processed: StationResult[] = stations.map((s) => {
      const key = `${s.lat},${s.lng}`;
      let info = stationGeoCache.get(key);
      if (!info) {
        const lookup = zipcodes.lookupByCoords(s.lat, s.lng) as { zip?: string; city?: string; state?: string } | null;
        info = {
          zip: lookup?.zip || '',
          city: lookup?.city || '',
          state: lookup?.state || s.state
        };
        stationGeoCache.set(key, info);
      }

      return {
        id: s.id,
        name: s.name,
        latitude: s.lat,
        longitude: s.lng,
        state: info.state,
        city: info.city,
        zip: info.zip,
        distance: haversine(coords.lat, coords.lng, s.lat, s.lng),
      };
    });

    if (isZip) {
      processed = processed.filter((p) => p.zip === input.trim());
    }

    const results = processed
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
    lookupCache.set(lookupKey, { stations: results, expiry: Date.now() + LOOKUP_TTL });
    res.json({ stations: results });
  } catch (err) {
    console.error('Station lookup error:', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Lookup a station directly by its NOAA ID
router.get('/noaa-station/:id', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: 'Missing station id' });
    return;
  }

  try {
    const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${id}.json`;
    const response = await axios.get(url);
    const station = response.data?.stations?.[0];
    if (!station) {
      res.status(404).json({ error: 'Station not found' });
      return;
    }

    const result = {
      id: String(station.id),
      name: station.name,
      latitude: parseFloat(station.lat),
      longitude: parseFloat(station.lng),
      state: station.state,
    };

    res.json({ station: result });
  } catch (err) {
    console.error('Station lookup by id error:', err);
    res.status(500).json({ error: 'Failed to fetch station' });
  }
});

export default router;
