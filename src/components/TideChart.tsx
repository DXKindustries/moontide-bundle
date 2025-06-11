import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { Loader2, Info } from "lucide-react";

type TidePoint = {
  time: string;
  height: number;
  isHighTide: boolean;
  type?: "H" | "L";
};

type TideChartProps = {
  data: TidePoint[];
  date: string;
  currentTime?: string;
  isLoading?: boolean;
  className?: string;
};

const TideChart = ({
  data,
  date,
  currentTime,
  isLoading = false,
  className
}: TideChartProps) => {
  // Hybrid logic for safety
  const highTides = data.filter(point =>
    point.type === "H" || (point.type === undefined && point.isHighTide)
  );

  const lowTides = data.filter(point =>
    point.type === "L" || (point.type === undefined && !point.isHighTide)
  );

  const chartData = data.map(point => ({
    ...point,
    timeFormatted: point.time.split("T")[1]?.slice(0, 5) || point.time
  }));

  const formatTime = (time: string) => {
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatHeight = (height: number) => `${height.toFixed(2)}m`;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          Tide Chart for {date}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeFormatted" />
                <YAxis
                  label={{
                    value: "Height (ft)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5
                  }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="height"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                {highTides.map((point, index) => (
                  <ReferenceLine
                    key={`high-${index}`}
                    x={point.timeFormatted}
                    stroke="green"
                    strokeDasharray="3 3"
                    label={{
                      value: "High",
                      position: "top",
                      fill: "green",
                      fontSize: 12
                    }}
                  />
                ))}
                {lowTides.map((point, index) => (
                  <ReferenceLine
                    key={`low-${index}`}
                    x={point.timeFormatted}
                    stroke="red"
                    strokeDasharray="3 3"
                    label={{
                      value: "Low",
                      position: "bottom",
                      fill: "red",
                      fontSize: 12
                    }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">High Tides</h4>
                <ul className="text-sm text-muted-foreground mt-1">
                  {highTides.map((point, index) => (
                    <li key={`high-list-${index}`}>
                      {formatTime(point.time)} – {formatHeight(point.height)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Low Tides</h4>
                <ul className="text-sm text-muted-foreground mt-1">
                  {lowTides.map((point, index) => (
                    <li key={`low-list-${index}`}>
                      {formatTime(point.time)} – {formatHeight(point.height)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TideChart;
