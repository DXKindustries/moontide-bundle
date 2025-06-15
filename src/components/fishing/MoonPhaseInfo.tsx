
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { isFullMoon, getMoonEmoji, getFullMoonName } from '@/utils/lunarUtils';

type MoonPhase = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
                 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

type MoonPhaseInfoProps = {
  moonPhase: MoonPhase;
  illumination: number;
  selectedDate: Date;
};

const MoonPhaseInfo: React.FC<MoonPhaseInfoProps> = ({
  moonPhase,
  illumination,
  selectedDate
}) => {
  const getMoonPhaseVisual = (phase: MoonPhase) => {
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
    <div className="flex items-center space-x-6">
      <div className={`w-16 h-16 rounded-full ${getMoonPhaseVisual(moonPhase)}`}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{getMoonEmoji(moonPhase)}</span>
          <h3 className="text-lg font-medium">{moonPhase}</h3>
        </div>
        <p className="text-muted-foreground">Illumination: {illumination}%</p>
        {isFullMoon(moonPhase) && (
          <div className="mt-2">
            {(() => {
              const fullMoonName = getFullMoonName(selectedDate);
              return fullMoonName ? (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-500/30">
                  🌕 {fullMoonName.name}
                </Badge>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoonPhaseInfo;
