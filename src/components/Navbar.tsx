import { Search, Moon, Sun, ChevronDown, LayoutDashboard, BookOpen, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect, useCallback } from "react";
import SearchResults from "./SearchResults";
import RecentSearches from "./RecentSearches";
import { useSearchResults } from "@/hooks/useSearchResults";
import { useRecentSearches } from "@/hooks/useRecentSearches";

interface NavbarProps {
  onSearch: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, query: debouncedQuery } = useSearchResults(searchValue);
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();

  // Reset focused index when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear search
      if (e.key === "Escape") {
        if (showResults) {
          setShowResults(false);
          setFocusedIndex(-1);
        } else if (searchValue) {
          setSearchValue("");
          onSearch("");
        }
        if (mobileSearchOpen) {
          setMobileSearchOpen(false);
        }
        searchInputRef.current?.blur();
      }
      // / or Ctrl+K to focus search
      if (
        (e.key === "/" || (e.ctrlKey && e.key === "k")) &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchValue, mobileSearchOpen, onSearch, showResults]);


  // Handle keyboard navigation in search results
  const handleSearchKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showResults || results.length === 0) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev < results.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setFocusedIndex((prev) =>
                prev > 0 ? prev - 1 : results.length - 1
            );
            break;
          case "Enter":
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < results.length) {
              const result = results[focusedIndex];
              const params = new URLSearchParams();
              if (result.categoryId) {
                params.set("category", result.categoryId);
              }
              params.set("note", result.noteId);
              window.location.href = `/?${params.toString()}`;
              handleResultClick();
            }
            break;
        }
      },
      [showResults, results, focusedIndex]
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setShowResults(true);
    setFocusedIndex(-1);
    onSearch(value);
  };

  const handleResultClick = () => {
    // Save search term before clearing
    if (searchValue.trim()) {
      addSearch(searchValue.trim());
    }
    setShowResults(false);
    setSearchValue("");
    setFocusedIndex(-1);
    setMobileSearchOpen(false);
    onSearch("");
  };

  const handleRecentSearchSelect = (term: string) => {
    setSearchValue(term);
    setShowResults(true);
    onSearch(term);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getCurrentPageName = () => {
    switch (location.pathname) {
      case "/":
        return "Note Shelf";
      case "/desk":
        return "Desk";
      default:
        return "Note Shelf";
    }
  };

  const getStreamLineColor = () => {
    switch (location.pathname) {
      case "/":
        return "via-emerald/40";
      case "/desk":
        return "via-amber-500/40";
      default:
        return "via-accent/40";
    }
  };

  const getStreamLineColorReverse = () => {
    switch (location.pathname) {
      case "/":
        return "via-emerald/30";
      case "/desk":
        return "via-amber-500/30";
      default:
        return "via-accent/30";
    }
  };

  return (
    <header className="navbar-hover sticky top-0 z-50 h-14 sm:h-16 bg-card/80 backdrop-blur-sm relative">
      <div className="flex h-full items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            src="/nnneon.svg"
            alt="Note Stacks"
            className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] transition-all duration-300 hover:drop-shadow-[0_0_16px_hsl(var(--primary)/0.9)] hover:animate-pulse"
          />
          <h1 className="text-xl sm:text-3xl font-qwitcher font-bold text-primary bg-gradient-to-r from-primary via-primary/60 to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
            <span className="hidden sm:inline">The Note Stacks</span>
            <span className="sm:hidden">The Note Stacks</span>
          </h1>
        </div>

        {/* Desktop search - centered */}
        <div
          ref={searchContainerRef}
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-xs md:max-w-sm lg:max-w-xl px-4 hidden sm:block"
        >
          <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search markdown files..."
            className="pl-10 w-full"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {showResults && searchValue.trim() ? (
            <SearchResults
              results={results}
              isLoading={isLoading}
              query={debouncedQuery}
              onResultClick={handleResultClick}
              focusedIndex={focusedIndex}
              onFocusedIndexChange={setFocusedIndex}
            />
          ) : showResults && !searchValue.trim() ? (
          <RecentSearches
              searches={recentSearches}
              onSelect={handleRecentSearchSelect}
              onRemove={removeSearch}
              onClearAll={clearAll}
          />
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-8 w-8"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-10 sm:w-10">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-8 sm:h-10 px-2 sm:px-3">
                <span className="hidden sm:inline">{getCurrentPageName()}</span>
                <Menu className="h-4 w-4 sm:hidden" />
                <ChevronDown className="h-4 w-4 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {location.pathname !== "/" && (
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Note Shelf
                  </Link>
                </DropdownMenuItem>
              )}
              {location.pathname !== "/desk" && (
                <DropdownMenuItem asChild>
                  <Link to="/desk" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Desk
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="absolute top-full left-0 right-0 p-3 bg-card/95 backdrop-blur-sm border-b border-border sm:hidden z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Search markdown files..."
              className="pl-10"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
            {searchValue.trim() ? (
              <SearchResults
                results={results}
                isLoading={isLoading}
                query={debouncedQuery}
                onResultClick={handleResultClick}
                focusedIndex={focusedIndex}
                onFocusedIndexChange={setFocusedIndex}
              />
            ) : (
              <RecentSearches
                  searches={recentSearches}
                  onSelect={handleRecentSearchSelect}
                  onRemove={removeSearch}
                  onClearAll={clearAll}
              />
            )}
          </div>
        </div>
      )}

      {/* Animated stream lines */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
        <div
          className={`stream-line absolute inset-0 bg-gradient-to-r from-transparent ${getStreamLineColor()} to-transparent`}
        />
        <div
          className={`stream-line-reverse absolute inset-0 bg-gradient-to-r from-transparent ${getStreamLineColorReverse()} to-transparent`}
        />
      </div>
    </header>
  );
};

export default Navbar;
