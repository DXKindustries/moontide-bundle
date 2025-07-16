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
import { Label } from '@/components/ui/label';
import { Loader2, X, ArrowLeft } from 'lucide-react';
import { useLocationState } from '@/hooks/useLocationState';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { useNavigate } from 'react-router-dom';
import { STATE_NAME_TO_ABBR } from '@/utils/stateNames';
import { Station } from '@/services/tide/stationService';
import { getDistanceKm } from '@/services/tide/geo';
import { normalize } from '@/utils/normalize';
import { SavedLocation } from '@/components/LocationSelector';
import {
  getFavoriteStates,
  addFavoriteState,
  removeFavoriteState,
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
  const [stations, setStations] = useState<RawStation[]>([]);
  const [favoriteStates, setFavoriteStates] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<RawStation | null>(null);
  const [solarZip, setSolarZip] = useState('');
  const [radius, setRadius] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSelectedStation: saveStation, setCurrentLocation, selectedState, setSelectedState } = useLocationState();
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

  const handleRemoveFavorite = (state: string) => {
    removeFavoriteState(state);
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

  const handleContinue = async () => {
    if (!selectedStation) return;
    const station: Station = {
      id: selectedStation.id,
      name: selectedStation.name,
      latitude: parseFloat(String(selectedStation.lat)),
      longitude: parseFloat(String(selectedStation.lng)),
      state: selectedState,
      city: selectedStation.city,
      userSelectedState: selectedState,
    };

    // Precompute the location object so we can persist it after selecting the station
    let newLocation: SavedLocation & { id: string; country: string } | null = null;

    if (solarZip.trim()) {
      const geo = await lookupZipCode(solarZip.trim());
      if (geo && geo.places && geo.places.length > 0) {
        newLocation = {
          id: station.id,
          name: station.name,
          country: 'USA',
          zipCode: solarZip.trim(),
          cityState: `${geo.places[0]['place name']}, ${selectedState}`,
          lat: parseFloat(geo.places[0].latitude),
          lng: parseFloat(geo.places[0].longitude),
          userSelectedState: selectedState,
        };
      } else {
        newLocation = {
          id: station.id,
          name: station.name,
          country: 'USA',
          zipCode: solarZip.trim(),
          cityState: `, ${selectedState}`,
          lat: null,
          lng: null,
          userSelectedState: selectedState,
        };
      }
    }

    // First select the station so the zip-based location isn't overwritten
    if (onStationSelect) {
      onStationSelect(station);
    } else {
      saveStation(station);
    }

    if (newLocation) {
      setCurrentLocation(newLocation);
    }

    // Navigate back to the main tide screen when not used as a standalone step
    if (!onStationSelect) {
      goToTideScreen();
    }
  };

  const handleClearSelection = () => {
    setSelectedStation(null);
    setRadius(null);
  };

  const filteredStations = stations.filter((s) => {
    const term = normalize(search);
    return (
      normalize(s.name).includes(term) ||
      (s.city ?? '').toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term)
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
    <div className="min-h-screen flex flex-col relative p-2 overflow-y-auto">
      <StarsBackdrop />
      <div className="absolute top-2 left-2 z-20">
        <Button variant="ghost" size="icon" onClick={goToTideScreen}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <AppBanner className="mb-2 relative z-10" />
      <div className="flex flex-col space-y-2 w-full max-w-md relative z-10 flex-grow">
        <h1 className="text-center text-base font-bold">Choose a NOAA Station</h1>
        <div className="space-y-1">
          <Label htmlFor="solar-zip" className="text-sm">ZIP Code for Sunrise/Sunset</Label>
          <Input
            id="solar-zip"
            placeholder="e.g. 02840"
            value={solarZip}
            onChange={(e) => setSolarZip(e.target.value)}
          />
        </div>

        <div className="flex-grow space-y-2 overflow-y-auto">
          {/* --- Updated Two-Line State Selector Below --- */}
          <div style={{ marginBottom: 2 }}>
            <div style={{ fontSize: '0.98em', color: '#BBB', marginBottom: 2 }}>
              To View Tides
            </div>
            <Select onValueChange={handleStateChange} value={selectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select a State" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {stateOptions.map((st) => (
                  <SelectItem key={st.value} value={st.value}>
                    {st.label} ({st.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* --- End of Two-Line State Selector --- */}

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

              <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
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
                          {st.state} - {st.id} ({st.lat}, {st.lng})
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
                  <div key={st} className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={selectedState === st ? 'default' : 'outline'}
                      onClick={() => handleStateChange(st)}
                    >
                      {st}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(st);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background pt-2 space-y-2">
          <Button disabled={!selectedStation} onClick={handleContinue} className="w-full">
            Show Tides
          </Button>
          <Button variant="outline" onClick={goToTideScreen} className="w-full">
            Back to Tides
          </Button>
        </div>
      </div>
      <div className="relative z-10 mt-4 flex justify-center">
        <MoonVisual phase="Full Moon" illumination={100} />
      </div>
    </div>
  );
};

export default LocationOnboardingStep1;
