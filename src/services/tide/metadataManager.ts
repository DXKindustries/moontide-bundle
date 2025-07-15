import { fetchRealStationMetadata } from './realStationService';

interface NoaaStationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
}

class MetadataManager {
  private metadata: NoaaStationMetadata[] = [];
  private isLoading = false;
  private isLoaded = false;
  private loadPromise: Promise<NoaaStationMetadata[]> | null = null;

  async ensureLoaded(): Promise<NoaaStationMetadata[]> {
    if (this.isLoaded) {
      return this.metadata;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadMetadata();
    return this.loadPromise;
  }

  private async loadMetadata(): Promise<NoaaStationMetadata[]> {
    if (this.isLoading) return this.metadata;

    this.isLoading = true;
    try {
      this.metadata = await fetchRealStationMetadata();
      this.isLoaded = true;
      return this.metadata;
    } finally {
      this.isLoading = false;
    }
  }

  getStationState(stationId: string): string | null {
    if (!this.isLoaded) return null;
    const station = this.metadata.find((s) => s.id === stationId);
    return station?.state || null;
  }

  isMetadataReady(): boolean {
    return this.isLoaded;
  }
}

export const metadataManager = new MetadataManager();
