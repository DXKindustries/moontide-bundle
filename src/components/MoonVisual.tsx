
import React from 'react';

type MoonVisualProps = {
  phase: string;
  illumination: number;
};

const MoonVisual = ({ phase, illumination }: MoonVisualProps) => {
  // Calculate visual representation of moon phase
  const getMoonPhaseVisual = () => {
    switch (phase) {
      case "New Moon":
        return "bg-moon-dark border-2 border-moon-primary";
      case "Waxing Crescent":
        return "bg-gradient-to-r from-moon-primary to-moon-dark";
      case "First Quarter":
        return "bg-gradient-to-r from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waxing Gibbous":
        return "bg-gradient-to-l from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Full Moon":
        return "moon-gradient";
      case "Waning Gibbous":
        return "bg-gradient-to-r from-moon-dark to-moon-primary [clip-path:inset(0_0_0_25%)]";
      case "Last Quarter":
        return "bg-gradient-to-l from-moon-primary to-moon-dark [clip-path:inset(0_0_0_50%)]";
      case "Waning Crescent":
        return "bg-gradient-to-l from-moon-primary to-moon-dark";
      default:
        return "moon-gradient";
    }
  };

  return (
    <div className="relative">
      <div className={`w-36 h-36 rounded-full animate-float shadow-lg ${getMoonPhaseVisual()}`}></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 bg-gradient-to-t from-moon-primary/20 to-transparent w-24 h-12 blur-md rounded-full"></div>
    </div>
  );
};

export default MoonVisual;
