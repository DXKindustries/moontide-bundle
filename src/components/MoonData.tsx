import React from 'react';
import { formatIsoToAmPm } from '@/utils/dateTimeUtils';
import { getFullMoonName, findNextFullMoon, findNextNewMoon } from '@/utils/lunarUtils';

type MoonDataProps = {
  illumination: number;
  moonrise: string;
  moonset: string;
};

const MoonData = ({ illumination, moonrise, moonset }: MoonDataProps) => {
  const nextFullMoonDate = React.useMemo(() => findNextFullMoon(new Date()), []);
  const nextNewMoonDate = React.useMemo(() => findNextNewMoon(new Date()), []);

  let nextFullInfo = "Not available";
  if (nextFullMoonDate) {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const daysUntil = Math.round((nextFullMoonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const fullMoonName = getFullMoonName(nextFullMoonDate)?.name || "Full Moon";
    if (daysUntil === 0) {
      nextFullInfo = `${fullMoonName} today`;
    } else if (daysUntil > 0) {
      nextFullInfo = `${fullMoonName} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }
  }

  let nextNewInfo = "Not available";
  if (nextNewMoonDate) {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const daysUntil = Math.round((nextNewMoonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 0) {
      nextNewInfo = "New Moon today";
    } else if (daysUntil > 0) {
      nextNewInfo = `New Moon in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }
  }

  return (
    <div className="w-full text-sm divide-y divide-muted/30">
      <div className="flex items-center justify-between py-1">
        <span className="text-muted-foreground">Illumination</span>
        <span className="font-semibold text-moon-primary">{illumination}%</span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-muted-foreground">Moonrise</span>
        <span className="font-semibold">{formatIsoToAmPm(moonrise)}</span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-muted-foreground">Moonset</span>
        <span className="font-semibold">{formatIsoToAmPm(moonset)}</span>
      </div>
      <div className="flex flex-col items-center py-1">
        <span className="text-muted-foreground">Next Full Moon</span>
        <span className="font-semibold">{nextFullInfo}</span>
      </div>
      <div className="flex flex-col items-center py-1">
        <span className="text-muted-foreground">Next New Moon</span>
        <span className="font-semibold">{nextNewInfo}</span>
      </div>
    </div>
  );
};

export default MoonData;
