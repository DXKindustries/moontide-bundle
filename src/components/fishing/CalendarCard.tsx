
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from '@/services/noaaService';
import { isDateFullMoon, isDateNewMoon, getFullMoonName } from '@/utils/lunarUtils';
import { getSolarEvents } from '@/utils/solarUtils';

/* 
 * Reason for this update: 
 * - Enhanced legend to show solar event descriptions when they occur in the visible month
 * - Added traditional moon names to legend when full moons occur in the visible month
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

  // Get the current month being displayed (use selectedDate or current date)
  const displayDate = selectedDate || new Date();
  const currentYear = displayDate.getFullYear();
  const currentMonth = displayDate.getMonth() + 1;

  // Check for solar events in the current month
  const getSolarEventsInMonth = () => {
    const events = [];
    // Check each day of the month for solar events
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(currentYear, currentMonth - 1, day);
      const solarEvent = getSolarEvents(checkDate);
      if (solarEvent) {
        events.push(solarEvent);
      }
    }
    return events;
  };

  // Get traditional moon name for the current month
  const getFullMoonNameForMonth = () => {
    // Create a date for the current month to get the traditional name
    const monthDate = new Date(currentYear, currentMonth - 1, 15); // Mid-month date
    return getFullMoonName(monthDate);
  };

  const solarEventsInMonth = getSolarEventsInMonth();
  const fullMoonName = getFullMoonNameForMonth();

  return (
    <Card className="bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <style>{`
          /* --- FULL MOON --- */
          .calendar-full-moon-overlay {
            position: relative !important;
            background-color: #facc15 !important; /* yellow-400 */
            border-radius: 50% !important;
            color: #000 !important;
            font-weight: 900 !important;
          }
          
          .calendar-full-moon-overlay:hover {
            background-color: #eab308 !important; /* yellow-500 for hover */
          }

          /* --- NEW MOON --- */
          .calendar-new-moon-overlay {
            position: relative !important;
            background-color: #a3a3a3 !important; /* gray-400 */
            border-radius: 50% !important;
            color: #000 !important;
            font-weight: 900 !important;
          }
          
          .calendar-new-moon-overlay:hover {
            background-color: #737373 !important; /* gray-500 for hover */
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
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Full Moon</span>
                  {fullMoonName && (
                    <span className="text-xs text-yellow-400 font-medium">
                      {fullMoonName.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-xs text-muted-foreground">New Moon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Solar Event</span>
                  {solarEventsInMonth.map((event, index) => (
                    <span key={index} className="text-xs text-orange-400 font-medium">
                      {event.emoji} {event.name} — {event.description}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CalendarCard;
