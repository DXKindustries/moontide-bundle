
import React from 'react';
import { formatTimeToAmPm } from '@/utils/dateTimeUtils';
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
  const today = new Date();
  const currentMoonData = calculateMoonPhase(today);
  const nextPhaseInfo = getNextPhaseInfo(currentMoonData.phase, today);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Illumination</p>
        <p className="text-lg font-semibold text-moon-primary">{illumination}%</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Moonrise</p>
        <p className="text-lg font-semibold">{formatTimeToAmPm(moonrise)}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Moonset</p>
        <p className="text-lg font-semibold">{formatTimeToAmPm(moonset)}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Next Phase</p>
        <p className="text-lg font-semibold">{nextPhaseInfo}</p>
      </div>
    </div>
  );
};

export default MoonData;
