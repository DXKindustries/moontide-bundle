import express from 'express';
import axios from 'axios';
import cors from 'cors';
import stationsRouter from './noaaStations';
import tidesRouter from './tides';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(stationsRouter);
app.use(tidesRouter);

app.get('/api/noaa', async (req, res) => {
  const { url } = req.query;
  console.log('NOAA proxy request:', url);

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid NOAA API URL' });
    return;
  }

  try {
    const response = await axios.get(url);
    console.log('NOAA proxy success for', url);
    res.json(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('NOAA proxy error:', error.message);
    } else {
      console.error('NOAA proxy error:', error);
    }
    res.status(500).json({ error: 'Failed to fetch from NOAA API' });
  }
});

app.listen(PORT, () => {
  console.log(`NOAA Proxy Server running on http://localhost:${PORT}`);
});
