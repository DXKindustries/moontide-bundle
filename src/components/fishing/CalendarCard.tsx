import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isDateFullMoon, isDateNewMoon } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';
import { DayPickerDayProps } from 'react-day-picker';

// Single dot indicator color for full moon
const FULL_MOON_DOT_COLOR = "bg-yellow-400";

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
  // Custom day renderer for full moon dots
  const renderDay = (date: Date, dayProps: DayPickerDayProps) => {
    const isFullMoon = isDateFullMoon(date);
    // Use default day button styles
    return (
      <div className="relative flex flex-col items-center">
        <span
          className={
            [
              "z-10",
              dayProps.selected ? "font-bold text-primary" : "",
              dayProps.today ? "border border-accent rounded-full" : "",
              dayProps.disabled ? "text-muted-foreground opacity-50" : ""
            ].join(" ")
          }
        >
          {date.getDate()}
        </span>
        {isFullMoon && (
          <span
            className={`w-1.5 h-1.5 mt-0.5 rounded-full ${FULL_MOON_DOT_COLOR}`}
            data-testid="full-moon-dot"
            title="Full Moon"
          />
        )}
      </div>
    );
  };

  // Other modifiers can remain for now (may update new moon/solar later)
  const modifiers = {
    fullMoon: (date: Date) => {
      // Only show full moon on the 15th of each month for simplicity
      const isFullMoon = date.getDate() === 15;
      if (isFullMoon) {
        console.log(`✨ FULL MOON detected for ${date.toDateString()}`);
      }
      return isFullMoon;
    },
    newMoon: (date: Date) => {
      // Only show new moon on the 1st of each month for simplicity
      const isNewMoon = date.getDate() === 1;
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
          renderDay={renderDay}
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
