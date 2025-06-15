
import React from 'react';

type MoonVisualProps = {
  phase: string;
  illumination: number;
};

const MoonVisual = ({ phase, illumination }: MoonVisualProps) => {
  console.log('🌙 MoonVisual received:', { phase, illumination });

  // Calculate visual representation of moon phase with simplified Tailwind classes
  const getMoonPhaseVisual = () => {
    switch (phase) {
      case "New Moon":
        return "bg-gray-900 border-2 border-gray-400";
      case "Waxing Crescent":
        return "bg-gradient-to-r from-yellow-200 via-yellow-300 to-gray-900";
      case "First Quarter":
        return "bg-gradient-to-r from-yellow-200 to-gray-900";
      case "Waxing Gibbous":
        return "bg-gradient-to-r from-yellow-200 via-yellow-300 to-gray-800";
      case "Full Moon":
        return "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 shadow-yellow-400/50";
      case "Waning Gibbous":
        return "bg-gradient-to-l from-yellow-200 via-yellow-300 to-gray-800";
      case "Last Quarter":
        return "bg-gradient-to-l from-yellow-200 to-gray-900";
      case "Waning Crescent":
        return "bg-gradient-to-l from-yellow-200 via-yellow-300 to-gray-900";
      default:
        return "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400";
    }
  };

  return (
    <div className="relative">
      <div className={`w-36 h-36 rounded-full animate-pulse shadow-lg ${getMoonPhaseVisual()}`}></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 bg-gradient-to-t from-yellow-200/20 to-transparent w-24 h-12 blur-md rounded-full"></div>
    </div>
  );
};

export default MoonVisual;
