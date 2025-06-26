
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { TidePoint } from '@/services/tide/types';

type TideChartProps = {
  data: TidePoint[];
  date: string;
  currentTime?: string;
  isLoading?: boolean;
  className?: string;
};


const formatTimeToAMPM = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const TideChart = ({
  data,
  date,
  currentTime,
  isLoading = false,
  className
}: TideChartProps) => {
  const today = new Date().toISOString().slice(0, 10);

  const todayData = (data || []).filter(point =>
    typeof point.time === "string" && point.time.slice(0, 10) === today
  );

  // We already receive only high/low events, so just separate them
  const highTides = todayData.filter(tp => tp.isHighTide).slice(0, 2);
  const lowTides = todayData.filter(tp => tp.isHighTide === false).slice(0, 2);

  const currentTimeIndex = currentTime
    ? todayData.findIndex(p => p.time === currentTime)
    : Math.floor(todayData.length / 2);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 rounded shadow text-sm">
          <p className="font-bold">{formatTimeToAMPM(label)}</p>
          <p className="text-moon-primary">
            Height: {payload[0].value.toFixed(2)} ft
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
        ) : todayData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium mb-2">
              Inland Location
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              This appears to be an inland area where tides are not relevant.
            </p>
            <p className="text-xs text-muted-foreground opacity-75">
              Enter a coastal ZIP code to see tide predictions
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={todayData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => {
                    const date = new Date(t);
                    return date.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    });
                  }}
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                  label={{
                    value: 'Height (ft)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#cbd5e1', fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                {currentTimeIndex >= 0 && (
                  <ReferenceLine
                    x={todayData[currentTimeIndex]?.time}
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

        {!isLoading && todayData.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Low Tides</h4>
              {lowTides.map((tide, i) => (
                <div key={`low-${i}`} className="grid grid-cols-2 text-sm text-muted-foreground">
                  <span>{formatTimeToAMPM(tide.time)}</span>
                  <span className="font-semibold text-right">
                    {tide.height.toFixed(2)} ft
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">High Tides</h4>
              {highTides.map((tide, i) => (
                <div key={`high-${i}`} className="grid grid-cols-2 text-sm text-muted-foreground">
                  <span>{formatTimeToAMPM(tide.time)}</span>
                  <span className="font-semibold text-right">
                    {tide.height.toFixed(2)} ft
                  </span>
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
