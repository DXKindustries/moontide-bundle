
import React from 'react';

type MoonDataProps = {
  illumination: number;
  moonrise: string;
  moonset: string;
};

const MoonData = ({ illumination, moonrise, moonset }: MoonDataProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Illumination</p>
        <p className="text-lg font-semibold text-moon-primary">{illumination}%</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Moonrise</p>
        <p className="text-lg font-semibold">{moonrise}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Moonset</p>
        <p className="text-lg font-semibold">{moonset}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Next Phase</p>
        <p className="text-lg font-semibold">In 3 days</p>
      </div>
    </div>
  );
};

export default MoonData;
