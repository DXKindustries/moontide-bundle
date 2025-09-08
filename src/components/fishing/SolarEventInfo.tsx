
import React from 'react';
import { findNextSolarEvent } from '@/utils/solarUtils';

type SolarEventInfoProps = {
  selectedDate: Date;
};

const SolarEventInfo: React.FC<SolarEventInfoProps> = ({ selectedDate }) => {
  const nextEvent = React.useMemo(() => findNextSolarEvent(selectedDate), [selectedDate]);

  if (!nextEvent) return null;

  const { event, date } = nextEvent;
  const today = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const whenText = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;

  return (
    <div className="p-4 rounded-md bg-orange-500/10 border border-orange-500/20 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{event.emoji}</span>
        <h3 className="text-lg font-medium text-orange-100 truncate flex-1">{event.name} {whenText}</h3>
      </div>
      <p className="text-orange-200 truncate">{event.description}</p>
    </div>
  );
};

export default SolarEventInfo;
