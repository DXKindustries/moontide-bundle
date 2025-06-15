
import React from 'react';
import { Badge } from "@/components/ui/badge";

type FishingWindow = {
  start: string;
  end: string;
  quality: 'excellent' | 'good' | 'fair';
  reason: string;
};

type FishingWindowsProps = {
  windows: FishingWindow[];
};

const FishingWindows: React.FC<FishingWindowsProps> = ({ windows }) => {
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
      <h3 className="text-lg font-medium mb-2">Optimal Fishing Windows</h3>
      {windows.length > 0 ? (
        <div className="space-y-3">
          {windows.map((window, idx) => (
            <div key={idx} className="p-3 rounded-md bg-muted/30 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <span className="font-medium">{formatTimeToAMPM(window.start)} - {formatTimeToAMPM(window.end)}</span>
                <Badge variant={
                  window.quality === 'excellent' ? 'default' :
                  window.quality === 'good' ? 'secondary' : 'outline'
                }>
                  {window.quality.charAt(0).toUpperCase() + window.quality.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{window.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">No optimal fishing windows for this day.</p>
      )}
    </div>
  );
};

export default FishingWindows;
