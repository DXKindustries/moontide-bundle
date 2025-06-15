
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isDateFullMoon, isDateNewMoon } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';

// Tailwind for yellow dot: we'll use after: for the dot
// Add this in the calendar classnames (see below)

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

  // Define modifiers for full moon, new moon, and solar events
  const modifiers = {
    fullMoon: (date: Date) => isDateFullMoon(date),
    newMoon: (date: Date) => isDateNewMoon(date),
    solarEvent: (date: Date) => getSolarEvents(date) !== null
  };

  // Class names for modifier states
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
        <style>{`
          /* Add a yellow dot for full moon */
          .calendar-full-moon button {
            position: relative;
          }
          .calendar-full-moon button::after {
            content: '';
            display: block;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 2px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #facc15; /* Tailwind yellow-400 */
            border-radius: 9999px;
            z-index: 10;
          }
          /* Add a gray dot for new moon */
          .calendar-new-moon button {
            position: relative;
          }
          .calendar-new-moon button::after {
            content: '';
            display: block;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 2px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #a3a3a3; /* Tailwind gray-400 */
            border-radius: 9999px;
            z-index: 10;
          }
          /* Add orange dot for solar event */
          .calendar-solar-event button {
            position: relative;
          }
          .calendar-solar-event button::after {
            content: '';
            display: block;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 2px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #f97316; /* Tailwind orange-500 */
            border-radius: 9999px;
            z-index: 10;
          }
        `}</style>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          // No renderDay here!
          footer={
            <div className="mt-3 pt-3 border-t border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs text-muted-foreground">Full Moon</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-xs text-muted-foreground">New Moon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
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
