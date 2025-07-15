import { LocationData } from '@/types/locationTypes';
import { normalizeState } from '@/utils/stateNames';

export function formatLocationSubtext(
  location: LocationData,
  stationStates: Record<string, string> = {},
): string {
  const id = location.stationId || 'Unknown';
  const lat = location.lat != null ? location.lat : 'Unknown';
  const lng = location.lng != null ? location.lng : 'Unknown';

  let state = location.userSelectedState?.trim() || location.state?.trim();
  if (!state && id !== 'Unknown') {
    state = stationStates[id];
  }
  const displayState = state ? normalizeState(state) || state : 'Unknown';
  return `${displayState} - ${id} (${lat}, ${lng})`;
}
