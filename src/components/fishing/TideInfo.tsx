
import React from 'react';

type TideInfoProps = {
  tides: {
    highTide: { time: string, height: number }[];
    lowTide: { time: string, height: number }[];
  };
};

const TideInfo: React.FC<TideInfoProps> = ({ tides }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Tide Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">High Tides</h4>
          {tides.highTide.length > 0 ? (
            tides.highTide.map((tide, i) => (
              <div key={`high-${i}`} className="flex justify-between">
                <span>{tide.time}</span>
                <span className="font-semibold">{tide.height.toFixed(1)}m</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No high tide data available</p>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Low Tides</h4>
          {tides.lowTide.length > 0 ? (
            tides.lowTide.map((tide, i) => (
              <div key={`low-${i}`} className="flex justify-between">
                <span>{tide.time}</span>
                <span className="font-semibold">{tide.height.toFixed(1)}m</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No low tide data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TideInfo;
