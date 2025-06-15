
import React from 'react';

type LightConditionsProps = {
  sunrise: string;
  sunset: string;
};

const LightConditions: React.FC<LightConditionsProps> = ({ sunrise, sunset }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Light Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Sunrise</p>
          <p className="font-semibold">{sunrise}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sunset</p>
          <p className="font-semibold">{sunset}</p>
        </div>
      </div>
    </div>
  );
};

export default LightConditions;
