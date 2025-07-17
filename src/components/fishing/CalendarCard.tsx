import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TideForecast } from "@/services/tide/types";
import {
  isDateFullMoon,
  isDateNewMoon,
  getFullMoonName,
} from "@/utils/lunarUtils";
import { getSolarEvents } from "@/utils/solarUtils";
import MoonTideIcon from "@/components/MoonTideIcon"; // NEW import

/* 
 * Reason for this update: 
 * - Made legend truly dynamic based on the calendar's currently displayed month
 * - Each month now shows only its specific solar events and moon names
 * - Replaced old cloud-moon icon with the new Moon-Tide logo
 */

type CalendarCardProps = {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  weeklyForecast: TideForecast[];
};

const CalendarCard: React.FC<CalendarCardProps> = ({
  selectedDate,
  onSelectDate,
  weeklyForecast,
}) => {
  const [displayMonth, setDisplayMonth] = React.useState(() => {
    return selectedDate || new Date();
  });

  // Calendar day modifiers
  const modifiers = {
    fullMoon: (date: Date) => isDateFullMoon(date),
    newMoon: (date: Date) => isDateNewMoon(date),
    solarEvent: (date: Date) => !!getSolarEvents(date),
  };

  const modifiersClassNames = {
    fullMoon: "calendar-full-moon-overlay",
    newMoon: "calendar-new-moon-overlay",
    solarEvent: "calendar-solar-event",
  };

  // Current displayed month
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth() + 1;

  // Solar events in displayed month
  const getSolarEventsInMonth = () => {
    const events = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(currentYear, currentMonth - 1, day);
      const solarEvent = getSolarEvents(checkDate);
      if (solarEvent) events.push(solarEvent);
    }
    return events;
  };

  // Full-moon name (if any) for displayed month
  const getFullMoonInMonth = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(currentYear, currentMonth - 1, day);
      if (isDateFullMoon(checkDate)) return getFullMoonName(checkDate);
    }
    return null;
  };

  const solarEventsInMonth = getSolarEventsInMonth();
  const fullMoonInMonth = getFullMoonInMonth();

  return (
    <Card className="bg-card/50 backdrop-blur-md">
      <CardHeader className="flex items-center gap-2">
        {/* NEW Moon-Tide logo */}
        <MoonTideIcon width={20} height={20} />
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
            background-color: #eab308 !important; /* yellow-500 */
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
            background-color: #737373 !important; /* gray-500 */
          }

          /* --- SOLAR EVENT (dot) --- */
          .calendar-solar-event {
            position: relative;
          }
          .calendar-solar-event::after {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 4px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #f97316; /* orange-500 */
            border-radius: 9999px;
            pointer-events: none;
          }
        `}</style>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          footer={
            <div className="mt-3 pt-3 border-t border-muted">
              {/* Full Moon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Full Moon
                  </span>
                  {fullMoonInMonth && (
                    <span className="text-xs text-yellow-400 font-medium">
                      {fullMoonInMonth.name}
                    </span>
                  )}
                </div>
              </div>

              {/* New Moon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-xs text-muted-foreground">New Moon</span>
              </div>

              {/* Solar Events */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Solar Event
                  </span>
                  {solarEventsInMonth.map((event, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-orange-400 font-medium"
                    >
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
