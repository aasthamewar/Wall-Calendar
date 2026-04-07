import React, { memo } from "react";
import { isToday, isSameMonth, format, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  isInRange: boolean;
  isStart: boolean;
  isEnd: boolean;
  hasNote: boolean;
  holiday?: string;
  onClick: (date: Date) => void;
  onHover: (date: Date) => void;
}

const DayCell = memo(function DayCell({
  date,
  currentMonth,
  isInRange,
  isStart,
  isEnd,
  hasNote,
  holiday,
  onClick,
  onHover,
}: DayCellProps) {
  const inMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const dayNum = date.getDate();
  const isWeekend = getDay(date) === 0 || getDay(date) === 6;

  return (
    <button
      type="button"
      tabIndex={inMonth ? 0 : -1}
      aria-label={`${format(date, "EEEE, MMMM d, yyyy")}${holiday ? `, ${holiday}` : ""}`}
      className={cn(
        "relative flex items-center justify-center h-9 sm:h-11 text-sm font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm",
        "border-b border-calendar-grid-line",
        !inMonth && "opacity-0 pointer-events-none",
        inMonth && "cursor-pointer hover:bg-calendar-accent-light",
        inMonth && isWeekend && "text-calendar-weekend font-semibold",
        inMonth && !isWeekend && "text-calendar-ink",
        isInRange && !isStart && !isEnd && "bg-calendar-accent-light",
        isStart && "bg-primary text-primary-foreground rounded-l-full",
        isEnd && "bg-primary text-primary-foreground rounded-r-full",
        isInRange && !isStart && !isEnd && "rounded-none",
        today && !isStart && !isEnd && "ring-2 ring-primary ring-inset rounded-full font-bold"
      )}
      onClick={() => onClick(date)}
      onMouseEnter={() => onHover(date)}
    >
      <span className="relative z-10 leading-none">{dayNum}</span>
      {holiday && inMonth && (
        <span className="absolute -bottom-0.5 text-[6px] leading-none text-calendar-holiday font-semibold truncate max-w-full px-0.5">
          {holiday}
        </span>
      )}
      {hasNote && inMonth && !isStart && !isEnd && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-calendar-dot" />
      )}
    </button>
  );
});

export default DayCell;
