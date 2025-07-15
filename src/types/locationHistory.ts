export interface LocationHistoryEntry {
  stationId: string;
  stationName: string;
  nickname?: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  userSelectedState?: string;
  zipCode?: string;
  sourceType: 'zip' | 'text' | 'gps' | 'station';
  searchQuery?: string;
  timestamp: number;
}
