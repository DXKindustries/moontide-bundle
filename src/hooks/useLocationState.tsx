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
      (newLocation.zipCode || newLocation.city || (newLocation.lat != null && newLocation.lng != null))
    ) {
      return {
        id: newLocation.zipCode || `${newLocation.city}-${newLocation.state}`,
        name: newLocation.nickname || newLocation.city,
        country: 'USA',
        zipCode: newLocation.zipCode || '',
        cityState: `${newLocation.city}, ${newLocation.state}`,
        lat: newLocation.lat ?? null,
        lng: newLocation.lng ?? null,
      };
    }

    const saved: any = safeLocalStorage.get(CURRENT_LOCATION_KEY);
    if (
      saved &&
      (saved.id || saved.zipCode || saved.cityState || (saved.lat != null && saved.lng != null))
    ) {
      return {
        ...saved,
        id: saved.id || saved.zipCode || `${saved.cityState}`,
        country: saved.country || 'USA',
      } as SavedLocation & { id: string; country: string };
    }
  } catch (error) {
    console.warn('⚠️ Error reading location from storage:', error);
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
  console.log('🏗️ useLocationState hook initializing...');

  const initialLocation = getInitialLocation();
  const initialStation = getInitialStation();

  const [currentLocation, setCurrentLocation] = useState<
    (SavedLocation & { id: string; country: string }) | null
  >(() => {
    console.log('📍 Initializing currentLocation state...');
    return initialLocation;
  });

  const [showLocationSelector, setShowLocationSelector] = useState(() =>
    !initialLocation && !initialStation
  );

  const [selectedStation, setSelectedStation] = useState<Station | null>(() =>
    initialStation
  );

  const routerLocation = useRouterLocation();

  // Close any open location selector when navigating to a new route
  useEffect(() => {
    setShowLocationSelector(false);
  }, [routerLocation.pathname]);

  /* ---------- setters with logging / persistence ---------- */

  const setCurrentLocationWithLogging = useCallback(
    (location: (SavedLocation & { id: string; country: string }) | null) => {
      console.log('🔄 useLocationState: setCurrentLocation called with:', location);
      
      setCurrentLocation(prev => {
        if (
          prev?.id === location?.id &&
          prev?.zipCode === location?.zipCode &&
          prev?.lat === location?.lat &&
          prev?.lng === location?.lng
        ) {
          return prev;
        }
        return location;
      });
      
      console.log(
        location
          ? '✅ useLocationState: User now has a location'
          : '🎯 useLocationState: User has no location'
      );
    },
    []
  );

  const setSelectedStationWithPersist = useCallback(
    (station: Station | null) => {
      setSelectedStation(station);
      try {
        safeLocalStorage.set(CURRENT_STATION_KEY, station);
      } catch (err) {
        console.warn('⚠️ Error saving station selection:', err);
      }
    },
    []
  );

  // Log whenever the selected station changes so we can verify stationId
  useEffect(() => {
    console.log('📡 Selected station updated:', selectedStation?.id);
  }, [selectedStation]);

  /* ---------- side-effect: update page title on location change ---------- */

  useEffect(() => {
    console.log(
      '📝 useLocationState useEffect: Setting document title for location:',
      currentLocation?.name
    );
    document.title = `MoonTide - ${currentLocation?.name ?? 'Choose Location'}`;
    console.log(
      '🔄 useLocationState useEffect: Location state change detected - hasLocation:',
      !!currentLocation
    );
  }, [currentLocation]);

  // Sync state with storage on mount so navigation between pages keeps location
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

  // Keep modal visibility in sync with stored location and station
  useEffect(() => {
    if (currentLocation && selectedStation) {
      setShowLocationSelector(false);
    } else if (!currentLocation && !selectedStation) {
      setShowLocationSelector(true);
    }
  }, [currentLocation, selectedStation]);

  /* ---------- what the hook exposes ---------- */

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithLogging,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation: setSelectedStationWithPersist,
  };
};