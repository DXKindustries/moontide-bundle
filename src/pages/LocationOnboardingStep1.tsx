import React, { useEffect, useState } from 'react';
import StarsBackdrop from '@/components/StarsBackdrop';
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

interface RawStation {
  id: string;
  name: string;
  lat: string | number;
  lng: string | number;
  state?: string;
  city?: string;
}

const stateOptions = Object.entries(STATE_NAME_TO_ABBR)
  .map(([name, abbr]) => ({ value: abbr, label: name.replace(/\b\w/g, (l) => l.toUpperCase()) }))
  .sort((a, b) => a.label.localeCompare(b.label));

const LocationOnboardingStep1 = () => {
  const [selectedState, setSelectedState] = useState('');
  const [stations, setStations] = useState<RawStation[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<RawStation | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSelectedStation: saveStation } = useLocationState();
  const navigate = useNavigate();

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
    saveStation(station);
    navigate('/');
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
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      <StarsBackdrop />
      <div className="space-y-4 w-full max-w-md relative z-10">
        <h1 className="text-center text-xl font-bold">Choose a NOAA Station</h1>

        <Select onValueChange={(val) => setSelectedState(val)} value={selectedState}>
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
            <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
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
                    className={`p-2 cursor-pointer hover:bg-accent ${selectedStation?.id === st.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedStation(st)}
                  >
                    <div className="font-medium">{st.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {st.city ?? 'Unknown'}, {st.state} - {st.id} ({st.lat}, {st.lng})
                    </div>
                  </div>
                ))}
              {!loading && !error && radiusFilteredStations.length === 0 && (
                <div className="p-2 text-sm">No stations found</div>
              )}
            </div>
          </div>
        )}

        <Button disabled={!selectedStation} onClick={handleContinue} className="w-full">
          Show Tides
        </Button>
      </div>
    </div>
  );
};

export default LocationOnboardingStep1;
