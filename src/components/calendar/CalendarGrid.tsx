import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";
import DayCell from "./DayCell";
import { getHolidayForDate } from "./holidays";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface CalendarGridProps {
  currentMonth: Date;
  isInRange: (d: Date) => boolean;
  isRangeStart: (d: Date) => boolean;
  isRangeEnd: (d: Date) => boolean;
  hasNoteOnDate: (d: Date) => boolean;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date) => void;
}

export default function CalendarGrid({
  currentMonth,
  isInRange,
  isRangeStart,
  isRangeEnd,
  hasNoteOnDate,
  onDateClick,
  onDateHover,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  return (
    <div className="select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b-2 border-calendar-ink/20">
        {WEEKDAYS.map((d, i) => {
          const isWe = i >= 5;
          return (
            <div
              key={d}
              className={cn(
                "text-center text-[10px] sm:text-xs font-display font-bold tracking-widest py-2 sm:py-3",
                isWe ? "text-calendar-weekend" : "text-calendar-ink/60"
              )}
            >
              {d}
            </div>
          );
        })}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7" role="grid" aria-label={format(currentMonth, "MMMM yyyy")}>
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            currentMonth={currentMonth}
            isInRange={isInRange(day)}
            isStart={isRangeStart(day)}
            isEnd={isRangeEnd(day)}
            hasNote={hasNoteOnDate(day)}
            holiday={getHolidayForDate(day)}
            onClick={onDateClick}
            onHover={onDateHover}
          />
        ))}
      </div>
    </div>
  );
}
