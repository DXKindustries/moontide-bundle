
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
import { TidePoint, TideCycle } from '@/services/tide/types';
import LocationDisplay from './LocationDisplay';
import { SavedLocation } from './LocationSelector';
import { formatIsoToAmPm, parseIsoAsLocal, formatDateTimeAsLocalIso } from '@/utils/dateTimeUtils';
import { debugLog } from '@/utils/debugLogger';

type TideChartProps = {
  curve: TidePoint[]; // continuous six-minute data
  events: TidePoint[]; // high/low tide events
  date: string;
  currentTime?: string;
  isLoading?: boolean;
  className?: string;
  currentLocation?: (SavedLocation & { id: string; country: string }) | null;
  stationName?: string | null;
  stationId?: string | null;
};


// NOAA prediction times omit timezone information and are already in the
// station's local time. Using `toISOString()` converts the timestamp to UTC,
// causing hover tooltips to be offset from the chart. Format using the local
// time components instead.
const formatTimeToAMPM = (time: string | number) =>
  typeof time === 'number'
    ? formatIsoToAmPm(formatDateTimeAsLocalIso(new Date(time)))
    : formatIsoToAmPm(String(time));

const TideChart = ({
  curve,
  events,
  date,
  currentTime,
  isLoading = false,
  className,
  currentLocation,
  stationName,
  stationId
}: TideChartProps) => {
  debugLog('TideChart render', { curvePoints: curve.length, eventCount: events.length, stationId });
  const today = new Date(date + 'T00:00:00');
  if (isNaN(today.getTime())) {
    const fallback = new Date(date);
    if (!isNaN(fallback.getTime())) today.setTime(fallback.getTime());
  }
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfRange = new Date(startOfDay);
  endOfRange.setHours(endOfRange.getHours() + 30);

  const tickValues: number[] = [];
  for (let h = 0; h <= 30; h += 6) {
    const d = new Date(startOfDay);
    d.setHours(h, 0, 0, 0);
    tickValues.push(d.getTime());
  }

  const allPoints = (curve || [])
    .map((tp) => ({ ...tp, ts: parseIsoAsLocal(tp.time).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  const rawTodayData = allPoints.filter(
    (p) => p.ts >= startOfDay.getTime() && p.ts < endOfRange.getTime()
  );

  const prevPoint = allPoints.filter(p => p.ts < startOfDay.getTime()).slice(-1)[0];
  const nextPoint = allPoints.find((p) => p.ts >= endOfRange.getTime());

  const chartData = [...rawTodayData];
  if (prevPoint) chartData.unshift(prevPoint);
  if (nextPoint) chartData.push(nextPoint);

  // Build tide cycles for the day using the new TideCycle shape
  const eventPoints = (events || [])
    .map((tp) => ({ ...tp, ts: parseIsoAsLocal(tp.time).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  const todayEvents = eventPoints.filter(
    (p) => p.ts >= startOfDay.getTime() && p.ts < endOfRange.getTime()
  );

  const dayCycles: TideCycle[] = [];
  let prevEvent: TidePoint | null = null;
  todayEvents.forEach((e) => {
    if (prevEvent) {
      dayCycles.push({
        first: {
          time: prevEvent.time,
          height: prevEvent.height,
          isHigh: prevEvent.isHighTide === true,
        },
        second: {
          time: e.time,
          height: e.height,
          isHigh: e.isHighTide === true,
        },
      });
      prevEvent = null;
    } else {
      prevEvent = e;
    }
  });

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

  interface TooltipPayload {
    value: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
        <LocationDisplay
          currentLocation={currentLocation || null}
          stationName={stationName || null}
          stationId={stationId || null}
        />
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
              Enter a coastal location to see tide predictions
            </p>
          </div>
        ) : (
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 40, right: 5, left: -20, bottom: 0 }}>
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
                  domain={[startOfDay.getTime(), endOfRange.getTime()]}
                  tickFormatter={(t) =>
                    formatIsoToAmPm(formatDateTimeAsLocalIso(new Date(t)))
                  }
                  ticks={tickValues}
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
                <Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{
                    left: '50%',
                    transform: 'translate(-50%, -100%)',
                    top: 0,
                  }}
                />
                <ReferenceLine
                  x={startOfDay.getTime()}
                  stroke="#f87171"
                  strokeWidth={1}
                />
                <ReferenceLine
                  x={new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).getTime()}
                  stroke="#f87171"
                  strokeWidth={1}
                />
                {currentTs != null && (
                  <ReferenceLine
                    x={currentTs}
                    stroke="#9b87f5"
                    strokeWidth={2}
                    y1="5%"
                    y2="100%"
                    label={{ value: 'Now', position: 'top', fill: '#9b87f5' }}
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
          <div className="space-y-2 mt-4">
            {dayCycles.map((cycle, i) => (
              <div key={i} className="grid grid-cols-2 text-sm text-muted-foreground">
                <span>
                  {(cycle.first.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.first.time)}
                </span>
                <span className="font-semibold text-right">
                  {cycle.first.height.toFixed(2)} ft
                </span>
                <span>
                  {(cycle.second.isHigh ? 'High' : 'Low')} {formatTimeToAMPM(cycle.second.time)}
                </span>
                <span className="font-semibold text-right">
                  {cycle.second.height.toFixed(2)} ft
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TideChart;
