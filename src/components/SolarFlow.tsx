import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  getSolarSeries,
  getCurrentDayIndexJuneShifted,
} from "@/utils/solarFlow";

/**
 * SolarFlow
 * Responsive SVG chart showing daylight length across a June→June year,
 * smoothed to the approved S-curve, with equinox/solstice guides and a
 * "Now" vertical marker. Layout includes left-side guide labels and
 * bottom month labels, matching the Tide chart’s visual language.
 */
interface SolarFlowProps {
  lat: number;
  lng: number;
  date: Date;
}

type Pt = { x: number; y: number };

const SolarFlow: React.FC<SolarFlowProps> = ({ lat, lng, date }) => {
  // ----- Data prep ----------------------------------------------------------
  const series = getSolarSeries(lat, lng, date.getFullYear());
  const days = series.juneShiftedDays;
  const total = days.length;

  // Index of today's day in the shifted array
  const nowIdx = getCurrentDayIndexJuneShifted(series, date);

  // Exaggerate distance from the 12h line (approved visual)
  const MID = 12;
  const Y_SCALE = 10; // keep identical to spec; visual exaggeration

  // Raw (unshifted) Y in “chart units”; 12h stays at the middle reference
  const rawY = (hr: number) => MID + (MID - hr) * Y_SCALE;

  // Compute chart vertical bounds to normalize the viewBox height
  const rawYValues = days.map((d) => rawY(d.daylightHr));
  const minRawY = Math.min(...rawYValues);
  const maxRawY = Math.max(...rawYValues);
  const yOffset = -minRawY;
  const chartHeight = maxRawY - minRawY;

  // Convert daylight hours to normalized Y (0..chartHeight)
  const toY = (hr: number) => rawY(hr) + yOffset;

  // Smooth interpolation for guides at seasonal indices
  const lerpY = (idx: number) => {
    const i0 = Math.floor(idx);
    const i1 = (i0 + 1) % total;
    const t = idx - i0;
    const hr = days[i0].daylightHr * (1 - t) + days[i1].daylightHr * t;
    return toY(hr);
  };

  // Guide Y’s
  const guideY = {
    summer: lerpY(series.indices.summer),
    equinox: toY(12),
    winter: lerpY(series.indices.winter),
  } as const;

  // ----- Geometry / layout --------------------------------------------------
  // These govern rendered size and padding around the SVG so labels
  // do not collide (addresses the “Now label cramped at top” issue).
  // Shrink the overall vertical footprint ~20% to soften the "V" curve
  // while preserving relative spacing.
  const SVG_HEIGHT_PX = 128;
  const TOP_PAD_PX = 26; // proportional top padding so "Now" label can float above chart
  const BOTTOM_PAD_PX = 26; // proportional bottom padding for cleaner spacing
  const LEFT_LABEL_COL_PX = 60; // Narrower label column stretches X-axis
  const RIGHT_PAD_PX = 8;

  // Helper maps a Y in viewBox space → pixel offset within the container.
  // Rounded to whole pixels for more precise alignment with grid lines.
  const labelTop = useCallback(
    (yView: number) =>
      Math.round(
        TOP_PAD_PX +
          (yView / chartHeight) * (SVG_HEIGHT_PX - TOP_PAD_PX - BOTTOM_PAD_PX)
      ),
    [chartHeight]
  ); // maps viewBox Y to pixel offset

  const summerRef = useRef<HTMLDivElement>(null);
  const equinoxRef = useRef<HTMLDivElement>(null);
  const winterRef = useRef<HTMLDivElement>(null);
  const [labelPos, setLabelPos] = useState({
    summer: 0,
    equinox: 0,
    winter: 0,
  });

  useLayoutEffect(() => {
    const calculateCenteredTop = (
      y: number,
      ref: React.RefObject<HTMLDivElement>
    ) => labelTop(y) - (ref.current?.offsetHeight ?? 0) / 2;

    setLabelPos({
      summer: calculateCenteredTop(guideY.summer, summerRef),
      equinox: calculateCenteredTop(guideY.equinox, equinoxRef),
      winter: calculateCenteredTop(guideY.winter, winterRef),
    });
  }, [labelTop, guideY.summer, guideY.equinox, guideY.winter]);

  // Month ticks: June start → Sep (autumn) → Dec (winter) → Mar (spring) → next June
  const months = [
    { label: "Jun", idx: 0 },
    { label: "Sep", idx: series.indices.autumn },
    { label: "Dec", idx: series.indices.winter },
    { label: "Mar", idx: series.indices.spring },
    { label: "Jun", idx: total },
  ];

  // Points in viewBox coordinates for the smooth path
  const linePoints: Pt[] = days.map((d, i) => ({ x: i, y: toY(d.daylightHr) }));

  // Catmull-Rom → cubic Bézier (tension=1) for a clean, continuous curve
  const pathD = buildSmoothPath(linePoints);

  // Clamp "now" to [0, total] for safety
  const nowX = Math.min(Math.max(nowIdx, 0), total);
  const nowY = lerpY(nowX); // Y-position where the red line intersects the curve
  const nowPercent = nowX / total;
  const nowLeft = `calc(${LEFT_LABEL_COL_PX}px + ${nowPercent * 100}% - ${(LEFT_LABEL_COL_PX + RIGHT_PAD_PX) * nowPercent}px)`;

  // Palette (aligned with Tide chart tones)
  const COL_BG = "#1B1B2E";
  const COL_GRID = "#646464";
  const COL_LINE = "#FFFF00";
  const COL_NOW = "#FF3B30"; // slightly softer than pure red
  const COL_TEXT = "rgba(255,255,255,0.88)";
  const COL_TEXT_MUTE = "rgba(255,255,255,0.70)";

  // ----- Render -------------------------------------------------------------
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        background: COL_BG,
        color: COL_TEXT,
        fontSize: 9, // Further reduced font size for compact layout
        lineHeight: 1.2,
        padding: `${TOP_PAD_PX}px ${RIGHT_PAD_PX}px ${BOTTOM_PAD_PX}px ${LEFT_LABEL_COL_PX}px`,
        overflow: "visible",
        borderRadius: 12,
      }}
    >
      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${total} ${chartHeight}`}
        width="100%"
        height={SVG_HEIGHT_PX}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Vertical month gridlines */}
        {months.map((m, i) => (
          <line
            key={`v-${i}-${m.idx}`}
            x1={m.idx}
            x2={m.idx}
            y1={0}
            y2={chartHeight}
            stroke={COL_GRID}
            strokeWidth={1.0} // CHANGE: Increased stroke width for better visibility
            strokeDasharray="3 3"
          />
        ))}

        {/* Horizontal guides: Summer / Equinox / Winter */}
        {[guideY.summer, guideY.equinox, guideY.winter].map((y, i) => (
          <line
            key={`h-${i}-${y}`}
            x1={0}
            x2={total}
            y1={y}
            y2={y}
            stroke={COL_GRID}
            strokeWidth={1.0} // CHANGE: Increased stroke width for better visibility
            strokeDasharray="3 3"
          />
        ))}

        {/* Daylight curve (smooth path) */}
        <path
          d={pathD}
          fill="none"
          stroke={COL_LINE}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {/* "Now" vertical marker (dashed) */}
        <line
          x1={nowX}
          x2={nowX}
          y1={0}
          y2={chartHeight}
          stroke={COL_NOW}
          strokeWidth={1.4}
          strokeDasharray="6 6"
        />

        {/* Intersection marker where red line meets yellow curve */}
        <g stroke={COL_NOW} strokeWidth={1.2}>
          <line
            x1={nowX - 2.5}
            y1={nowY - 2.5}
            x2={nowX + 2.5}
            y2={nowY + 2.5}
          />
          <line
            x1={nowX - 2.5}
            y1={nowY + 2.5}
            x2={nowX + 2.5}
            y2={nowY - 2.5}
          />
        </g>
      </svg>

      {/* "Now" label — centered over the red line, above the plot area */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: nowLeft,
          transform: "translate(-50%, 0)",
          color: COL_NOW,
          fontWeight: 700,
          letterSpacing: 0.2,
          textShadow: "0 0 2px rgba(0,0,0,0.35)",
          pointerEvents: "none",
          fontSize: 9, // match overall smaller typography
        }}
      >
        Now
      </div>

      {/* Bottom month labels */}
      <div
        style={{
          position: "absolute",
          left: LEFT_LABEL_COL_PX,
          right: RIGHT_PAD_PX,
          bottom: 2,
          height: 16,
        }}
      >
        {months.map((m, i) => (
          <span
            key={`month-${i}`}
            style={{
              position: "absolute",
              left: `${(m.idx / total) * 100}%`,
              transform: "translateX(-50%)",
              color: COL_TEXT_MUTE,
              fontSize: 9, // further reduced font size
              whiteSpace: "nowrap",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Left-side guide labels (aligned with guide lines) */}
      <div
        ref={summerRef}
        style={{
          position: "absolute",
          left: 0,
          top: labelPos.summer,
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX,
          fontSize: 7,
          lineHeight: 1.1,
          textAlign: "center",
          whiteSpace: "normal",
        }}
      >
        Summer<br />Solstice
      </div>
      <div
        ref={equinoxRef}
        style={{
          position: "absolute",
          left: 0,
          top: labelPos.equinox,
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX,
          fontSize: 7,
          lineHeight: 1.1,
          textAlign: "center",
          whiteSpace: "normal",
        }}
      >
        Equinox
      </div>
      <div
        ref={winterRef}
        style={{
          position: "absolute",
          left: 0,
          top: labelPos.winter,
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX,
          fontSize: 7,
          lineHeight: 1.1,
          textAlign: "center",
          whiteSpace: "normal",
        }}
      >
        Winter<br />Solstice
      </div>
    </div>
  );
};

export default SolarFlow;

/* ---------------------------- helpers ---------------------------- */

/**
 * Converts a sequence of points into a smooth cubic Bézier path using
 * a Catmull–Rom → Bézier conversion. Produces the approved S-curve
 * without jagged polyline segments.
 */
function buildSmoothPath(points: Pt[], tension = 1): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  const path: string[] = [];
  path.push(`M ${points[0].x},${points[0].y}`);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    // Catmull–Rom to Cubic Bézier control points
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path.push(`C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`);
  }

  return path.join(" ");
}