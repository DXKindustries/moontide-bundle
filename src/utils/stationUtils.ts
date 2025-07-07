import { Station } from '@/services/tide/stationService';

type UiStation = Station & { type?: string };
export function logStationOptions(currentStation: string | null, stations: UiStation[]): void {
  console.log('[STATION-DEBUG] User Options:', {
    defaultStation: '8452660', // Newport, RI
    alternatives: stations
      .filter(s => s.type === 'T' && s.id !== '8452660')
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) // Top 3 closest
      .map(s => ({
        id: s.id,
        name: s.name,
        coords: [s.lat, s.lng]
      })),
    forcedSelection: true // Disable auto-picking
  });
}

