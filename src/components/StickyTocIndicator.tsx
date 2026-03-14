import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, List, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface StickyTocIndicatorProps {
  headings: Heading[];
}

const STORAGE_KEY = "mini-toc-position";
const DEFAULT_POSITION = { x: 16, y: 96 };

const getStoredPosition = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_POSITION;
};

const StickyTocIndicator = ({ headings }: StickyTocIndicatorProps) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(getStoredPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    
    const newX = dragStartRef.current.posX + deltaX;
    const newY = dragStartRef.current.posY + deltaY;
    
    // Constrain to viewport
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 100;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging]);

  // Handle drag end - save position to localStorage
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setPosition((pos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      return pos;
    });
  }, []);

  // Reset position on double-click
  const handleDoubleClick = useCallback(() => {
    setPosition(DEFAULT_POSITION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSITION));
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  // Global mouse/touch move and end handlers
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    const handleScroll = () => {
      const tocElement = document.querySelector(".toc-container");
      if (tocElement) {
        const tocRect = tocElement.getBoundingClientRect();
        setIsVisible(tocRect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeHeading = headings.find((h) => h.id === activeId);
  const activeIndex = headings.findIndex((h) => h.id === activeId);

  const navigateTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveId(id); // Immediately update activeId
      setIsExpanded(false);
    }
  };

  const navigatePrev = () => {
    if (activeIndex > 0) {
      const prevId = headings[activeIndex - 1].id;
      navigateTo(prevId);
    }
  };

  const navigateNext = () => {
    if (activeIndex < headings.length - 1) {
      const nextId = headings[activeIndex + 1].id;
      navigateTo(nextId);
    }
  };

  if (!isVisible || headings.length === 0) return null;

  const cleanText = (text: string) => {
    return text
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed z-40 max-w-[280px] animate-fade-in",
        isDragging ? "cursor-grabbing" : ""
      )}
      style={{ left: position.x, top: position.y }}
    >
      <div className="rounded-lg border border-border bg-card/95 shadow-lg backdrop-blur-sm">
        {/* Drag handle + Current section indicator */}
        <div className="flex items-center">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onMouseDown={onMouseDown}
                  onTouchStart={onTouchStart}
                  onDoubleClick={handleDoubleClick}
                  className="flex cursor-grab items-center justify-center px-1 py-3 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={4}>
                <p>Double-click to reset position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 items-center gap-2 p-3 pl-0 text-left transition-colors hover:bg-muted/50"
          >
            <List className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {activeHeading ? cleanText(activeHeading.text) : "Introduction"}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {activeIndex + 1}/{headings.length}
            </span>
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="flex border-t border-border">
          <button
            onClick={navigatePrev}
            disabled={activeIndex <= 0}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 p-2 text-xs transition-colors",
              activeIndex <= 0
                ? "cursor-not-allowed text-muted-foreground/50"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <ChevronUp className="h-3 w-3" />
            Prev
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={navigateNext}
            disabled={activeIndex >= headings.length - 1}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 p-2 text-xs transition-colors",
              activeIndex >= headings.length - 1
                ? "cursor-not-allowed text-muted-foreground/50"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            Next
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Expanded TOC list */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded ? "max-h-[50vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="max-h-[50vh] space-y-0.5 overflow-y-auto border-t border-border p-2">
            {headings.map((heading, index) => {
              const isClickable = heading.level <= 2;
              return (
                <li key={index}>
                  {isClickable ? (
                    <button
                      onClick={() => navigateTo(heading.id)}
                      className={cn(
                        "w-full rounded px-2 py-1.5 text-left text-xs transition-colors",
                        heading.id === activeId
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      style={{ paddingLeft: `${(heading.level - 1) * 0.5 + 0.5}rem` }}
                    >
                      {cleanText(heading.text)}
                    </button>
                  ) : (
                    <span
                      className="block w-full rounded px-2 py-1.5 text-left text-xs text-muted-foreground/60"
                      style={{ paddingLeft: `${(heading.level - 1) * 0.5 + 0.5}rem` }}
                    >
                      {cleanText(heading.text)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StickyTocIndicator;