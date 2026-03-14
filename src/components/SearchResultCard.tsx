import { forwardRef } from "react";
import { FileText, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HighlightedText {
  text: string;
  highlighted: boolean;
}

interface SearchResultCardProps {
  title: string;
  titleHighlights?: HighlightedText[];
  contentSnippets?: HighlightedText[][];
  categoryName?: string;
  isFocused?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}

const SearchResultCard = forwardRef<HTMLButtonElement, SearchResultCardProps>(
  (
    {
      title,
      titleHighlights,
      contentSnippets,
      categoryName,
      isFocused,
      onClick,
      onMouseEnter,
    },
    ref
  ) => {
    const renderHighlightedText = (segments: HighlightedText[]) => {
      return segments.map((segment, index) => (
        <span
          key={index}
          className={
            segment.highlighted
              ? "bg-primary/30 text-primary font-semibold px-0.5 rounded"
              : ""
          }
        >
          {segment.text}
        </span>
      ));
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          "w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50",
          isFocused && "bg-accent/50 border-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          <FileText
            className={cn(
              "h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0",
              isFocused && "text-primary"
            )}
          />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm text-foreground">
                {titleHighlights ? renderHighlightedText(titleHighlights) : title}
              </h4>
              {categoryName && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                >
                  <FolderOpen className="h-2.5 w-2.5 mr-1" />
                  {categoryName}
                </Badge>
              )}
            </div>
            {contentSnippets && contentSnippets.length > 0 && (
              <div className="space-y-1.5">
                {contentSnippets.slice(0, 3).map((snippet, index) => (
                  <p
                    key={index}
                    className="text-xs text-muted-foreground leading-relaxed"
                  >
                    <span className="text-muted-foreground/50">...</span>
                    {renderHighlightedText(snippet)}
                    <span className="text-muted-foreground/50">...</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }
);

SearchResultCard.displayName = "SearchResultCard";

export default SearchResultCard;
