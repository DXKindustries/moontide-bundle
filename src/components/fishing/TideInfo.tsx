
import React from 'react';
import { formatIsoToAmPm } from '@/utils/dateTimeUtils';
import { TideCycle } from '@/services/tide/types';
import { safeArray } from '@/utils/safeArray';

type TideInfoProps = {
  cycles: TideCycle[];
};

const TideInfo: React.FC<TideInfoProps> = ({ cycles }) => {
  const list = safeArray(cycles);
  const formatTimeToAMPM = (timeString: string) => formatIsoToAmPm(timeString);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Tide Information</h3>
      <div className="space-y-2">
        {list.length > 0 ? (
          list.map((cycle, i) => (
            <div key={i} className="grid grid-cols-2 text-sm text-muted-foreground">
              <span>
                {(cycle.first.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.first.time)}
              </span>
              <span className="font-semibold text-right">
                {cycle.first.height.toFixed(1)}m
              </span>
              <span>
                {(cycle.second.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.second.time)}
              </span>
              <span className="font-semibold text-right">
                {cycle.second.height.toFixed(1)}m
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tide data available</p>
        )}
      </div>
    </div>
  );
};

export default TideInfo;
