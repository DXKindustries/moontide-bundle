
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { Loader2, Info } from "lucide-react";

type TidePoint = {
  time: string;
  height: number;
  isHighTide: boolean;
  type?: "H" | "L"; // Add NOAA tide type indicator
}

type TideChartProps = {
  data: TidePoint[];
  date: string;
  currentTime?: string;
  isLoading?: boolean;
  className?: string;
}

const TideChart = ({ data, date, currentTime, isLoading = false, className }: TideChartProps) => {
  // Extract high and low tides based on the type property from NOAA API
  // Falls back to the isHighTide property for compatibility with existing data
  const highTides = data.filter(point => 
    point.type === "H" || (point.type === undefined && point.isHighTide)
  ).slice(0, 2);
  
  const lowTides = data.filter(point => 
    point.type === "L" || (point.type === undefined && !point.isHighTide)
  ).slice(0, 2);
  
  // Find current time index for reference line
  const currentTimeIndex = currentTime ? 
    data.findIndex(point => point.time === currentTime) : 
    Math.floor(data.length / 3); // Default to 1/3 through the day if no time provided

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Determine tide type based on NOAA type or fallback to height-based logic
      const tideType = payload[0].payload.type || (payload[0].payload.isHighTide ? 'High Tide' : '');
      
      return (
        <div className="bg-card p-2 rounded shadow text-sm">
          <p className="font-bold">{`${label}`}</p>
          <p className="text-moon-primary">
            {`Height: ${payload[0].value.toFixed(2)}m`}
          </p>
          <p className="text-xs text-muted-foreground">
            {tideType === 'H' ? 'High Tide' : tideType === 'L' ? 'Low Tide' : tideType}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-md", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Tide Forecast</span>
          <span className="text-moon-blue text-sm">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-moon-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <Info className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground font-medium">No tide data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              There might be an issue connecting to the NOAA API. 
              Try refreshing the page or selecting a different location.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="time" 
                  tick={{fill: '#cbd5e1', fontSize: 12}}
                  axisLine={{stroke: '#475569'}}
                />
                <YAxis 
                  tick={{fill: '#cbd5e1', fontSize: 12}}
                  axisLine={{stroke: '#475569'}}
                  label={{ 
                    value: 'Height (m)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#cbd5e1', fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                {currentTimeIndex >= 0 && (
                  <ReferenceLine 
                    x={data[currentTimeIndex]?.time || data[0]?.time} 
                    stroke="#9b87f5" 
                    strokeWidth={2}
                    label={{
                      value: "Now",
                      position: "top",
                      fill: "#9b87f5"
                    }}
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="height" 
                  stroke="#0EA5E9" 
                  fill="url(#tideGradient)" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">High Tides</h4>
              {highTides.map((tide, i) => (
                <div key={`high-${i}`} className="flex justify-between">
                  <span>{tide.time}</span>
                  <span className="font-semibold">{tide.height.toFixed(2)}m</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Low Tides</h4>
              {lowTides.map((tide, i) => (
                <div key={`low-${i}`} className="flex justify-between">
                  <span>{tide.time}</span>
                  <span className="font-semibold">{tide.height.toFixed(2)}m</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TideChart;
