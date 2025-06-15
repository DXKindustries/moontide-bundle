import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isDateFullMoon, isDateNewMoon } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';

/* 
 * Reason for this update: 
 * - The dot for full/new moons is now a circle *over* the number, not below.
 * - Achieved via ::before + day number opacity for full/new moon days.
 */

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

  // Functions for calendar day modifiers
  const modifiers = {
    fullMoon: (date: Date) => isDateFullMoon(date),
    newMoon: (date: Date) => isDateNewMoon(date),
    solarEvent: (date: Date) => !!getSolarEvents(date)
  };

  const modifiersClassNames = {
    fullMoon: "calendar-full-moon-overlay",
    newMoon: "calendar-new-moon-overlay",
    solarEvent: "calendar-solar-event"
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <style>{`
          /* --- FULL MOON --- */
          .calendar-full-moon-overlay {
            position: relative;
            z-index: 0;
          }
          .calendar-full-moon-overlay::before {
            content: '';
            position: absolute;
            left: 50%; top: 50%;
            transform: translate(-50%,-50%);
            width: 2.1rem;
            height: 2.1rem;
            background-color: #facc15; /* yellow-400 */
            border-radius: 9999px;
            z-index: 1;
            pointer-events: none;
            box-shadow: 0 0 0 1.5px #eab30855;
          }
          .calendar-full-moon-overlay > span {
            position: relative;
            z-index: 2;
            color: #000 !important;   /* Pure black for maximum contrast */
            font-weight: 900 !important; /* Extra bold */
            opacity: 1 !important;
            text-shadow: none !important;
          }

          /* --- NEW MOON --- */
          .calendar-new-moon-overlay {
            position: relative;
            z-index: 0;
          }
          .calendar-new-moon-overlay::before {
            content: '';
            position: absolute;
            left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            width: 2.1rem;
            height: 2.1rem;
            background-color: #a3a3a3; /* gray-400 */
            border-radius: 9999px;
            z-index: 1;
            pointer-events: none;
            box-shadow: 0 0 0 1.5px #73737355;
          }
          .calendar-new-moon-overlay > span {
            position: relative;
            z-index: 2;
            color: #000 !important;   /* Pure black for maximum contrast */
            font-weight: 900 !important; /* Extra bold */
            opacity: 1 !important;
            text-shadow: none !important;
          }

          /* --- SOLAR EVENT (keep below, dot under) --- */
          .calendar-solar-event {
            position: relative;
          }
          .calendar-solar-event::after {
            content: '';
            display: block;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 4px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #f97316; /* orange-500 */
            border-radius: 9999px;
            z-index: 10;
            pointer-events: none;
          }
        `}</style>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
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
