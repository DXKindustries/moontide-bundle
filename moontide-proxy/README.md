
# MoonTide Proxy Server

A TypeScript-based Node.js proxy server to bypass CORS restrictions when accessing the NOAA API from the frontend.

## Setup

1. Navigate to the proxy directory:
```bash
cd moontide-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## Usage

The proxy exposes a single endpoint:

```
GET /api/noaa?url=<NOAA_FULL_URL>
```

### Example

```bash
curl "http://localhost:3001/api/noaa?url=https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=MoonTide&format=json&datum=MLLW&time_zone=lst_ldt&units=english&station=8454000&begin_date=20250615&end_date=20250615&interval=hilo"
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm run start`: Start production server
- `npm run type-check`: Check TypeScript types without building

## Security

- Only allows requests to NOAA API endpoints (`api.tidesandcurrents.noaa.gov`)
- Validates URL parameters
- Includes proper error handling and logging
