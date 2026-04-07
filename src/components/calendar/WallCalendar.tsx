import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  addMonths,
  subMonths,
  format,
  isSameDay,
} from "date-fns";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, X, Plus } from "lucide-react";
import CalendarGrid from "./CalendarGrid";
import { useRangeSelection } from "@/hooks/useRangeSelection";
import { useCalendarNotes } from "@/hooks/useCalendarNotes";
import { getHeroForMonth } from "./heroImages";
import { cn } from "@/lib/utils";

function SpiralBinding() {
  const rings = 15;
  return (
    <div
      className="relative w-full h-8 sm:h-10 flex items-center justify-center z-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(210 10% 88%) 0%, hsl(210 10% 94%) 40%, hsl(0 0% 100%) 100%)",
      }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {Array.from({ length: rings }).map((_, i) => (
          <div key={i} className="relative w-3 h-6 sm:w-4 sm:h-8">
            <div className="absolute inset-0 rounded-full border-2 border-calendar-spiral/70 bg-gradient-to-b from-calendar-spiral/10 to-transparent" />
            <div className="absolute top-0 left-0.5 right-0.5 h-1/2 rounded-t-full border-t-2 border-l-2 border-r-2 border-calendar-spiral/50" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-3 sm:gap-4 z-[-1]">
        {Array.from({ length: rings }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-background shadow-inner"
          />
        ))}
      </div>
    </div>
  );
}

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const noteInputRef = useRef<HTMLInputElement>(null);

  const {
    range,
    handleDateClick: rangeClick,
    handleDateHover,
    clearRange,
    isInRange,
    isRangeStart,
    isRangeEnd,
  } = useRangeSelection();

  const { notes, addNote, removeNote, getNotesForMonth, hasNoteOnDate } =
    useCalendarNotes();

  const monthNotes = getNotesForMonth(currentMonth);

  const handleDateClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      rangeClick(date);
      setTimeout(() => noteInputRef.current?.focus(), 100);
    },
    [rangeClick]
  );

  const navigateMonth = useCallback((dir: number) => {
    setDirection(dir);
    setCurrentMonth((prev) =>
      dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1)
    );
    setSelectedDate(null);
    setNoteInput("");
  }, []);

  const handleAddNote = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!noteInput.trim() || !selectedDate) return;
      addNote(noteInput.trim(), currentMonth, selectedDate);
      setNoteInput("");
    },
    [noteInput, selectedDate, currentMonth, addNote]
  );

  // 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const flipVariants = {
    enter: (d: number) => ({
      rotateX: d > 0 ? -90 : 90,
      opacity: 0,
      transformOrigin: "top center",
    }),
    center: {
      rotateX: 0,
      opacity: 1,
      transformOrigin: "top center",
    },
    exit: (d: number) => ({
      rotateX: d > 0 ? 90 : -90,
      opacity: 0,
      transformOrigin: "top center",
    }),
  };

  const heroSrc = getHeroForMonth(currentMonth.getMonth());

  // Date-specific notes for the left column
  const dateNotes = monthNotes.filter((n) => n.type === "date-specific");

  return (
    <motion.div
      className="w-full max-w-md sm:max-w-lg mx-auto"
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="calendar-shadow rounded-lg overflow-hidden">
        {/* Spiral binding */}
        <SpiralBinding />

        {/* Hero image with seasonal change */}
        <div className="relative overflow-hidden" style={{ perspective: 800 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={format(currentMonth, "yyyy-MM") + "-hero"}
              custom={direction}
              variants={flipVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <div className="relative h-52 sm:h-72 overflow-hidden">
                <motion.img
                  src={heroSrc}
                  alt={`${format(currentMonth, "MMMM")} seasonal photo`}
                  className="w-full h-full object-cover"
                  width={1200}
                  height={800}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                {/* Diagonal accent overlay */}
                <svg
                  className="absolute bottom-0 left-0 w-full"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  style={{ height: "40%" }}
                >
                  <polygon
                    points="0,20 100,20 100,8 0,20"
                    fill="hsl(var(--calendar-paper))"
                  />
                  <polygon
                    points="60,20 100,20 100,5 40,20"
                    fill="hsl(var(--calendar-accent))"
                    opacity="0.9"
                  />
                </svg>
                {/* Year + Month overlay */}
                <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 text-right z-10">
                  <p className="font-display text-lg sm:text-2xl font-bold text-calendar-ink/70">
                    {format(currentMonth, "yyyy")}
                  </p>
                  <h1 className="font-display text-2xl sm:text-4xl font-black text-calendar-ink tracking-tight uppercase">
                    {format(currentMonth, "MMMM")}
                  </h1>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom half: Notes + Calendar */}
        <div className="bg-card">
          {/* Navigation */}
          <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 hover:bg-secondary rounded-full transition-colors group"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <div className="flex items-center gap-2">
              {range.startDate && (
                <button
                  onClick={() => {
                    clearRange();
                    setSelectedDate(null);
                  }}
                  className="p-1.5 hover:bg-secondary rounded-full transition-colors"
                  aria-label="Clear selection"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              {selectedDate && (
                <span className="text-[10px] font-display font-semibold text-primary tracking-wide">
                  {format(selectedDate, "MMM d")} selected
                </span>
              )}
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 hover:bg-secondary rounded-full transition-colors group"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          {/* Range info */}
          {range.startDate && range.endDate && (
            <div className="text-[10px] text-center text-muted-foreground pb-1 animate-fade-in font-medium tracking-wide">
              {format(range.startDate, "MMM d")} —{" "}
              {format(range.endDate, "MMM d")}
            </div>
          )}

          {/* Grid area with notes column */}
          <div className="flex">
            {/* Notes column - shows actual date notes */}
            <div className="w-24 sm:w-32 border-r border-calendar-grid-line flex-shrink-0 flex flex-col">
              <p className="text-[10px] sm:text-xs font-display font-semibold text-muted-foreground px-2 sm:px-3 pt-2 pb-1 tracking-wide border-b-2 border-calendar-ink/20">
                Notes
              </p>
              <div className="flex-1 overflow-y-auto max-h-64 sm:max-h-80">
                {dateNotes.length === 0 && (
                  <p className="text-[9px] text-muted-foreground/50 italic px-2 pt-3 text-center leading-relaxed">
                    Select a date & add notes
                  </p>
                )}
                {dateNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group border-b border-calendar-grid-line px-2 py-1.5 animate-fade-in hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[8px] font-display font-bold text-primary uppercase tracking-wider">
                          {note.date
                            ? format(
                                new Date(note.date + "T12:00:00"),
                                "MMM d"
                              )
                            : ""}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-foreground leading-tight break-words">
                          {note.text}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-opacity flex-shrink-0 mt-0.5"
                        aria-label="Remove note"
                      >
                        <X className="w-2.5 h-2.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline note input when date is selected */}
              {selectedDate && (
                <form
                  onSubmit={handleAddNote}
                  className="border-t border-calendar-grid-line p-1.5 animate-fade-in"
                >
                  <p className="text-[8px] font-display font-bold text-primary uppercase tracking-wider mb-0.5">
                    {format(selectedDate, "MMM d")}
                  </p>
                  <div className="flex gap-1">
                    <input
                      ref={noteInputRef}
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add note…"
                      className="flex-1 min-w-0 text-[10px] bg-secondary/30 border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="submit"
                      disabled={!noteInput.trim()}
                      className="p-1 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-30 transition-opacity"
                      aria-label="Add note"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Calendar grid */}
            <div
              className="flex-1 px-2 sm:px-4 py-2"
              style={{ perspective: 600 }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={format(currentMonth, "yyyy-MM") + "-grid"}
                  custom={direction}
                  variants={flipVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.05,
                  }}
                >
                  <CalendarGrid
                    currentMonth={currentMonth}
                    isInRange={isInRange}
                    isRangeStart={isRangeStart}
                    isRangeEnd={isRangeEnd}
                    hasNoteOnDate={hasNoteOnDate}
                    onDateClick={handleDateClick}
                    onDateHover={handleDateHover}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-2 border-t border-calendar-grid-line flex items-center justify-between text-[9px] text-muted-foreground tracking-widest uppercase font-display">
            <span>Click date to add notes</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-calendar-dot" />{" "}
              has notes
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
