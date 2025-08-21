
import React from 'react';
import { formatIsoToAmPm } from '@/utils/dateTimeUtils';
import { calculateMoonPhase } from '@/utils/lunarUtils';

type MoonDataProps = {
  illumination: number;
  moonrise: string;
  moonset: string;
};

const getNextPhaseInfo = (currentPhase: string, currentDate: Date) => {
  const phases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
  ];
  
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1) return "Unknown";
  
  const nextIndex = (currentIndex + 1) % phases.length;
  const nextPhase = phases[nextIndex];
  
  // Calculate actual days to next phase by checking each upcoming day
  let daysToNext = 1;
  const checkDate = new Date(currentDate);
  
  // Check up to 30 days ahead to find the next phase change
  for (let i = 1; i <= 30; i++) {
    checkDate.setDate(currentDate.getDate() + i);
    const futurePhase = calculateMoonPhase(checkDate).phase;
    
    if (futurePhase === nextPhase) {
      daysToNext = i;
      break;
    }
  }
  
  return `${nextPhase} in ${daysToNext} day${daysToNext !== 1 ? 's' : ''}`;
};

const MoonData = ({ illumination, moonrise, moonset }: MoonDataProps) => {
  // Calculate current moon phase for today
  const today = React.useMemo(() => new Date(), []);
  const currentMoonData = React.useMemo(
    () => calculateMoonPhase(today),
    [today]
  );
  const nextPhaseInfo = React.useMemo(
    () => getNextPhaseInfo(currentMoonData.phase, today),
    [currentMoonData.phase, today]
  );

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
