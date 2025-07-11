export interface FavoriteStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  city?: string;
}

import { safeLocalStorage } from './localStorage';
import { Station } from '@/services/tide/stationService';

const KEY = 'favorite-stations';

function loadFavorites(): FavoriteStation[] {
  return safeLocalStorage.get<FavoriteStation[]>(KEY) ?? [];
}

function saveFavorites(list: FavoriteStation[]) {
  safeLocalStorage.set(KEY, list);
}

export function getFavorites(): FavoriteStation[] {
  return loadFavorites();
}

export function getFavoritesByState(state: string): FavoriteStation[] {
  const upper = state.toUpperCase();
  return loadFavorites().filter((s) => (s.state ?? '').toUpperCase() === upper);
}

export function isFavorite(id: string): boolean {
  return loadFavorites().some((s) => s.id === id);
}

export function addFavorite(station: Station): void {
  const favs = loadFavorites();
  if (favs.some((s) => s.id === station.id)) return;
  const entry: FavoriteStation = {
    id: station.id,
    name: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    state: station.state,
    city: station.city,
  };
  saveFavorites([entry, ...favs].slice(0, 20));
}

export function removeFavorite(id: string): void {
  const favs = loadFavorites().filter((s) => s.id !== id);
  saveFavorites(favs);
}

export function toggleFavorite(station: Station): void {
  if (isFavorite(station.id)) {
    removeFavorite(station.id);
  } else {
    addFavorite(station);
  }
}
