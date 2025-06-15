
import React from 'react';
import { getSolarEvents } from '@/utils/solarUtils';

type SolarEventInfoProps = {
  selectedDate: Date;
};

const SolarEventInfo: React.FC<SolarEventInfoProps> = ({ selectedDate }) => {
  const solarEvent = getSolarEvents(selectedDate);
  
  if (!solarEvent) return null;

  return (
    <div className="p-4 rounded-md bg-orange-500/10 border border-orange-500/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{solarEvent.emoji}</span>
        <h3 className="text-lg font-medium text-orange-100">{solarEvent.name}</h3>
      </div>
      <p className="text-orange-200">{solarEvent.description}</p>
    </div>
  );
};

export default SolarEventInfo;
