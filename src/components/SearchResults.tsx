import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import SearchResultCard from "./SearchResultCard";
import { useEffect, useRef } from "react";

export interface SearchHit {
  id: string;
  noteId: string;
  title: string;
  titleHighlights?: { text: string; highlighted: boolean }[];
  contentSnippets?: { text: string; highlighted: boolean }[][];
  categoryId?: string;
  categoryName?: string;
}

interface SearchResultsProps {
  results: SearchHit[];
  isLoading?: boolean;
  query: string;
  onResultClick?: () => void;
  focusedIndex: number;
  onFocusedIndexChange: (index: number) => void;
}

const SearchResults = ({
  results,
  isLoading,
  query,
  onResultClick,
  focusedIndex,
  onFocusedIndexChange,
}: SearchResultsProps) => {
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleResultClick = (result: SearchHit) => {
    const params = new URLSearchParams();
    if (result.categoryId) {
      params.set("category", result.categoryId);
    }
    params.set("note", result.noteId);
    navigate(`/?${params.toString()}`);
    onResultClick?.();
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && resultRefs.current[focusedIndex]) {
      resultRefs.current[focusedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  // Reset refs array when results change
  useEffect(() => {
    resultRefs.current = resultRefs.current.slice(0, results.length);
  }, [results]);

  if (!query.trim()) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 w-full min-w-[400px] sm:min-w-[500px]">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <Search className="h-5 w-5" />
          <span className="text-sm">No results found for "{query}"</span>
        </div>
      ) : (
        <div className="flex flex-col max-h-[60vh]">
          <div className="bg-card border-b border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <ScrollArea className="flex-1 max-h-[calc(60vh-40px)]" ref={scrollAreaRef}>
            <div className="p-2 space-y-2">
              {results.map((result, index) => (
                <SearchResultCard
                  key={result.id}
                  ref={(el) => (resultRefs.current[index] = el)}
                  title={result.title}
                  titleHighlights={result.titleHighlights}
                  contentSnippets={result.contentSnippets}
                  categoryName={result.categoryName}
                  isFocused={index === focusedIndex}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => onFocusedIndexChange(index)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
