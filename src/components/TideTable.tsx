
// src/components/TideTable.tsx
// --------------------------------------------------
// 4. Tide-table UI with friendly fallbacks
// --------------------------------------------------

import React from 'react';
import { Station } from '@/services/tide/stationService';
import { formatIsoToAmPm } from '@/utils/dateTimeUtils';

export interface TideReading {
  time: string;   // ISO 8601
  height: number; // same unit returned by API
}

interface Props {
  loading: boolean;
  station: Station | null;
  readings: TideReading[];
}

const TideTable: React.FC<Props> = ({ loading, station, readings }) => {
  const formatTimeToAMPM = (timeString: string) => formatIsoToAmPm(timeString);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <span className="animate-pulse">Loading tide data…</span>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-lg font-medium">
          No tide station found within 50&nbsp;km of this location.
        </p>
        <p className="text-sm">
          Try a coastal ZIP or pick the nearest shoreline town.
        </p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Tide data isn't available for the selected date.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">Time</th>
          <th className="px-4 py-2 text-left">Height</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {readings.map(({ time, height }) => (
          <tr key={time}>
            <td className="px-4 py-2">
              {formatTimeToAMPM(time)}
            </td>
            <td className="px-4 py-2">{height.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TideTable;
