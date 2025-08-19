import React from "react";
import {
  getSolarSeries,
  getCurrentDayIndexJuneShifted,
} from "@/utils/solarFlow";

interface SolarFlowProps {
  lat: number;
  lng: number;
  date: Date;
}

const SolarFlow: React.FC<SolarFlowProps> = ({ lat, lng, date }) => {
  const series = getSolarSeries(lat, lng, date.getFullYear());
  const days = series.juneShiftedDays;
  const total = days.length;

  // Get the "current" day index shifted to June start
  const now = getCurrentDayIndexJuneShifted(series, date);

  // Exaggerate the vertical axis around the 12h equinox line
  const Y_SCALE = 10;
  const MID = 12;

  // Convert a daylight-hour value to a scaled Y coordinate
  const rawY = (hr: number) => MID + (MID - hr) * Y_SCALE;

  // Pre-calculate Y values to determine the chart's vertical range
  const yValues = days.map((d) => rawY(d.daylightHr));
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yOffset = -minY;
  const chartHeight = maxY - minY;

  // Helper to convert daylight hours to scaled/shifted coordinates
  const toY = (hr: number) => rawY(hr) + yOffset;

  // Build the polyline points string for the yellow curve
  const points = days.map((d, i) => `${i},${toY(d.daylightHr)}`).join(" ");

  // Interpolates daylight hours smoothly for guides
  const calcY = (idx: number) => {
    const i0 = Math.floor(idx);
    const i1 = (i0 + 1) % total;
    const t = idx - i0;
    const hr = days[i0].daylightHr * (1 - t) + days[i1].daylightHr * t;
    return toY(hr);
  };

  // Month labels for vertical guides
  const months = [
    { label: "Jun", idx: 0 },
    { label: "Sep", idx: series.indices.autumn },
    { label: "Dec", idx: series.indices.winter },
    { label: "Mar", idx: series.indices.spring },
    { label: "Jun", idx: total },
  ];

  return (
    <div
      style={{
        width: 560,
        background: "#1B1B2E",
        color: "#fff",
        fontFamily: "sans-serif",
        fontSize: "12px",
        padding: "12px 24px 24px 80px",
        position: "relative",
      }}
    >
      <svg viewBox={`0 0 ${total} ${chartHeight}`} width="100%" height="140">
        {/* Vertical month gridlines */}
        {months.map((m) => (
          // FIX: use stable key from month label + index, not array index
          <line
            key={m.label + m.idx}
            x1={m.idx}
            x2={m.idx}
            y1={0}
            y2={chartHeight}
            stroke="#646464"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}

        {/* Horizontal guide lines: Summer, Equinox, Winter */}
        {[calcY(series.indices.summer), toY(12), calcY(series.indices.winter)].map(
          (y, idx) => (
            // FIX: use a string-based key so React can match correctly
            <line
              key={`h-guide-${idx}`}
              x1={0}
              x2={total}
              y1={y}
              y2={y}
              stroke="#646464"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          )
        )}

        {/* Daylight curve (yellow polyline) */}
        <polyline
          points={points}
          fill="none"
          stroke="#FFFF00"
          strokeWidth="2"
        />

        {/* "Now" vertical line (red dashed) */}
        <line
          x1={now}
          x2={now}
          y1={0}
          y2={chartHeight}
          stroke="#FF0000"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* "Now" label rendered relative to chart */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: `${(now / total) * 100}%`,
          transform: "translate(-50%, -100%)",
          color: "#FF0000",
          fontWeight: 600,
        }}
      >
        Now
      </div>

      {/* Guide labels on left side */}
      <div style={{ position: "absolute", left: 8, top: 16 }}>
        Summer Solstice (max)
      </div>
      <div
        style={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        Equinox (~12h)
      </div>
      <div style={{ position: "absolute", left: 8, bottom: 16 }}>
        Winter Solstice (min)
      </div>

      {/* Month labels at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          transform: "translateY(100%)",
        }}
      >
        {months.map((m) => (
          // FIX: again, use label+idx as stable key instead of map index
          <span
            key={`month-${m.label}-${m.idx}`}
            style={{
              position: "relative",
              left: `${(m.idx / total) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SolarFlow;

