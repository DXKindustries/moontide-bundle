import React, { useEffect, useState } from 'react';
import StarsBackdrop from '@/components/StarsBackdrop';
import AppBanner from '@/components/AppBanner';
import MoonVisual from '@/components/MoonVisual';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, X } from 'lucide-react';
import { useLocationState } from '@/hooks/useLocationState';
import { useNavigate } from 'react-router-dom';
import { STATE_NAME_TO_ABBR } from '@/utils/stateNames';
import { Station } from '@/services/tide/stationService';
import { getDistanceKm } from '@/services/tide/geo';
import {
  getFavoriteStates,
  addFavoriteState,
} from '@/utils/stateFavorites';

interface RawStation {
  id: string;
  name: string;
  lat: string | number;
  lng: string | number;
  state?: string;
  city?: string;
}

const ALLOWED_STATES = [
  'AL', 'AK', 'CA', 'CT', 'DE', 'FL', 'GA', 'HI', 'LA', 'ME', 'MD', 'MA',
  'MS', 'NH', 'NJ', 'NY', 'NC', 'OR', 'PA', 'RI', 'SC', 'TX', 'VA', 'WA',
];

const stateOptions = Object.entries(STATE_NAME_TO_ABBR)
  .map(([name, abbr]) => ({ value: abbr, label: name.replace(/\b\w/g, (l) => l.toUpperCase()) }))
  .filter((opt) => ALLOWED_STATES.includes(opt.value))
  .sort((a, b) => a.label.localeCompare(b.label));

interface LocationOnboardingStep1Props {
  onStationSelect?: (station: Station) => void;
}

const LocationOnboardingStep1 = ({ onStationSelect }: LocationOnboardingStep1Props) => {
  const [selectedState, setSelectedState] = useState('');
  const [stations, setStations] = useState<RawStation[]>([]);
  const [favoriteStates, setFavoriteStates] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<RawStation | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSelectedStation: saveStation } = useLocationState();
  const navigate = useNavigate();

  const goToTideScreen = () => {
    navigate('/', { replace: true });
  };

  useEffect(() => {
    setFavoriteStates(getFavoriteStates());
  }, []);

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    addFavoriteState(val);
    setFavoriteStates(getFavoriteStates());
  };

  // Reset radius filter when the selected station changes
  useEffect(() => {
    setRadius(null);
  }, [selectedStation]);

  useEffect(() => {
    if (!selectedState) {
      setStations([]);
      setSelectedStation(null);
      setError(null);
      return;
    }

    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const url =
          `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?state=${selectedState}` +
          `&type=tidepredictions&includeSubordinate=true&rows=10000`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Failed to fetch station list');
        }
        const data = await res.json();
        const all: RawStation[] = data.stations || [];
        const filtered = all.filter(
          (st) => st.state?.toUpperCase() === selectedState.toUpperCase(),
        );
        setStations(filtered);
      } catch {
        setStations([]);
        setError('Unable to load stations. Check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [selectedState]);

  const handleContinue = () => {
    if (!selectedStation) return;
    const station: Station = {
      id: selectedStation.id,
      name: selectedStation.name,
      latitude: parseFloat(String(selectedStation.lat)),
      longitude: parseFloat(String(selectedStation.lng)),
      state: selectedStation.state,
      city: selectedStation.city,
    };

    if (onStationSelect) {
      onStationSelect(station);
    } else {
      saveStation(station);
      goToTideScreen();
    }
  };

  const handleClearSelection = () => {
    setSelectedStation(null);
    setRadius(null);
  };

  const filteredStations = stations.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.city ?? '').toLowerCase().includes(term) ||
      s.id.includes(term)
    );
  });

  const radiusFilteredStations =
    radius != null && selectedStation
      ? stations.filter((s) => {
          const dist = getDistanceKm(
            parseFloat(String(selectedStation.lat)),
            parseFloat(String(selectedStation.lng)),
            parseFloat(String(s.lat)),
            parseFloat(String(s.lng)),
          );
          return dist <= radius;
        })
      : filteredStations;

  return (
    <div className="min-h-screen flex flex-col relative p-4 overflow-y-auto">
      <StarsBackdrop />
      <AppBanner className="mb-4 relative z-10" />
      <div className="flex flex-col space-y-4 w-full max-w-md relative z-10 flex-grow">
        <h1 className="text-center text-lg font-bold">Choose a NOAA Station</h1>

        <div className="flex-grow space-y-2 overflow-y-auto">
          <Select onValueChange={handleStateChange} value={selectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {stateOptions.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  {st.label} ({st.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedState && (
            <div className="space-y-2">
            <Input
              placeholder="Search stations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 items-center">
              {[10, 20, 30].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={radius === r ? 'default' : 'outline'}
                  disabled={!selectedStation}
                  onClick={() => setRadius(r)}
                >
                  {r}km
                </Button>
              ))}
              {selectedStation && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {error && (
              <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="max-h-32 overflow-y-auto border rounded-md divide-y">
              {loading && (
                <div className="p-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading stations...
                </div>
              )}
              {!loading &&
                radiusFilteredStations.map((st) => (
                  <div
                    key={st.id}
                    className={`p-2 cursor-pointer hover:bg-accent flex items-center justify-between ${selectedStation?.id === st.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedStation(st)}
                  >
                    <div>
                      <div className="font-medium">{st.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {st.city ?? 'Unknown'}, {st.state} - {st.id} ({st.lat}, {st.lng})
                      </div>
                    </div>
                  </div>
                ))}
              {!loading && !error && radiusFilteredStations.length === 0 && (
                <div className="p-2 text-sm">No stations found</div>
              )}
            </div>
          </div>
        )}

        {favoriteStates.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Favorite States</div>
            <div className="flex flex-wrap gap-2">
              {favoriteStates.map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={selectedState === st ? 'default' : 'outline'}
                  onClick={() => handleStateChange(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        )}
        </div>

        <div className="sticky bottom-0 bg-background pt-4 space-y-2">
          <Button disabled={!selectedStation} onClick={handleContinue} className="w-full">
            Show Tides
          </Button>
          <Button variant="outline" onClick={goToTideScreen} className="w-full">
            Go to Tides
          </Button>
        </div>
      </div>
      <div className="relative z-10 mt-6 flex justify-center">
        <MoonVisual phase="Full Moon" illumination={100} />
      </div>
    </div>
  );
};

export default LocationOnboardingStep1;
