/* -------------------------------------------------------------------------- */
/*  src/services/noaaService.ts                                               */
/* -------------------------------------------------------------------------- */
/*  ZIP ➜ geo ➜ nearest (or saved) station ➜ tide predictions                 */
/*  Modern helpers + back-compat exports                                      */

import { lookupZipCode } from '@/utils/zipCodeLookup';
import {
  fetchDailyTides,
  fetchWeeklyTides,
} from '@/services/tide/tideService';
import {
  getNearestStation as _getNearestStation,
  getSavedStationForLocation,
  saveStationForLocation,
  NoaaStation,
} from '@/services/tide/stationService';

/* ------------------------------------------------------------------ */
/*  NEW canonical helper                                              */
/* ------------------------------------------------------------------ */

export interface TideBundle {
  stationId: string;
  stationName: string;
  daily: any;          // NOAA predictions JSON
  weekly: any;
}

/**
 * Resolve ZIP → lat/lng → station (honouring any saved choice) →
 * parallel daily + weekly tide predictions.
 */
export async function loadTideBundle(
  zipCode: string,
  date: Date = new Date()
): Promise<TideBundle> {
  /* 1. ZIP → geo */
  const { lat, lng } = await lookupZipCode(zipCode);

  /* 2. Station */
  let station: NoaaStation = await _getNearestStation(lat, lng);
  const saved = getSavedStationForLocation(zipCode);

  if (saved && saved !== station.id) {
    // In a future step we’ll validate distance; for now nearest wins.
    station = await _getNearestStation(lat, lng);
  }

  saveStationForLocation(zipCode, station.id);

  /* 3. Tides (parallel) */
  const [daily, weekly] = await Promise.all([
    fetchDailyTides(station, date),
    fetchWeeklyTides(station, date),
  ]);

  return {
    stationId: station.id,
    stationName: station.name,
    daily,
    weekly,
  };
}

/* ------------------------------------------------------------------ */
/*  Back-compat exports — keep legacy imports working                  */
/* ------------------------------------------------------------------ */

/** @deprecated – use `loadTideBundle` */
export const getCurrentTideData = loadTideBundle;

/** @deprecated – import directly from stationService in new code */
export const getNearestStation = _getNearestStation;

/** @deprecated – alias for legacy hooks */
export const getStationForLocation = _getNearestStation;
