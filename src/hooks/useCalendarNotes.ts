import { useState, useCallback } from "react";
import { format } from "date-fns";

export interface CalendarNote {
  id: string;
  text: string;
  type: "general" | "date-specific";
  date?: string; // YYYY-MM-DD for date-specific
  month: string; // YYYY-MM for general
  createdAt: number;
}

export function useCalendarNotes() {
  const [notes, setNotes] = useState<CalendarNote[]>([]);

  const addNote = useCallback(
    (text: string, month: Date, specificDate?: Date) => {
      const note: CalendarNote = {
        id: crypto.randomUUID(),
        text,
        type: specificDate ? "date-specific" : "general",
        date: specificDate ? format(specificDate, "yyyy-MM-dd") : undefined,
        month: format(month, "yyyy-MM"),
        createdAt: Date.now(),
      };
      setNotes((prev) => [...prev, note]);
    },
    []
  );

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const getNotesForMonth = useCallback(
    (month: Date) => {
      const key = format(month, "yyyy-MM");
      return notes.filter((n) => n.month === key);
    },
    [notes]
  );

  const getNotesForDate = useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return notes.filter((n) => n.date === key);
    },
    [notes]
  );

  const hasNoteOnDate = useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return notes.some((n) => n.date === key);
    },
    [notes]
  );

  return { notes, addNote, removeNote, getNotesForMonth, getNotesForDate, hasNoteOnDate };
}
