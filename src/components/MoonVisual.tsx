
import React from 'react';

type MoonVisualProps = {
  phase: string;
  illumination: number;
};

const MoonVisual = ({ phase, illumination }: MoonVisualProps) => {
  console.log('🌙 MoonVisual received:', { phase, illumination });

  // Calculate visual representation of moon phase with original purple/blue color scheme
  const getMoonPhaseVisual = () => {
    switch (phase) {
      case "New Moon":
        return "bg-moon-dark border-2 border-moon-primary";
      case "Waxing Crescent":
        return "bg-gradient-to-r from-moon-primary to-moon-dark";
      case "First Quarter":
        return "bg-gradient-to-r from-moon-primary to-moon-dark";
      case "Waxing Gibbous":
        return "bg-gradient-to-r from-moon-primary via-moon-secondary to-moon-dark";
      case "Full Moon":
        return "bg-gradient-to-br from-moon-primary via-moon-secondary to-moon-blue shadow-moon-primary/50";
      case "Waning Gibbous":
        return "bg-gradient-to-l from-moon-primary via-moon-secondary to-moon-dark";
      case "Last Quarter":
        return "bg-gradient-to-l from-moon-primary to-moon-dark";
      case "Waning Crescent":
        return "bg-gradient-to-l from-moon-primary via-moon-secondary to-moon-dark";
      default:
        return "bg-gradient-to-br from-moon-primary via-moon-secondary to-moon-blue";
    }
  };

  return (
    <div className="relative">
      <div className={`w-36 h-36 rounded-full animate-pulse shadow-lg ${getMoonPhaseVisual()}`}></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 bg-gradient-to-t from-moon-primary/20 to-transparent w-24 h-12 blur-md rounded-full"></div>
    </div>
  );
};

export default MoonVisual;
