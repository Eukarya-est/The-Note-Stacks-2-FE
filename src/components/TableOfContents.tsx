import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents = ({ headings }: TableOfContentsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string>("");
  const tocListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting (visible)
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    if (!activeId || !tocListRef.current) return;
    const activeEl = tocListRef.current.querySelector(`[data-toc-id="${activeId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  return (
    <div className="toc-container mb-8 rounded-lg border border-border bg-muted/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/70"
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Contents</span>
          <span className="text-sm text-muted-foreground">({headings.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[60vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <ul ref={tocListRef} className="space-y-1 border-t border-border px-4 py-3">
          {headings.map((heading, index) => (
              <li
                key={index}
                data-toc-id={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveId(heading.id);
                  }}
                  className={cn(
                    "block py-1 text-sm transition-colors",
                    activeId === heading.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {heading.text}
                </a>
              </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TableOfContents;
