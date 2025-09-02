import React from 'react';
import { formatIsoToAmPm } from '@/utils/dateTimeUtils';
import { findNextFullMoon, getFullMoonName } from '@/utils/lunarUtils';

type MoonDataProps = {
  illumination: number;
  moonrise: string;
  moonset: string;
};

const MoonData = ({ illumination, moonrise, moonset }: MoonDataProps) => {
  const nextFullMoonDate = React.useMemo(() => findNextFullMoon(new Date()), []);

  let nextPhaseInfo = "Not available";
  if (nextFullMoonDate) {
    // Use UTC for an accurate day difference calculation
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const daysUntil = Math.round((nextFullMoonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const fullMoonName = getFullMoonName(nextFullMoonDate)?.name || "Full Moon";

    if (daysUntil >= 0) {
        if (daysUntil === 0) {
            nextPhaseInfo = `${fullMoonName} today`;
        } else {
            nextPhaseInfo = `${fullMoonName} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
        }
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
        <span className="text-muted-foreground">Next Phase</span>
        <span className="font-semibold">{nextPhaseInfo}</span>
      </div>
    </div>
  );
};

export default MoonData;
