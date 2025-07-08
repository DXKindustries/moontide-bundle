import React, { useState, useEffect, useCallback } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { locationStorage } from '@/utils/locationStorage';
import { Station } from '@/services/tide/stationService';

const CURRENT_LOCATION_KEY = 'moontide-current-location';
const CURRENT_STATION_KEY = 'moontide-current-station';

function getInitialLocation(): (SavedLocation & { id: string; country: string }) | null {
  try {
    const newLocation = locationStorage.getCurrentLocation();
    if (newLocation?.id || newLocation?.zipCode || newLocation?.city || (newLocation?.lat != null && newLocation?.lng != null)) {
      return {
        id: newLocation.id || newLocation.zipCode || `${newLocation.city}-${newLocation.state}`,
        name: newLocation.nickname || newLocation.city,
        country: 'USA',
        zipCode: newLocation.zipCode || '',
        cityState: `${newLocation.city}, ${newLocation.state}`,
        lat: newLocation.lat ?? null,
        lng: newLocation.lng ?? null,
      };
    }

    const saved = safeLocalStorage.get(CURRENT_LOCATION_KEY);
    if (saved?.id || saved?.zipCode || saved?.city || (saved?.lat != null && saved?.lng != null)) {
      return {
        ...saved,
        id: saved.id || saved.zipCode || `${saved.city}-${saved.state}`,
        country: saved.country || 'USA',
      };
    }
  } catch (error) {
    console.warn('Error reading location:', error);
  }
  return null;
}

function getInitialStation(): Station | null {
  try {
    const saved = safeLocalStorage.get(CURRENT_STATION_KEY);
    return saved?.id ? saved as Station : null;
  } catch {
    return null;
  }
}

export const useLocationState = () => {
  const [currentLocation, setCurrentLocation] = useState(() => getInitialLocation());
  const [selectedStation, setSelectedStation] = useState<Station | null>(() => getInitialStation());
  const [showLocationSelector, setShowLocationSelector] = useState(!getInitialLocation() && !getInitialStation());

  const routerLocation = useRouterLocation();

  const setCurrentLocationWithPersist = useCallback((location: (SavedLocation & { id: string; country: string }) | null) => {
    setCurrentLocation(location);
    try {
      safeLocalStorage.set(CURRENT_LOCATION_KEY, location);
    } catch (err) {
      console.warn('Error saving location:', err);
    }
  }, []);

  const setSelectedStationWithPersist = useCallback((station: Station | null) => {
    setSelectedStation(station);
    if (station) {
      setCurrentLocationWithPersist({
        id: station.id,
        name: station.name,
        country: 'USA',
        zipCode: '',
        cityState: station.city ? `${station.city}, ${station.state}` : '',
        lat: station.latitude,
        lng: station.longitude
      });
    }
    try {
      safeLocalStorage.set(CURRENT_STATION_KEY, station);
    } catch (err) {
      console.warn('Error saving station:', err);
    }
  }, [setCurrentLocationWithPersist]);

  useEffect(() => {
    setShowLocationSelector(false);
  }, [routerLocation.pathname]);

  useEffect(() => {
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
  }, [currentLocation]);

  useEffect(() => {
    if (!currentLocation && !selectedStation) {
      setShowLocationSelector(true);
    }
  }, [currentLocation, selectedStation]);

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithPersist,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation: setSelectedStationWithPersist,
  };
};