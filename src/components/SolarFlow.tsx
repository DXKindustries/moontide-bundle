import React from 'react';
import { cn } from '@/lib/utils';
import { getSolarSeries, getCurrentDayIndexJuneShifted } from '@/utils/solarFlow';
import { NatureEventRule } from '@/types/nature';
import { evaluateRules } from '@/utils/natureEval';

interface SolarFlowProps {
  lat: number;
  lng: number;
  date: Date;
  height?: number;
  className?: string;
  showMonths?: boolean;
  natureRules?: NatureEventRule[];
  isPro?: boolean;
}

const SolarFlow: React.FC<SolarFlowProps> = ({
  lat,
  lng,
  date,
  height = 80,
  className,
  showMonths = true,
  natureRules = [],
  isPro = false,
}) => {
  const series = React.useMemo(
    () => getSolarSeries(lat, lng, date.getFullYear()),
    [lat, lng, date]
  );
  const currentIndex = React.useMemo(
    () => getCurrentDayIndexJuneShifted(date),
    [date]
  );
  const days = series.juneShiftedDays;
  const total = days.length;
  const points = React.useMemo(
    () => days.map((d, i) => `${i},${24 - d.daylightHr}`).join(' '),
    [days]
  );

  React.useMemo(() => evaluateRules(series, natureRules), [series, natureRules]);

  const gridIndices = [
    series.indices.summer,
    series.indices.autumn,
    series.indices.winter,
    series.indices.spring,
  ];

  const monthTicks = [
    { label: 'Jun', idx: 0 },
    { label: 'Sep', idx: getCurrentDayIndexJuneShifted(new Date(date.getFullYear(), 8, 1)) },
    { label: 'Dec', idx: getCurrentDayIndexJuneShifted(new Date(date.getFullYear(), 11, 1)) },
    { label: 'Mar', idx: getCurrentDayIndexJuneShifted(new Date(date.getFullYear() + 1, 2, 1)) },
    { label: 'Jun', idx: total },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${total} 24`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {gridIndices.map((g, i) => (
            <line
              key={i}
              x1={g}
              x2={g}
              y1={0}
              y2={24}
              className="stroke-muted-foreground/30"
              strokeWidth={0.5}
            />
          ))}
          {monthTicks.map((m, i) => (
            <line
              key={`tick-${i}`}
              x1={m.idx}
              x2={m.idx}
              y1={23.5}
              y2={24}
              className="stroke-muted-foreground/30"
              strokeWidth={0.5}
            />
          ))}
          <polyline
            points={points}
            className="fill-none stroke-yellow-400"
            strokeWidth={1}
          />
          <line
            x1={currentIndex}
            x2={currentIndex}
            y1={0}
            y2={24}
            className="stroke-red-500"
            strokeWidth={0.5}
          />
        </svg>
        <div
          className="absolute -top-4 text-[0.625rem] text-red-500"
          style={{
            left: `${(currentIndex / total) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          Now
        </div>
      </div>
      {showMonths && (
        <div className="relative mt-1 h-4 text-[0.625rem] text-muted-foreground">
          {monthTicks.map((m, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${(m.idx / total) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolarFlow;

