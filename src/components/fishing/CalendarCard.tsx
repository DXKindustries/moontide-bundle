
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideForecast } from "@/services/noaaService";
import { useCalendarModifiers } from "./useCalendarModifiers";

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
  const { modifiers, modifiersClassNames } = useCalendarModifiers();

  // We inject styles for lunar/solar event indicators in Tailwind
  // These are added to the global style for the day cells of the calendar
  // Style: small colored dot below the number for full/new moon/solar event days

  return (
    <Card className="bg-card/50 backdrop-blur-md relative">
      {/* Inline style block for calendar event markers */}
      <style>
        {`
        /* Full Moon: yellow dot below date */
        .calendar-full-moon .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%; 
          top: 72%; 
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #fde047; /* Tailwind yellow-400 */
        }
        /* New Moon: gray dot below date */
        .calendar-new-moon .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%; 
          top: 72%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #a3a3a3; /* Tailwind gray-400 */
        }
        /* Solar Event: orange dot below date */
        .calendar-solar-event .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%; 
          top: 72%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #f97316; /* Tailwind orange-500 */
        }
        `}
      </style>
      <CardHeader>
        {/* UPDATED label as requested */}
        <CardTitle>Fishing & Lunar Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          // Use custom day content to wrap the number with a span for marker
          components={{
            Day: (props: any) => {
              // Add a wrapper span for styling marker dots by CSS class
              // Copy default content, add our own inner container
              // The `className` will include calendar-full-moon etc as appropriate for that day
              return (
                <button
                  {...props}
                  type="button"
                  tabIndex={props.tabIndex}
                  className={`${props.className} relative`}
                >
                  <span className="calendar-day-inner relative z-20">{props.children}</span>
                </button>
              );
            },
          }}
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
