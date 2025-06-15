
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

  // THIS FIXES: Make DayCustom forward ref and be DayPicker compatible!
  // DayPicker expects a React.forwardRef component for Day override.
  const DayCustom = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
    const { children, ...otherProps } = props;
    // Only spread props that are valid on <button>; DayPicker should be clean but just in case
    return (
      <button ref={ref} {...otherProps}>
        <span className="calendar-day-inner relative z-20">{children}</span>
      </button>
    );
  });
  DayCustom.displayName = "DayCustom";

  return (
    <Card className="bg-card/50 backdrop-blur-md relative">
      <style>
        {`
        .calendar-full-moon .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%; 
          top: 72%; 
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #fde047;
        }
        .calendar-new-moon .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 72%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #a3a3a3;
        }
        .calendar-solar-event .calendar-day-inner::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 72%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #f97316;
        }
        `}
      </style>
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
