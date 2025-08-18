import * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  startOfMonth,
} from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Lightweight, high-performance month slider for react-day-picker using Embla Carousel.
 * - Renders prev | current | next months as slides.
 * - Swipe or buttons animate to neighbor; after settle we commit month and re-center.
 * - Respects fromMonth / toMonth bounds (snaps back if at edge).
 * - Works controlled (props.month) or uncontrolled.
 * - No network/API use. Pure client-side.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onMonthChange,
  fromMonth,
  toMonth,
  month: controlledMonth,
  numberOfMonths: controlledNumberOfMonths,
  components,
  ...props
}: CalendarProps) {
  const isControlled = controlledMonth instanceof Date;
  const [internalMonth, setInternalMonth] = useState<Date>(
    startOfMonth(controlledMonth ?? new Date())
  );

  // keep internal in sync with controlled month changes
  useEffect(() => {
    if (isControlled && controlledMonth) {
      const sm = startOfMonth(controlledMonth);
      setInternalMonth((prev) => (prev.getTime() === sm.getTime() ? prev : sm));
    }
  }, [isControlled, controlledMonth]);

  const currentMonth = isControlled
    ? startOfMonth(controlledMonth as Date)
    : internalMonth;

  const prevMonth = useMemo(() => startOfMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const nextMonth = useMemo(() => startOfMonth(addMonths(currentMonth, 1)), [currentMonth]);

  const numberOfMonths = controlledNumberOfMonths ?? 1;

  // Bounds
  const canGoPrev = useMemo(() => {
    if (!fromMonth) return true;
    // You can go prev if the target "prevMonth" is not before fromMonth's start
    return !isBefore(prevMonth, startOfMonth(fromMonth));
  }, [fromMonth, prevMonth]);

  const canGoNext = useMemo(() => {
    if (!toMonth) return true;
    // You can go next if the target "nextMonth" is not after toMonth's start
    return !isAfter(nextMonth, startOfMonth(toMonth));
  }, [toMonth, nextMonth]);

  // Embla
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false, // we simulate infinite by re-centering after month switch
    dragFree: false,
    watchDrag: true,
    align: "center",
    skipSnaps: false,
    duration: 16, // quick but smooth
  });

  // Always keep the "current" slide centered (index 1) after any month commit
  const recenter = useCallback((api: EmblaCarouselType | null, animate = false) => {
    if (!api) return;
    api.scrollTo(1, animate);
  }, []);

  // Commit a month change (controlled/uncontrolled) and recentre without visual jump.
  const commitMonthChange = useCallback(
    (newMonth: Date) => {
      if (!isControlled) setInternalMonth(newMonth);
      onMonthChange?.(newMonth);
      // After React paints the new slides, re-center without animation
      queueMicrotask(() => recenter(emblaApi, false));
    },
    [isControlled, onMonthChange, emblaApi, recenter]
  );

  // Handle selection change after a swipe ends
  const handleEmblaSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap(); // 0 | 1 | 2
    if (idx === 1) return; // already centered

    // Left slide (0) means going to prev
    if (idx === 0) {
      if (canGoPrev) {
        commitMonthChange(prevMonth);
      } else {
        // snap back if at left bound
        recenter(emblaApi, true);
      }
      return;
    }

    // Right slide (2) means going to next
    if (idx === 2) {
      if (canGoNext) {
        commitMonthChange(nextMonth);
      } else {
        // snap back if at right bound
        recenter(emblaApi, true);
      }
      return;
    }
  }, [emblaApi, canGoPrev, canGoNext, prevMonth, nextMonth, commitMonthChange, recenter]);

  // Wire Embla events
  useEffect(() => {
    if (!emblaApi) return;
    recenter(emblaApi, false); // ensure centered on mount
    emblaApi.on("select", handleEmblaSelect);
    return () => {
      emblaApi.off("select", handleEmblaSelect);
    };
  }, [emblaApi, handleEmblaSelect, recenter]);

  // If container size changes or month changes externally, ensure we stay centered
  useEffect(() => {
    recenter(emblaApi, false);
  }, [recenter, emblaApi, currentMonth, numberOfMonths]);

  // Keyboard navigation with animation
  const safeGoPrev = useCallback(() => {
    if (!emblaApi) return;
    if (!canGoPrev) {
      recenter(emblaApi, true);
      return;
    }
    // Animate to slide 0 (left); on settle, handleEmblaSelect commits
    emblaApi.scrollTo(0, true);
  }, [emblaApi, canGoPrev, recenter]);

  const safeGoNext = useCallback(() => {
    if (!emblaApi) return;
    if (!canGoNext) {
      recenter(emblaApi, true);
      return;
    }
    // Animate to slide 2 (right); on settle, handleEmblaSelect commits
    emblaApi.scrollTo(2, true);
  }, [emblaApi, canGoNext, recenter]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      safeGoPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      safeGoNext();
    }
  };

  // Hide DayPicker's own nav; we provide absolute buttons to drive the slider
  const mergedClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "hidden",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell:
      "h-9 w-9 text-center text-sm p-0 relative " +
      "[&:has([aria-selected].day-range-end)]:rounded-r-md " +
      "[&:has([aria-selected].day-outside)]:bg-accent/50 " +
      "[&:has([aria-selected])]:bg-accent " +
      "first:[&:has([aria-selected])]:rounded-l-md " +
      "last:[&:has([aria-selected])]:rounded-r-md " +
      "focus-within:relative focus-within:z-20",
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
    ),
    day_range_end: "day-range-end",
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside:
      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames,
  };

  const mergedComponents = {
    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
    IconRight: () => <ChevronRight className="h-4 w-4" />,
    ...components,
  };

  // Render a DayPicker page locked to a specific month
  const Page = ({ m, k }: { m: Date; k: string }) => (
    <div
      className="embla__slide min-w-0 flex-[0_0_100%] overflow-hidden"
      key={k}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={mergedClassNames}
        components={mergedComponents}
        month={m}
        onMonthChange={() => {}}
        numberOfMonths={numberOfMonths}
        fromMonth={fromMonth}
        toMonth={toMonth}
        {...props}
      />
    </div>
  );

  return (
    <div
      className="relative w-full"
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Calendar with swipeable months"
    >
      {/* Absolute nav buttons to drive the slider */}
      <button
        type="button"
        aria-label="Previous month"
        className={cn(
          mergedClassNames.nav_button,
          mergedClassNames.nav_button_previous,
          !canGoPrev && "opacity-20 cursor-not-allowed"
        )}
        onClick={safeGoPrev}
        disabled={!canGoPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next month"
        className={cn(
          mergedClassNames.nav_button,
          mergedClassNames.nav_button_next,
          !canGoNext && "opacity-20 cursor-not-allowed"
        )}
        onClick={safeGoNext}
        disabled={!canGoNext}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Embla viewport + container + three slides */}
      <div ref={emblaRef} className="embla__viewport overflow-hidden">
        <div className="embla__container flex">
          <Page m={prevMonth} k="prev" />
          <Page m={currentMonth} k="current" />
          <Page m={nextMonth} k="next" />
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

