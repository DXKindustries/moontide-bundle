import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { SavedLocation } from '@/components/LocationSelector';
import { safeLocalStorage } from '@/utils/localStorage';
import { persistCurrentLocation, loadCurrentLocation, clearCurrentLocation } from '@/utils/currentLocation';
import { Station } from '@/services/tide/stationService';

const CURRENT_STATION_KEY = 'moontide-current-station';

function getInitialLocation(): (SavedLocation & { id: string; country: string }) | null {
  try {
    return loadCurrentLocation();
  } catch (error) {
    console.warn('Error reading location:', error);
    return null;
  }
}

function getInitialStation(): Station | null {
  try {
    const saved = safeLocalStorage.get(CURRENT_STATION_KEY);
    return saved?.id ? saved as Station : null;
  } catch {
    return null;
  }
}

const useLocationStateValue = () => {
  const [currentLocation, setCurrentLocation] = useState(() => getInitialLocation());
  const [selectedStation, setSelectedStation] = useState<Station | null>(() => getInitialStation());
  const [showLocationSelector, setShowLocationSelector] = useState(!getInitialLocation() && !getInitialStation());

  const routerLocation = useRouterLocation();

  const setCurrentLocationWithPersist = useCallback((location: (SavedLocation & { id: string; country: string }) | null) => {
    setCurrentLocation(location);
    try {
      if (location) {
        persistCurrentLocation(location);
      } else {
        clearCurrentLocation();
      }
    } catch (err) {
      console.warn('Error saving location:', err);
    }
  }, []);

  const setSelectedStationWithPersist = useCallback((station: Station | null) => {
    setSelectedStation(station);
    if (station) {
      console.log('Station selected:', station.id, station.name);
    }
    if (station) {
      // Merge the selected station into the previous location so we retain ZIP/city info.
      const mergedLocation = {
        ...(currentLocation ?? {
          id: station.id,
          name: station.name,
          country: 'USA',
          zipCode: '',
          cityState: station.city ? `${station.city}, ${station.state}` : '',
          lat: station.latitude,
          lng: station.longitude
        }),
        id: station.id,
        name: station.name,
        cityState: station.city ? `${station.city}, ${station.state}` : currentLocation?.cityState ?? '',
        lat: station.latitude,
        lng: station.longitude
      } as SavedLocation & { id: string; country: string };

      console.log('🔀 Merged location with station:', mergedLocation);
      setCurrentLocationWithPersist(mergedLocation);
    }
    try {
      safeLocalStorage.set(CURRENT_STATION_KEY, station);
    } catch (err) {
      console.warn('Error saving station:', err);
    }
  }, [currentLocation, setCurrentLocationWithPersist]);

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

type LocationState = ReturnType<typeof useLocationStateValue>;

const LocationContext = createContext<LocationState | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useLocationStateValue();
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationState = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationState must be used within a LocationProvider');
  }
  return context;
};
