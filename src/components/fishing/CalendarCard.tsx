
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

  // Only forward standard props to custom day; DO NOT forward invalid props
  function DayCustom(props: any) {
    // Destructure only valid props for a button element
    // Remove any DayPicker-specific props that should NOT go on <button>
    const {
      date,
      className = "",
      selected,
      disabled,
      hidden,
      today,
      ...rest
    } = props;

    // Forward only aria-selected, tabIndex, onClick, etc.
    return (
      <button
        type="button"
        tabIndex={rest.tabIndex}
        aria-selected={rest["aria-selected"]}
        aria-label={rest["aria-label"]}
        disabled={disabled}
        className={`${className} relative`}
        onClick={rest.onClick}
      >
        <span className="calendar-day-inner relative z-20">{props.children}</span>
      </button>
    );
  }

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
        {/* Restore to original label (no "Fishing & Lunar Calendar") */}
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          components={{
            Day: DayCustom
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
