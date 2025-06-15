
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/noaa', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid NOAA API URL' });
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error: any) {
    console.error("NOAA proxy error:", error.message);
    res.status(500).json({ error: 'Failed to fetch from NOAA API' });
  }
});

app.listen(PORT, () => {
  console.log(`NOAA Proxy Server running on http://localhost:${PORT}`);
});
