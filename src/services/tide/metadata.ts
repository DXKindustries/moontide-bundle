
import { fetchRealStationMetadata } from './realStationService';

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
  console.log('📊 Fetching real NOAA station metadata...');
  
  try {
    const stations = await fetchRealStationMetadata();
    console.log(`✅ Successfully loaded ${stations.length} real NOAA tide stations`);
    return stations;
  } catch (error) {
    console.error('❌ Failed to fetch real station metadata:', error);
    throw new Error('Unable to load real NOAA station data. Please check your internet connection.');
  }
}
