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

  // If data is empty, render nothing to prevent a crash.
  if (!days || days.length === 0) {
    return null;
  }

  const total = days.length;

  // Index of today's day in the shifted array
  const nowIdx = getCurrentDayIndexJuneShifted(series, date);

  // <<< CRITICAL BLANK SCREEN FIX >>>
  // Ensure nowIdx is within the valid bounds of the 'days' array to prevent
  // 'undefined' access, which would cause a runtime crash.
  const safeNowIdx = Math.min(Math.max(nowIdx, 0), total - 1);

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

  // Calculate Y position of the "X" marker on the curve using the safe index.
  const nowYCurve = toY(days[safeNowIdx].daylightHr);
  // <<< END CRITICAL BLANK SCREEN FIX >>>

  // ----- Geometry / layout --------------------------------------------------
  const SVG_HEIGHT_PX = 200; // Increased height for more vertical space
  const TOP_PAD_PX = 36; // Increased top padding for "Now" label to float above
  const BOTTOM_PAD_PX = 28; // Increased bottom padding for month labels
  const LEFT_LABEL_COL_PX = 96; // Adjusted width for stacked labels
  const RIGHT_PAD_PX = 8;

  // Helper maps a Y in viewBox space → pixel offset within the container.
  const labelTop = (yView: number) =>
    TOP_PAD_PX + (yView / chartHeight) * (SVG_HEIGHT_PX - TOP_PAD_PX - BOTTOM_PAD_PX);

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

  // Palette (aligned with Tide chart tones)
  const COL_BG = "#1B1B2E";
  const COL_GRID = "#646464";
  const COL_LINE = "#FFFF00";
  const COL_NOW = "#FF3B30"; // slightly softer than pure red
  const COL_TEXT = "rgba(255,255,255,0.92)"; // Slightly brighter text
  const COL_TEXT_MUTE = "rgba(255,255,255,0.60)"; // Slightly more muted for secondary labels

  // ----- Render -------------------------------------------------------------
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        background: COL_BG,
        color: COL_TEXT,
        fontSize: 10, // Reduced base font size for the container
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
            strokeWidth={1.0} // Increased stroke width for better visibility
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
            strokeWidth={1.0} // Increased stroke width for better visibility
            strokeDasharray="3 3"
          />
        ))}

        {/* Daylight curve (smooth path) */}
        <path
          d={pathD}
          fill="none"
          stroke={COL_LINE}
          strokeWidth={1.4} // Reduced stroke width for a cleaner, thinner line
          vectorEffect="non-scaling-stroke"
        />

        {/* "Now" vertical marker (dashed) */}
        <line
          x1={safeNowIdx} // Use safeNowIdx for the line's position
          x2={safeNowIdx} // Use safeNowIdx for the line's position
          y1={0}
          y2={chartHeight}
          stroke={COL_NOW}
          strokeWidth={1.4}
          strokeDasharray="6 6"
        />

        {/* "X" marker at intersection of "Now" line and curve */}
        <text
          x={safeNowIdx} // Use safeNowIdx for the text's x position
          y={nowYCurve}
          fill={COL_NOW}
          textAnchor="middle" // Center the 'x' horizontally
          dominantBaseline="middle" // Center the 'x' vertically
          fontSize="10" // Smaller font for 'x'
          fontWeight="bold"
          pointerEvents="none"
        >
          X
        </text>
      </svg>

      {/* "Now" label — centered over the red line, above the plot area */}
      <div
        style={{
          position: "absolute",
          top: 8, // Adjusted top for better floating appearance
          left: `calc(${LEFT_LABEL_COL_PX}px + ${(safeNowIdx / total) * 100}%)`, // Use safeNowIdx
          transform: "translate(-50%, 0)",
          color: COL_NOW,
          fontWeight: 700,
          letterSpacing: 0.2,
          textShadow: "0 0 2px rgba(0,0,0,0.35)",
          pointerEvents: "none",
          fontSize: 10, // Matching chart labels
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
          bottom: 8, // Adjusted bottom for better alignment
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
              fontSize: 10, // Reduced font size for better mobile display
              whiteSpace: "nowrap",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Left-side guide labels (aligned with guide lines) */}
      {/* Positioned using absolute `top` based on `labelTop` helper, with reduced font size */}
      <div
        style={{
          position: "absolute",
          left: 10, // Reduced left padding
          top: labelTop(guideY.summer),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          fontSize: 10, // Reduced font size
          lineHeight: 1.1, // Adjusted line height for stacking
          whiteSpace: "nowrap",
          textAlign: "right", // Align text to the right for a cleaner look next to the chart
        }}
      >
        Summer Solstice (max)
      </div>
      <div
        style={{
          position: "absolute",
          left: 10, // Reduced left padding
          top: labelTop(guideY.equinox),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          fontSize: 10, // Reduced font size
          lineHeight: 1.1, // Adjusted line height for stacking
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        Equinox (~12h)
      </div>
      <div
        style={{
          position: "absolute",
          left: 10, // Reduced left padding
          top: labelTop(guideY.winter),
          transform: "translateY(-50%)",
          color: COL_TEXT_MUTE,
          fontSize: 10, // Reduced font size
          lineHeight: 1.1, // Adjusted line height for stacking
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        Winter Solstice (min)
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
