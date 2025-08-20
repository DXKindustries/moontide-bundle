import React from "react";
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
  const SVG_HEIGHT_PX = 160;
  const TOP_PAD_PX = 32; // Increased top padding so "Now" label can float above chart
  const BOTTOM_PAD_PX = 18; // CHANGE: Reduced bottom padding
  const LEFT_LABEL_COL_PX = 80; // CHANGE: Reduced label column width
  const RIGHT_PAD_PX = 8;

  // Helper maps a Y in viewBox space → pixel offset within the container.
  const labelTop = (yView: number) =>
    TOP_PAD_PX + (yView / chartHeight) * (SVG_HEIGHT_PX - TOP_PAD_PX - BOTTOM_PAD_PX); // CHANGE: Corrected math to account for padding

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
        fontSize: 10, // CHANGE: Reduced font size for better mobile display
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
          strokeWidth={1.4} // CHANGE: Reduced stroke width for a cleaner, thinner line
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
      </svg>

      {/* Intersection marker where red line meets yellow curve */}
      <div
        style={{
          position: "absolute",
          top: labelTop(nowY),
          left: `calc(${LEFT_LABEL_COL_PX}px + ${(nowX / total) * 100}%)`,
          transform: "translate(-50%, -50%)",
          color: COL_NOW,
          pointerEvents: "none",
          fontSize: 12,
        }}
      >
        ×
      </div>

      {/* "Now" label — centered over the red line, above the plot area */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: `calc(${LEFT_LABEL_COL_PX}px + ${(nowX / total) * 100}%)`,
          transform: "translate(-50%, 0)",
          color: COL_NOW,
          fontWeight: 700,
          letterSpacing: 0.2,
          textShadow: "0 0 2px rgba(0,0,0,0.35)",
          pointerEvents: "none",
          fontSize: 10, // CHANGE: Reduced font size to match chart labels
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
              fontSize: 10, // CHANGE: Reduced font size for better mobile display
              whiteSpace: "nowrap",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Left-side guide labels (aligned with guide lines) */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: labelTop(guideY.summer),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX - 8,
          fontSize: 8,
          lineHeight: 1.1,
          textAlign: "left",
          whiteSpace: "normal",
        }}
      >
        Summer<br />Solstice<br />(max)
      </div>
      <div
        style={{
          position: "absolute",
          left: 4,
          top: labelTop(guideY.equinox),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX - 8,
          fontSize: 8,
          lineHeight: 1.1,
          textAlign: "left",
          whiteSpace: "normal",
        }}
      >
        Equinox<br />(~12h)
      </div>
      <div
        style={{
          position: "absolute",
          left: 4,
          top: labelTop(guideY.winter),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          width: LEFT_LABEL_COL_PX - 8,
          fontSize: 8,
          lineHeight: 1.1,
          textAlign: "left",
          whiteSpace: "normal",
        }}
      >
        Winter<br />Solstice<br />(min)
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