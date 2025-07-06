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
  >(initialLocation);

  const [showLocationSelector, setShowLocationSelector] = useState(
    !initialLocation && !initialStation
  );

  const [selectedStation, setSelectedStation] = useState<Station | null>(
    initialStation
  );

  const routerLocation = useRouterLocation();

  // Close location selector on route change
  useEffect(() => {
    setShowLocationSelector(false);
  }, [routerLocation.pathname]);

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
        
        try {
          if (location) {
            safeLocalStorage.set(CURRENT_LOCATION_KEY, location);
          } else {
            safeLocalStorage.remove(CURRENT_LOCATION_KEY);
          }
        } catch (err) {
          console.warn('⚠️ Error persisting location:', err);
        }
        
        return location;
      });
    },
    []
  );

  const setSelectedStationWithPersist = useCallback(
    (station: Station | null) => {
      console.log('📡 Updating station to:', station?.id || 'null');
      setSelectedStation(station);
      
      try {
        if (station) {
          safeLocalStorage.set(CURRENT_STATION_KEY, station);
        } else {
          safeLocalStorage.remove(CURRENT_STATION_KEY);
        }
      } catch (err) {
        console.warn('⚠️ Error persisting station:', err);
      }
    },
    []
  );

  // Update document title when location changes
  useEffect(() => {
    if (!currentLocation) return;
    
    console.log('📝 Updating document title for location:', currentLocation.name);
    document.title = `MoonTide - ${currentLocation.name}`;
  }, [currentLocation?.name]);

  // Initial sync with storage
  useEffect(() => {
    console.log('🔁 Syncing initial location state');
    const storedLocation = getInitialLocation();
    const storedStation = getInitialStation();
    
    if (storedLocation && !currentLocation) {
      setCurrentLocationWithLogging(storedLocation);
    }
    
    if (storedStation && !selectedStation) {
      setSelectedStationWithPersist(storedStation);
    }
  }, []);

  // Manage location selector visibility
  useEffect(() => {
    const hasLocation = !!currentLocation;
    const hasStation = !!selectedStation;
    const shouldShowSelector = !hasLocation && !hasStation;
    
    if (showLocationSelector !== shouldShowSelector) {
      console.log('🔄 Updating location selector visibility:', shouldShowSelector);
      setShowLocationSelector(shouldShowSelector);
    }
  }, [currentLocation, selectedStation, showLocationSelector]);

  return {
    currentLocation,
    setCurrentLocation: setCurrentLocationWithLogging,
    showLocationSelector,
    setShowLocationSelector,
    selectedStation,
    setSelectedStation: setSelectedStationWithPersist,
    hasLocation: !!currentLocation,
    hasStation: !!selectedStation,
  };
};