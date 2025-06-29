declare module 'zipcodes' {
  export interface ZipCodeData {
    zip?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  }

  export function lookup(zip: string | number): ZipCodeData | null;
  export function lookupByCoords(lat: number, lon: number): ZipCodeData | null;
}
