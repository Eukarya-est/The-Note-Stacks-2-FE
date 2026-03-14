import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, setMonth, setYear, getMonth, getYear } from "date-fns";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MonthYearPicker = ({ currentMonth, onMonthChange }: MonthYearPickerProps) => {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(getYear(currentMonth));
  const [focusedMonth, setFocusedMonth] = useState(getMonth(currentMonth));
  const monthRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    const newDate = setMonth(setYear(currentMonth, pickerYear), monthIndex);
    onMonthChange(newDate);
    setOpen(false);
  }, [currentMonth, pickerYear, onMonthChange]);

  const handlePrevYear = useCallback(() => {
    setPickerYear((prev) => prev - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setPickerYear((prev) => prev + 1);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setPickerYear(getYear(currentMonth));
      setFocusedMonth(getMonth(currentMonth));
    }
  };

  // Focus the current month button when popover opens
  useEffect(() => {
    if (open && monthRefs.current[focusedMonth]) {
      monthRefs.current[focusedMonth]?.focus();
    }
  }, [open, focusedMonth]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setFocusedMonth((prev) => {
          const next = prev > 0 ? prev - 1 : 11;
          if (prev === 0) setPickerYear((y) => y - 1);
          return next;
        });
        break;
      case "ArrowRight":
        e.preventDefault();
        setFocusedMonth((prev) => {
          const next = prev < 11 ? prev + 1 : 0;
          if (prev === 11) setPickerYear((y) => y + 1);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedMonth((prev) => {
          const next = prev - 3;
          if (next < 0) {
            setPickerYear((y) => y - 1);
            return next + 12;
          }
          return next;
        });
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedMonth((prev) => {
          const next = prev + 3;
          if (next > 11) {
            setPickerYear((y) => y + 1);
            return next - 12;
          }
          return next;
        });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleMonthSelect(focusedMonth);
        break;
      case "Home":
        e.preventDefault();
        setFocusedMonth(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedMonth(11);
        break;
      case "PageUp":
        e.preventDefault();
        setPickerYear((prev) => prev - 1);
        break;
      case "PageDown":
        e.preventDefault();
        setPickerYear((prev) => prev + 1);
        break;
    }
  }, [focusedMonth, handleMonthSelect]);

  // Update focus when focusedMonth changes
  useEffect(() => {
    if (open && monthRefs.current[focusedMonth]) {
      monthRefs.current[focusedMonth]?.focus();
    }
  }, [focusedMonth, open]);

  const currentMonthIndex = getMonth(currentMonth);
  const currentYearValue = getYear(currentMonth);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="text-lg sm:text-xl font-semibold text-foreground hover:text-accent transition-colors cursor-pointer">
          {format(currentMonth, "MMMM yyyy")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center" onKeyDown={handleKeyDown}>
        {/* Year Navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevYear} 
            className="h-8 w-8"
            tabIndex={-1}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground">{pickerYear}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextYear} 
            className="h-8 w-8"
            tabIndex={-1}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 gap-2" role="grid" aria-label="Month selection">
          {months.map((month, index) => {
            const isSelected = index === currentMonthIndex && pickerYear === currentYearValue;
            const isFocused = index === focusedMonth;
            return (
              <button
                key={month}
                ref={(el) => (monthRefs.current[index] = el)}
                onClick={() => handleMonthSelect(index)}
                onFocus={() => setFocusedMonth(index)}
                tabIndex={isFocused ? 0 : -1}
                aria-selected={isSelected}
                className={cn(
                  "py-2 px-3 text-sm rounded-md transition-colors outline-none",
                  "focus:ring-2 focus:ring-accent focus:ring-offset-1",
                  isSelected
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {month}
              </button>
            );
          })}
        </div>

        {/* Keyboard hints */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          ←→↑↓ navigate • Enter select • PgUp/Dn year
        </p>

        {/* Today Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => {
            onMonthChange(new Date());
            setOpen(false);
          }}
        >
          Today
        </Button>
      </PopoverContent>
    </Popover>
  );
};
