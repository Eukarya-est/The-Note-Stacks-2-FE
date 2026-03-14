import { useState } from "react";
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
        <ul className="space-y-1 border-t border-border px-4 py-3">
          {headings.map((heading, index) => {
            const isClickable = heading.level <= 2;
            return (
              <li
                key={index}
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
              >
                {isClickable ? (
                  <a
                    href={`#${heading.id}`}
                    className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {heading.text}
                  </a>
                ) : (
                  <span className="block py-1 text-sm text-muted-foreground/60">
                    {heading.text}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TableOfContents;
