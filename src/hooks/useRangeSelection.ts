import { useState, useCallback } from "react";
import { isBefore, isAfter, isSameDay, isWithinInterval } from "date-fns";

export interface RangeState {
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
}

export function useRangeSelection() {
  const [range, setRange] = useState<RangeState>({
    startDate: null,
    endDate: null,
    hoverDate: null,
  });

  const handleDateClick = useCallback((date: Date) => {
    setRange((prev) => {
      if (!prev.startDate || (prev.startDate && prev.endDate)) {
        return { startDate: date, endDate: null, hoverDate: null };
      }
      const [start, end] = isBefore(date, prev.startDate)
        ? [date, prev.startDate]
        : [prev.startDate, date];
      return { startDate: start, endDate: end, hoverDate: null };
    });
  }, []);

  const handleDateHover = useCallback((date: Date) => {
    setRange((prev) => {
      if (prev.startDate && !prev.endDate) {
        return { ...prev, hoverDate: date };
      }
      return prev;
    });
  }, []);

  const clearRange = useCallback(() => {
    setRange({ startDate: null, endDate: null, hoverDate: null });
  }, []);

  const isInRange = useCallback(
    (date: Date) => {
      const { startDate, endDate, hoverDate } = range;
      if (!startDate) return false;
      const effectiveEnd = endDate || hoverDate;
      if (!effectiveEnd) return false;
      const [s, e] = isBefore(effectiveEnd, startDate)
        ? [effectiveEnd, startDate]
        : [startDate, effectiveEnd];
      return isWithinInterval(date, { start: s, end: e });
    },
    [range]
  );

  const isRangeStart = useCallback(
    (date: Date) => {
      if (!range.startDate) return false;
      const effectiveEnd = range.endDate || range.hoverDate;
      if (effectiveEnd && isBefore(effectiveEnd, range.startDate)) {
        return isSameDay(date, effectiveEnd);
      }
      return isSameDay(date, range.startDate);
    },
    [range]
  );

  const isRangeEnd = useCallback(
    (date: Date) => {
      const effectiveEnd = range.endDate || range.hoverDate;
      if (!effectiveEnd || !range.startDate) return false;
      if (isBefore(effectiveEnd, range.startDate)) {
        return isSameDay(date, range.startDate);
      }
      return isSameDay(date, effectiveEnd);
    },
    [range]
  );

  return {
    range,
    handleDateClick,
    handleDateHover,
    clearRange,
    isInRange,
    isRangeStart,
    isRangeEnd,
  };
}
