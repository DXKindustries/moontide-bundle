
import React from 'react';

type MoonPhase = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
                 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

type FishingTipsProps = {
  moonPhase: MoonPhase;
};

const FishingTips: React.FC<FishingTipsProps> = ({ moonPhase }) => {
  const getTipForMoonPhase = (phase: MoonPhase): string => {
    switch (phase) {
      case 'Full Moon':
        return "During a full moon, fish tend to feed more actively at night. Focus on the outgoing tide after high tide for best results.";
      case 'New Moon':
        return "New moon provides excellent night fishing with minimal light. Fish are often less cautious during this time.";
      default:
        return "Quarter moon phases provide moderate fishing conditions. Focus on the tide transitions for best results.";
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Fishing Tips</h3>
      <p>{getTipForMoonPhase(moonPhase)}</p>
    </div>
  );
};

export default FishingTips;
