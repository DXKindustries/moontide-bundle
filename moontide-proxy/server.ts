
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (adjust as needed for production)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// NOAA API proxy endpoint
app.get('/api/noaa', async (req, res) => {
  try {
    const { url } = req.query;

    // Validate that url parameter exists
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid url parameter',
        message: 'Please provide a valid url query parameter'
      });
    }

    // Validate that the URL is a NOAA API endpoint for security
    if (!url.includes('api.tidesandcurrents.noaa.gov')) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Only NOAA API endpoints are allowed'
      });
    }

    console.log(`Proxying request to: ${url}`);

    // Make the request to NOAA API
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'MoonTide-Proxy/1.0'
      }
    });

    // Return the raw JSON response
    res.json(response.data);

  } catch (error) {
    console.error('Error proxying NOAA request:', error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // NOAA API returned an error
        return res.status(error.response.status).json({
          error: 'NOAA API error',
          message: error.response.data || 'Error from NOAA API',
          status: error.response.status
        });
      } else if (error.request) {
        // Network error
        return res.status(503).json({
          error: 'Network error',
          message: 'Unable to reach NOAA API'
        });
      }
    }

    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🌊 MoonTide Proxy Server running on port ${PORT}`);
  console.log(`📡 NOAA API proxy available at: http://localhost:${PORT}/api/noaa`);
});
