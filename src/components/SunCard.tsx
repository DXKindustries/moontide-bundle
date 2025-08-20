import React from "react";
import SolarFlow from "./SolarFlow";
import SolarInfo from "./SolarInfo";
import { calculateSolarTimes } from "@/utils/solarUtils";

interface SunCardProps {
  lat: number;
  lng: number;
  date: Date;
  /** Optional ZIP code to show in the info block */
  zipCode?: string;
}

/**
 * SunCard
 * Displays metadata (e.g., sunrise/sunset etc.) and the SolarFlow chart.
 * Layout matches other cards (rounded, padded, dark surface).
 */
const SunCard: React.FC<SunCardProps> = ({ lat, lng, date, zipCode }) => {
  // Calculate sunrise/sunset and daylight metrics for the info block
  const solarTimes = React.useMemo(
    () => calculateSolarTimes(date, lat, lng),
    [date, lat, lng]
  );

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
            fontSize: 20,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            marginBottom: 2,
          }}
        >
          SolarFlow
        </div>
      </div>

      {/* Sunrise/Sunset data block */}
      <div style={{ padding: "0 8px 12px 8px" }}>
        <SolarInfo solarTimes={solarTimes} zipCode={zipCode} />
      </div>

      {/* Chart */}
      <div style={{ padding: "0 4px 2px 4px" }}>
        <SolarFlow lat={lat} lng={lng} date={date} />
      </div>
    </div>
  );
};

export default SunCard;
