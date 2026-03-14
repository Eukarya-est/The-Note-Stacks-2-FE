import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentSearchesProps {
  searches: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
}

const RecentSearches = ({
  searches,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) => {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 w-full min-w-[400px] sm:min-w-[500px]">
      <div className="flex items-center justify-between bg-card border-b border-border px-3 py-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Recent searches
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onClearAll();
          }}
        >
          Clear all
        </Button>
      </div>
      <div className="p-2 space-y-1">
        {searches.map((term) => (
          <div
            key={term}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer group transition-colors"
            onClick={() => onSelect(term)}
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm text-foreground truncate">{term}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(term);
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
