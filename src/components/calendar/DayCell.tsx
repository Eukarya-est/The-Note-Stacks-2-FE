import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CalendarEvent, labelColors, labelIcons } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

interface DayCellProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const VISIBLE_COUNT = 5;

export const DayCell = ({ events, onEventClick }: DayCellProps) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  
  const hasMore = events.length > VISIBLE_COUNT;
  const canScrollUp = scrollIndex > 0;
  const canScrollDown = scrollIndex + VISIBLE_COUNT < events.length;
  
  const visibleEvents = events.slice(scrollIndex, scrollIndex + VISIBLE_COUNT);

  const scrollUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScrollIndex((prev) => Math.min(events.length - VISIBLE_COUNT, prev + 1));
  };

  return (
    <div className="space-y-0.5 relative">
      {hasMore && canScrollUp && (
        <button
          onClick={scrollUp}
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-background/80 rounded-full p-0.5 hover:bg-accent/50 transition-colors"
        >
          <ChevronUp className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      {visibleEvents.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-1 text-[10px] sm:text-xs truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
          style={{ backgroundColor: labelColors[event.label] }}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick(event);
          }}
        >
          <img
            src={labelIcons[event.label]}
            alt={event.label}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 invert"
          />
          <span className="truncate hidden sm:inline text-white font-medium">{event.title}</span>
        </div>
      ))}
      
      {hasMore && canScrollDown && (
        <button
          onClick={scrollDown}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 bg-background/80 rounded-full p-0.5 hover:bg-accent/50 transition-colors"
        >
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};
