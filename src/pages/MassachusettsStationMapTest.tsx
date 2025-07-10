// Temporary test screen for listing Massachusetts tide stations.
import React, { useEffect, useState } from 'react';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RawStation {
  id: string;
  name: string;
  lat?: string | number;
  lng?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  state?: string;
}

const MassachusettsStationMapTest = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(
          'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?rows=200',
        );
        if (!response.ok) throw new Error('Failed to fetch stations');
        const data = await response.json();
        const filtered: Station[] = (data.stations as RawStation[] || [])
          .filter((s) => s.state === 'MA')
          .map((s) => ({
            id: s.id,
            name: s.name,
            lat: parseFloat(String(s.lat ?? s.latitude)),
            lng: parseFloat(String(s.lng ?? s.longitude)),
          }));
        setStations(filtered);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Massachusetts NOAA Stations</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
          {stations.map((st) => (
            <li key={st.id} className="border p-2 rounded">
              <div className="font-medium">{st.id} - {st.name}</div>
              <div className="text-sm text-gray-600">
                Lat: {st.lat}, Lng: {st.lng}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MassachusettsStationMapTest;
