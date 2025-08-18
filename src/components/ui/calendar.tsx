import * as React from "react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
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

type Direction = "next" | "prev" | null;

const SWIPE_THRESHOLD_PX = 60; // how far you need to drag to trigger month switch
const MAX_DRAG_SLOPE = 0.58; // reject if vertical movement dominates (tan ~ 30deg)

/**
 * A DayPicker wrapper that adds native-like swipe animation between months.
 * Both months are rendered and slide horizontally during the gesture.
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
  // We animate one "page" at a time. For parity with DayPicker defaults we keep numberOfMonths = 1 for animation,
  // but we’ll still honor a user-provided numberOfMonths visually by letting DayPicker render that layout inside each page.
  const numberOfMonths = controlledNumberOfMonths ?? 1;

  // Controlled/uncontrolled month support
  const isControlled = controlledMonth instanceof Date;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(
    controlledMonth ?? startOfMonth(new Date())
  );
  const currentMonth = isControlled ? startOfMonth(controlledMonth as Date) : uncontrolledMonth;

  useEffect(() => {
    if (isControlled && controlledMonth) {
      // keep internal in sync so render of neighbor months is accurate
      setUncontrolledMonth(startOfMonth(controlledMonth));
    }
  }, [isControlled, controlledMonth]);

  // Bounds
  const canGoPrev = useMemo(() => {
    if (!fromMonth) return true;
    return !isBefore(startOfMonth(currentMonth), startOfMonth(fromMonth));
  }, [currentMonth, fromMonth]);

  const canGoNext = useMemo(() => {
    if (!toMonth) return true;
    return !isAfter(startOfMonth(currentMonth), startOfMonth(toMonth));
  }, [currentMonth, toMonth]);

  // Refs & state for gesture + animation
  const frameRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0); // live drag offset
  const [animating, setAnimating] = useState(false);
  const [animTarget, setAnimTarget] = useState<Direction>(null); // where animation is heading
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const axisLockedRef = useRef<"x" | "y" | null>(null);

  // Measure width for correct slide distance
  useEffect(() => {
    const measure = () => {
      if (frameRef.current) {
        widthRef.current = frameRef.current.clientWidth;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  // Helper: fire external onMonthChange and/or update internal month
  const commitMonthChange = useCallback(
    (newMonth: Date) => {
      if (!isControlled) setUncontrolledMonth(newMonth);
      onMonthChange?.(newMonth);
    },
    [isControlled, onMonthChange]
  );

  // Compute neighboring months
  const prevMonth = useMemo(() => startOfMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const nextMonth = useMemo(() => startOfMonth(addMonths(currentMonth, 1)), [currentMonth]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (animating) return;
    // Only left button for mouse
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    axisLockedRef.current = null;
    setIsDragging(true);
    setDragX(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!axisLockedRef.current) {
      // lock axis when movement is decisive
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        const slope = Math.abs(dy) / Math.max(1, Math.abs(dx));
        axisLockedRef.current = slope > MAX_DRAG_SLOPE ? "y" : "x";
      } else {
        return;
      }
    }
    if (axisLockedRef.current === "y") return; // ignore vertical scroll

    // Prevent overswipe beyond bounds: add resistance
    const w = Math.max(1, widthRef.current);
    let applied = dx;

    if (dx > 0 && !canGoPrev) {
      applied = Math.sqrt(dx) * 4; // resistance
    } else if (dx < 0 && !canGoNext) {
      applied = -Math.sqrt(-dx) * 4; // resistance
    } else {
      // clamp to half width to avoid absurd values during fast drags
      const limit = w * 0.9;
      if (applied > limit) applied = limit;
      if (applied < -limit) applied = -limit;
    }
    setDragX(applied);
  };

  const finishDrag = (velocityX = 0) => {
    if (!isDragging) return;
    setIsDragging(false);

    const w = Math.max(1, widthRef.current);
    const distance = dragX + velocityX * 120; // small "flick" assist
    let go: Direction = null;

    if (distance <= -SWIPE_THRESHOLD_PX && canGoNext) go = "next";
    if (distance >= SWIPE_THRESHOLD_PX && canGoPrev) go = "prev";

    if (!go) {
      // snap back
      setAnimating(true);
      setAnimTarget(null);
      // end animation after transition
      window.setTimeout(() => {
        setAnimating(false);
        setDragX(0);
      }, 180);
      return;
    }

    // animate to the next page
    setAnimating(true);
    setAnimTarget(go);

    // when animation ends, commit month change and reset
    window.setTimeout(() => {
      const newMonth = go === "next" ? nextMonth : prevMonth;
      commitMonthChange(newMonth);
      setAnimating(false);
      setAnimTarget(null);
      setDragX(0);
    }, 220);
  };

  const onPointerUp = () => finishDrag(0);
  const onPointerCancel = () => finishDrag(0);

  // Keyboard navigation with animation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (animating) return;
    if (e.key === "ArrowLeft" && canGoPrev) {
      e.preventDefault();
      // simulate a left-swipe completion
      setAnimating(true);
      setAnimTarget("prev");
      window.setTimeout(() => {
        commitMonthChange(prevMonth);
        setAnimating(false);
        setAnimTarget(null);
        setDragX(0);
      }, 180);
    } else if (e.key === "ArrowRight" && canGoNext) {
      e.preventDefault();
      setAnimating(true);
      setAnimTarget("next");
      window.setTimeout(() => {
        commitMonthChange(nextMonth);
        setAnimating(false);
        setAnimTarget(null);
        setDragX(0);
      }, 180);
    }
  };

  // Translate calculation: while dragging, translate by dragX. When animating, slide to full width.
  const w = Math.max(1, widthRef.current);
  let translateX = dragX;

  if (animating) {
    if (animTarget === "next") translateX = -w; // move left to reveal next
    else if (animTarget === "prev") translateX = w; // move right to reveal prev
    else translateX = 0; // snap back
  }

  // We draw three pages (prev, current, next) inside a wide strip; we center current at 0.
  const baseOffset = -w; // prev at -width, current at 0, next at +width when no drag
  const stripStyle: React.CSSProperties = {
    width: `${w * 3}px`,
    height: "100%",
    display: "flex",
    touchAction: "pan-y",
    transform: `translate3d(${baseOffset + translateX}px, 0, 0)`,
    transition: isDragging ? "none" : "transform 180ms ease-out",
  };

  const pageStyle: React.CSSProperties = {
    width: `${w}px`,
    flex: "0 0 auto",
  };

  // Hide DayPicker's built-in nav; we re-render icons in caption to keep visuals identical
  const mergedClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
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

  // Replace icons (keep your lucide-react chevrons)
  const mergedComponents = {
    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
    IconRight: () => <ChevronRight className="h-4 w-4" />,
    ...components,
  };

  // Helper to render a DayPicker page for a given month
  const renderPage = (m: Date, key: string) => (
    <div key={key} style={pageStyle} className="overflow-hidden">
      <DayPicker
        // Visual parity props
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={mergedClassNames}
        components={mergedComponents}
        // Freeze the page to this exact month; navigation is handled by our wrapper
        month={m}
        onMonthChange={() => {}}
        // keep consumer props (selection, mode, etc.)
        numberOfMonths={numberOfMonths}
        {...props}
      />
    </div>
  );

  // Prevent clicks while dragging to avoid accidental date selections
  const pointerEventsClass = isDragging || animating ? "pointer-events-none select-none" : "";

  // Clamp external attempts to go beyond bounds
  const safeGoPrev = () => {
    if (!canGoPrev || animating) return;
    setAnimating(true);
    setAnimTarget("prev");
    window.setTimeout(() => {
      commitMonthChange(prevMonth);
      setAnimating(false);
      setAnimTarget(null);
      setDragX(0);
    }, 180);
  };
  const safeGoNext = () => {
    if (!canGoNext || animating) return;
    setAnimating(true);
    setAnimTarget("next");
    window.setTimeout(() => {
      commitMonthChange(nextMonth);
      setAnimating(false);
      setAnimTarget(null);
      setDragX(0);
    }, 180);
  };

  // Replace DayPicker nav buttons by placing our own absolute buttons on top (preserves your visuals)
  const NavButtons = () => (
    <>
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
    </>
  );

  return (
    <div
      ref={frameRef}
      className={cn("relative w-full", pointerEventsClass)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0} // enable keyboard focus
      role="application"
      aria-label="Calendar with swipeable months"
    >
      {/* Absolute nav buttons layered above to keep your look & feel */}
      <NavButtons />

      {/* Sliding strip with prev | current | next pages */}
      <div style={stripStyle}>
        {renderPage(prevMonth, "prev")}
        {renderPage(currentMonth, "current")}
        {renderPage(nextMonth, "next")}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
