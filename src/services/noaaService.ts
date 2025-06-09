
// Re-export everything from the refactored modules
// This maintains the same public API so no importing code needs to change

// Re-export all types
export type {
  NoaaTideData,
  NoaaTideResponse,
  NoaaStation,
  TidePoint,
  TideForecast
} from './tide/types';

// Re-export constants
export { 
  NOAA_API_BASE_URL,
  STATION_MAP_KEY
} from './tide/constants';

// Re-export utility functions
export { 
  haversineDistance,
  getMoonPhase
} from './tide/utils';

// Re-export station services
export {
  getNearestStation,
  saveStationForLocation,
  getStationForLocation
} from './tide/stationService';

// Re-export tide services
export {
  getTidePredictions,
  getChartTideData,
  getHighLowTideData,
  getCurrentTideData,
  getWeeklyTideForecast
} from './tide/tideService';
