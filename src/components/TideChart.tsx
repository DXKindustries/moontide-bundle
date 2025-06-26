
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
  curve: TidePoint[]; // continuous six-minute data
  events: TidePoint[]; // high/low tide events
  date: string;
  currentTime?: string;
  isLoading?: boolean;
  className?: string;
};


const formatTimeToAMPM = (time: string | number) => {
  const date = new Date(time);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const TideChart = ({
  curve,
  events,
  date,
  currentTime,
  isLoading = false,
  className
}: TideChartProps) => {
  const today = new Date(date + 'T00:00:00');
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const allPoints = (curve || [])
    .map((tp) => ({ ...tp, ts: new Date(tp.time).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  const rawTodayData = allPoints.filter(p => p.ts >= startOfDay.getTime() && p.ts < endOfDay.getTime());

  const prevPoint = allPoints.filter(p => p.ts < startOfDay.getTime()).slice(-1)[0];
  const nextPoint = allPoints.find(p => p.ts >= endOfDay.getTime());

  const chartData = [...rawTodayData];
  if (prevPoint) chartData.unshift(prevPoint);
  if (nextPoint) chartData.push(nextPoint);

  // We already receive only high/low events, so just separate them
  const eventPoints = (events || [])
    .map((tp) => ({ ...tp, ts: new Date(tp.time).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  const todayEvents = eventPoints.filter(p => p.ts >= startOfDay.getTime() && p.ts < endOfDay.getTime());
  const highTides = todayEvents.filter(tp => tp.isHighTide).slice(0, 2);
  const lowTides = todayEvents.filter(tp => tp.isHighTide === false).slice(0, 2);

  const parseCurrentTime = (timeStr: string | undefined) => {
    if (!timeStr) return null;
    const [timePart, period] = timeStr.split(' ');
    if (!timePart || !period) return null;
    const [hStr, mStr] = timePart.split(':');
    let hours = Number(hStr);
    const minutes = Number(mStr);
    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const d = new Date(startOfDay);
    d.setHours(hours, minutes, 0, 0);
    return d.getTime();
  };

  const currentTs = parseCurrentTime(currentTime);

  const currentTimeIndex =
    currentTs != null ? chartData.findIndex(p => p.ts >= currentTs) : Math.floor(chartData.length / 2);

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
        ) : rawTodayData.length === 0 ? (
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
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={[startOfDay.getTime(), endOfDay.getTime()]}
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
                    x={chartData[currentTimeIndex]?.ts}
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

        {!isLoading && rawTodayData.length > 0 && (
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
