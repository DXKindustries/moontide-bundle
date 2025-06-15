
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isFullMoon } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';
import { format } from 'date-fns';

type CalendarCardProps = {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  weeklyForecast: TideForecast[];
};

const CalendarCard: React.FC<CalendarCardProps> = ({
  selectedDate,
  onSelectDate,
  weeklyForecast
}) => {
  const modifiers = {
    fullMoon: (date: Date) => {
      const dateStr = format(date, 'MMM d');
      const forecast = weeklyForecast.find(f => f.date === dateStr);
      return forecast ? isFullMoon(forecast.moonPhase) : false;
    },
    newMoon: (date: Date) => {
      const dateStr = format(date, 'MMM d');
      const forecast = weeklyForecast.find(f => f.date === dateStr);
      return forecast ? forecast.moonPhase === 'New Moon' : false;
    },
    solarEvent: (date: Date) => {
      return getSolarEvents(date) !== null;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Fishing Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={{
            fullMoon: "bg-yellow-400/20 text-yellow-100",
            newMoon: "bg-gray-600/20 text-gray-100", 
            solarEvent: "bg-orange-400/20 text-orange-100"
          }}
          footer={
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs text-muted-foreground">Full Moon</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-xs text-muted-foreground">New Moon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-xs text-muted-foreground">Solar Event</span>
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CalendarCard;
