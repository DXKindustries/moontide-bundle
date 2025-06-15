
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isDateFullMoon, isDateNewMoon } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';

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
      const isFullMoon = isDateFullMoon(date);
      if (isFullMoon) {
        console.log(`✨ FULL MOON detected for ${date.toDateString()}`);
      }
      return isFullMoon;
    },
    newMoon: (date: Date) => {
      const isNewMoon = isDateNewMoon(date);
      if (isNewMoon) {
        console.log(`🌑 NEW MOON detected for ${date.toDateString()}`);
      }
      return isNewMoon;
    },
    solarEvent: (date: Date) => {
      const solarEvent = getSolarEvents(date);
      const hasSolarEvent = solarEvent !== null;
      if (hasSolarEvent) {
        console.log(`☀️ SOLAR EVENT detected for ${date.toDateString()}: ${solarEvent.name}`);
      }
      return hasSolarEvent;
    }
  };

  const modifiersClassNames = {
    fullMoon: "calendar-full-moon",
    newMoon: "calendar-new-moon", 
    solarEvent: "calendar-solar-event"
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          footer={
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs text-muted-foreground">Full Moon</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-xs text-muted-foreground">New Moon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
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
