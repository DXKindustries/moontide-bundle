
import { metadataManager } from './metadataManager';

/**
 * Fetches real NOAA station metadata from their API.
 * No longer uses hardcoded local mappings.
 */
export async function fetchStationMetadata(): Promise<Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
}>> {
  return await metadataManager.ensureLoaded();
}
