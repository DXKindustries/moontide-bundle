export const STATE_FAVORITES_KEY = 'favorite-states';

import { safeLocalStorage } from './localStorage';

function loadFavorites(): string[] {
  return safeLocalStorage.get<string[]>(STATE_FAVORITES_KEY) ?? [];
}

function saveFavorites(list: string[]): void {
  safeLocalStorage.set(STATE_FAVORITES_KEY, list);
}

export function getFavoriteStates(): string[] {
  return loadFavorites();
}

export function addFavoriteState(state: string): void {
  const abbr = state.toUpperCase();
  const favs = loadFavorites();
  if (!favs.includes(abbr)) {
    saveFavorites([abbr, ...favs].slice(0, 10));
  }
}

export function isFavoriteState(state: string): boolean {
  const abbr = state.toUpperCase();
  return loadFavorites().some((s) => s.toUpperCase() === abbr);
}

export function removeFavoriteState(state: string): void {
  const abbr = state.toUpperCase();
  saveFavorites(loadFavorites().filter((s) => s.toUpperCase() !== abbr));
}

export function toggleFavoriteState(state: string): void {
  if (isFavoriteState(state)) {
    removeFavoriteState(state);
  } else {
    addFavoriteState(state);
  }
}
