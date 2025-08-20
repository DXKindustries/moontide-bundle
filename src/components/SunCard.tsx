import React from "react";
import SolarFlow from "./SolarFlow";

interface SunCardProps {
  lat: number;
  lng: number;
  date: Date;
  zipText?: string; // optional label line like "ZIP 01475"
}

/**
 * SunCard
 * Displays metadata (e.g., ZIP, sunrise/sunset etc. if you add it) and the SolarFlow chart.
 * Layout matches other cards (rounded, padded, dark surface).
 */
const SunCard: React.FC<SunCardProps> = ({ lat, lng, date, zipText }) => {
  return (
    <div
      style={{
        background: "#23233A",
        borderRadius: 16,
        padding: "14px 12px 12px 12px",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <div style={{ padding: "2px 8px 10px 8px" }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            marginBottom: 2,
          }}
        >
          Solar Flow
        </div>
        {zipText ? (
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 6,
            }}
          >
            {zipText}
          </div>
        ) : null}
      </div>

      {/* Chart */}
      <div style={{ padding: "0 4px 2px 4px" }}>
        <SolarFlow lat={lat} lng={lng} date={date} />
      </div>
    </div>
  );
};

export default SunCard;
