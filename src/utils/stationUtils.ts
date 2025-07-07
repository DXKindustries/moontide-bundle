import { Station } from '@/services/tide/stationService';

type UiStation = Station & { type?: string };
export function logStationOptions(currentStation: string | null, stations: UiStation[]): void {
  console.log('[STATION-UI] Available Stations:', {
    default: currentStation,
    alternatives: stations
      .filter((s) => s.id !== currentStation && s.type === 'T')
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      .slice(0, 3), // Top 3 nearest
  });
}

