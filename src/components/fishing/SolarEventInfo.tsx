
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

  return (
    <div className="p-4 rounded-md bg-orange-500/10 border border-orange-500/20 w-full max-w-sm text-center flex flex-col items-center">
      <span className="text-3xl mb-1">{event.emoji}</span>
      <div className="text-base font-medium text-orange-100 leading-tight">{event.name}</div>
      {daysUntil === 0 ? (
        <div className="text-xs font-medium text-orange-100 leading-tight">today</div>
      ) : (
        <>
          <div className="text-xs font-medium text-orange-100 leading-tight">in</div>
          <div className="text-xs font-medium text-orange-100 leading-tight">
            {daysUntil} day{daysUntil !== 1 ? 's' : ''}
          </div>
        </>
      )}
      <p className="text-sm text-orange-200 leading-tight mt-2">{event.description}</p>
    </div>
  );
};

export default SolarEventInfo;
