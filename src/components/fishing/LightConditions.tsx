
import React from 'react';

type LightConditionsProps = {
  sunrise: string;
  sunset: string;
};

const LightConditions: React.FC<LightConditionsProps> = ({ sunrise, sunset }) => {
  const formatTimeToAMPM = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Light Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Sunrise</p>
          <p className="font-semibold">{formatTimeToAMPM(sunrise)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sunset</p>
          <p className="font-semibold">{formatTimeToAMPM(sunset)}</p>
        </div>
      </div>
    </div>
  );
};

export default LightConditions;
