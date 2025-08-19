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
  const days = series.juneShiftedDays;
  const total = days.length;
  const currentIndex = React.useMemo(
    () => getCurrentDayIndexJuneShifted(series, date),
    [series, date]
  );
  const points = React.useMemo(
    () => days.map((d, i) => `${i},${24 - d.daylightHr}`).join(' '),
    [days]
  );

  React.useMemo(() => evaluateRules(series, natureRules), [series, natureRules]);

  const monthTicks = [
    { label: 'Jun', idx: 0 },
    { label: 'Sep', idx: series.indices.autumn },
    { label: 'Dec', idx: series.indices.winter },
    { label: 'Mar', idx: series.indices.spring },
    { label: 'Jun', idx: total },
  ];
  const gridIndices = monthTicks.map((m) => m.idx);

  const calcY = React.useCallback(
    (idx: number) => {
      const i0 = Math.floor(idx);
      const i1 = (i0 + 1) % total;
      const t = idx - i0;
      const hr =
        days[i0].daylightHr * (1 - t) + days[i1].daylightHr * t;
      return 24 - hr;
    },
    [days, total]
  );

  const guides = [
    { y: calcY(series.indices.summer), label: 'Summer Solstice (max)' },
    { y: 12, label: 'Equinox (~12h)' },
    { y: calcY(series.indices.winter), label: 'Winter Solstice (min)' },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        <div className="relative w-full overflow-hidden" style={{ height }}>
          <svg
            viewBox={`0 0 ${total} 24`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {gridIndices.map((g, i) => (
              <line
                key={`v-${i}`}
                x1={g}
                x2={g}
                y1={0}
                y2={24}
                className="stroke-muted-foreground/10"
                strokeWidth={0.5}
                strokeDasharray="2 2"
              />
            ))}
            {guides.map((g, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                x2={total}
                y1={g.y}
                y2={g.y}
                className="stroke-muted-foreground/10"
                strokeWidth={0.5}
                strokeDasharray="2 2"
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
              className="stroke-destructive"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <div
            className="absolute text-[0.625rem] text-destructive"
            style={{
              left: `${(currentIndex / total) * 100}%`,
              top: 0,
              transform: 'translate(-50%, -100%)',
              marginTop: '-6px',
            }}
          >
            Now
          </div>
          {guides.map((g, i) => (
            <div
              key={`t-${i}`}
              className="absolute text-[0.625rem] text-muted-foreground"
              style={{
                left: 0,
                top: `${(g.y / 24) * 100}%`,
                transform: 'translate(-105%, -50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {g.label}
            </div>
          ))}
        </div>
      </div>
      {showMonths && (
        <div className="relative mt-1 h-4 text-[0.625rem] text-foreground">
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

