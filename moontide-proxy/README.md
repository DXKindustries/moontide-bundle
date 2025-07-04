
# MoonTide Proxy Server

A simple Express proxy server to bypass CORS restrictions when accessing the NOAA API from the frontend.

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


## Usage

The proxy exposes a single endpoint:

```
GET /api/noaa?url=<NOAA_FULL_URL>
```

### Example

```bash
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm run start`: Start production server
- `npm run type-check`: Check TypeScript types without building
