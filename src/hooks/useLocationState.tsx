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
    if (
      newLocation &&
      (newLocation.id || newLocation.zipCode || newLocation.city || (newLocation.lat != null && newLocation.lng != null))
    ) {
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
    if (saved && (saved.id || saved.zipCode || saved.city || (saved.lat != null && saved.lng != null))) {
      return {
        ...saved,
        id: saved.id || saved.zipCode || `${saved.city}-${saved.state}`,
        country: saved.country || 'USA',
      } as SavedLocation & { id: string; country: string };
    }
  } catch (error) {
    console.warn('Error reading location from storage:', error);
  }

  return null;
}

function getInitialStation(): Station | null {
  try {
    const saved = safeLocalStorage.get(CURRENT_STATION_KEY);
    return saved && (saved.id || saved.stationId) ? (saved as Station) : null;
  } catch {
    return null;
  }
}

export const useLocationState = () => {
  const initialLocation = getInitialLocation();
  const initialStation = getInitialStation();

  const [currentLocation, setCurrentLocation] = useState<
    (SavedLocation & { id: string; country: string }) | null
  >(initialLocation);

  const [showLocationSelector, setShowLocationSelector] = useState(
    !initialLocation && !initialStation
  );

  const [selectedStation, setSelectedStation] = useState<Station | null>(
    initialStation
  );

  const routerLocation = useRouterLocation();

  useEffect(() => {
    setShowLocationSelector(false);
  }, [routerLocation.pathname]);

  const setCurrentLocationWithLogging = useCallback(
    (location: (SavedLocation & { id: string; country: string }) | null) => {
      setCurrentLocation(location);
    },
    []
  );

  const setSelectedStationWithPersist = useCallback(
    (station: Station | null) => {
      setSelectedStation(station);
      try {
        safeLocalStorage.set(CURRENT_STATION_KEY, station);
      } catch (err) {
        console.warn('Error saving station selection:', err);
      }
    },
    []
  );

  useEffect(() => {
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
  }, [currentLocation]);

  useEffect(() => {
    const storedLocation = getInitialLocation();
    if (storedLocation) {
      setCurrentLocationWithLogging(storedLocation);
    }

    const storedStation = getInitialStation();
    if (storedStation) {
      setSelectedStationWithPersist(storedStation);
    }
  }, []);

  useEffect(() => {
    if (currentLocation && selectedStation) {
      setShowLocationSelector(false);
    } else if (!currentLocation && !selectedStation) {
      setShowLocationSelector(true);
    }
  }, [currentLocation, selectedStation]);

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithLogging,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation: setSelectedStationWithPersist,
  };
};