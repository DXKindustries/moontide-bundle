
export interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  isManual: boolean;
  timestamp?: number; // When this location was saved
}

export interface ZipLookupResult {
  city: string;
  state: string;
  lat: number;
  lng: number;
}
