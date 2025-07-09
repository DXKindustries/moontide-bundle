
export interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  stationId?: string;
  stationName?: string;
  isManual: boolean;
  timestamp?: number; // When this location was saved
  nickname?: string; // User-defined nickname for the location
}

export interface ZipLookupResult {
  city: string;
  state: string;
  lat: number;
  lng: number;
}
