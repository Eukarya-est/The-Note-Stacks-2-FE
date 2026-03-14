import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarEvent, EventLabel, labelColors, labelIcons, useCalendarEvents } from "@/hooks/useCalendarEvents";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { EventDetailDialog } from "./EventDetailDialog";
import { DayCell } from "./DayCell";
import { MonthYearPicker } from "./MonthYearPicker";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

const allLabels: EventLabel[] = ['reading', 'repeat', 'shadowing', 'solve', 'writing', 'development'];

export const ReadOnlyCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<EventLabel>>(new Set(allLabels));
  
  const { data: events = [], isLoading } = useCalendarEvents();

  const toggleFilter = (label: EventLabel) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => activeFilters.has(event.label));
  }, [events, activeFilters]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((event) => {
      const dateKey = event.event_date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [filteredEvents]);

  const prevMonth = useCallback(() => {
    setSlideDirection('right');
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setSlideDirection('left');
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  // Swipe gestures for mobile month navigation
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: nextMonth,
    onSwipeRight: prevMonth,
  });

  // Keyboard navigation for prev/next month
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input or popover
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevMonth();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevMonth, nextMonth]);

  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Generate calendar days
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = day;
      const dateKey = format(currentDay, "yyyy-MM-dd");
      const dayEvents = eventsByDate.get(dateKey) || [];
      const isCurrentMonth = isSameMonth(currentDay, currentMonth);
      const isTodayDate = isToday(currentDay);

      days.push(
        <TooltipProvider key={dateKey} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "min-h-[100px] sm:min-h-[140px] p-1 border border-border transition-colors",
                  !isCurrentMonth && "opacity-40 bg-muted/20",
                  isTodayDate && "bg-accent/10"
                )}
              >
                <div className={cn(
                  "text-xs sm:text-sm font-medium mb-1",
                  isTodayDate && "text-accent font-bold"
                )}>
                  {format(currentDay, "d")}
                </div>
                <DayCell 
                  events={dayEvents} 
                  onEventClick={setSelectedEvent}
                />
              </div>
            </TooltipTrigger>
            {dayEvents.length > 0 && (
              <TooltipContent side="right" align="start" className="max-w-[300px] p-2">
                <div className="space-y-2 text-left">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: labelColors[event.label] }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={labelIcons[event.label]}
                          alt={event.label}
                          className="w-5 h-5 mt-0.5 flex-shrink-0 invert"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-white text-sm">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-white/80 mt-1 line-clamp-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full" {...swipeHandlers}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 sm:h-10 sm:w-10">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <MonthYearPicker currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 sm:h-10 sm:w-10">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{weekDaysShort[index]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className={cn(
          "grid grid-cols-7 gap-0 transition-transform duration-300",
          slideDirection === 'left' && "animate-fade-in",
          slideDirection === 'right' && "animate-fade-in"
        )}
      >
        {isLoading ? (
          Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[100px] sm:min-h-[140px] p-1 border border-border bg-muted/20 animate-pulse" />
          ))
        ) : (
          renderDays()
        )}
      </div>

      {/* Filter Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          {allLabels.map((label) => {
            const isActive = activeFilters.has(label);
            return (
              <button
                key={label}
                onClick={() => toggleFilter(label)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all",
                  isActive
                    ? "border-transparent"
                    : "border-border opacity-40 grayscale"
                )}
                style={{
                  backgroundColor: isActive ? `${labelColors[label]}20` : undefined,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: labelColors[label] }}
                />
                <img
                  src={labelIcons[label]}
                  alt={label}
                  className="w-4 h-4 dark:invert"
                />
                <span className="text-xs text-foreground capitalize hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  );
};
