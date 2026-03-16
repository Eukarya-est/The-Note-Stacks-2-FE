import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import NavigationControls from "@/components/NavigationControls";
import MarkdownViewer from "@/components/MarkdownViewer";
import GoogleAdBanner, { GoogleAdBannerTablet, GoogleAdBannerMobile } from "@/components/GoogleAdBanner";
import { KeyboardHints } from "@/components/KeyboardHints";
import { useCategories } from "@/hooks/useCategories";
import { useMarkdownFiles } from "@/hooks/useMarkdownFiles";
import { useTrackNoteView } from "@/hooks/useNoteViews";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get("category");
  const noteIdFromUrl = searchParams.get("note");
  
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [_searchQuery, setSearchQuery] = useState("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);
  const [highlightFromSearch, setHighlightFromSearch] = useState(false);
  const [hasUserSelected, setHasUserSelected] = useState(false);

  const { data: covers = [], isLoading: coversLoading } = useCategories();

  // Set category from URL search param and track pending note
  useEffect(() => {
    if (categoryIdFromUrl && categoryIdFromUrl !== selectedCoverId) {
      setSelectedCoverId(categoryIdFromUrl);
      // Store the note ID to navigate to after notes are loaded
      if (noteIdFromUrl) {
        setPendingNoteId(noteIdFromUrl);
      } else {
        setCurrentIndex(0);
      }
    } else if (noteIdFromUrl && !categoryIdFromUrl) {
      // Note ID provided without category - will be handled by notes effect
      setPendingNoteId(noteIdFromUrl);
    }
  }, [categoryIdFromUrl, noteIdFromUrl]);
  
  // Remove the buggy direct note query - not needed since we get note from URL params
  // and load it through the normal notes flow

  const { data: notes = [], isLoading: notesLoading } = useMarkdownFiles(
    selectedCoverId,
    "" // Don't filter notes by search query - search results are shown in dropdown only
  );
  const trackView = useTrackNoteView();
  const lastTrackedNoteId = useRef<string | null>(null);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Track view after 30 seconds of viewing a note - only when user has explicitly selected
  useEffect(() => {
    const currentNote = notes[currentIndex];
    
    // Clear any existing timer when note changes
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
      viewTimerRef.current = null;
    }

    if (hasUserSelected && currentNote && currentNote.id !== lastTrackedNoteId.current) {
      // Start a 30-second timer before tracking the view
      viewTimerRef.current = setTimeout(() => {
        lastTrackedNoteId.current = currentNote.id;
        trackView.mutate(currentNote.id);
      }, 30000); // 30 seconds
    }

    // Cleanup timer on unmount or note change
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [notes, currentIndex, hasUserSelected]);

  // Navigate to specific note when noteId param is present or pending from search
  useEffect(() => {
    const targetNoteId = noteId || pendingNoteId;
    if (targetNoteId && notes.length > 0) {
      const noteIndex = notes.findIndex((n) => n.id === targetNoteId);
      if (noteIndex !== -1 && noteIndex !== currentIndex) {
        setCurrentIndex(noteIndex);
        setHasUserSelected(true); // Direct link or search counts as explicit selection
        // Trigger highlight when navigating from search result
        if (pendingNoteId) {
          setHighlightFromSearch(true);
        }
      }
      // Clear pending note ID after navigating
      if (pendingNoteId) {
        setPendingNoteId(null);
      }
    }
  }, [noteId, pendingNoteId, notes]);

  // Clear highlight flag after it's been used
  useEffect(() => {
    if (highlightFromSearch) {
      const timer = setTimeout(() => setHighlightFromSearch(false), 100);
      return () => clearTimeout(timer);
    }
  }, [highlightFromSearch]);

  // Set default cover on first load
  useMemo(() => {
    if (covers.length > 0 && selectedCoverId === null) {
      setSelectedCoverId(covers[0].id);
    }
  }, [covers, selectedCoverId]);

  const categoryNames = covers.map((c) => c.category);
  const selectedCategoryName = covers.find((c) => c.id === selectedCoverId)?.category || null;

  const currentNote = notes[currentIndex];
  const fileTitles = notes.map((n) => n.title);

  const handleCategorySelect = (categoryName: string) => {
    const cover = covers.find((c) => c.category === categoryName);
    if (cover) {
      setSelectedCoverId(cover.id);
      setCurrentIndex(0);
      setHasUserSelected(true);
    }
  };

  const handleNavigate = useCallback((index: number, direction?: "left" | "right") => {
    if (index >= 0 && index < notes.length) {
      setSlideDirection(direction || (index > currentIndex ? "left" : "right"));
      setCurrentIndex(index);
      setHasUserSelected(true); // User explicitly navigated to a note
    }
  }, [notes.length, currentIndex]);

  // Swipe gestures for mobile navigation
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => handleNavigate(currentIndex + 1, "left"),
    onSwipeRight: () => handleNavigate(currentIndex - 1, "right"),
  });

  // Keyboard shortcuts for note navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Arrow keys for prev/next note
      if (e.key === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        handleNavigate(currentIndex - 1, "right");
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        handleNavigate(currentIndex + 1, "left");
      }
      // Shift + Arrow keys for fast forward/backward (5 notes)
      else if (e.key === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        handleNavigate(Math.max(0, currentIndex - 5), "right");
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        handleNavigate(Math.min(notes.length - 1, currentIndex + 5), "left");
      }
      // Home/End for first/last note
      else if (e.key === 'Home') {
        e.preventDefault();
        handleNavigate(0, "right");
      } else if (e.key === 'End') {
        e.preventDefault();
        handleNavigate(notes.length - 1, "left");
      }
      // PageUp/PageDown for category navigation
      else if (e.key === 'PageUp') {
        e.preventDefault();
        const currentCategoryIndex = covers.findIndex(c => c.id === selectedCoverId);
        if (currentCategoryIndex > 0) {
          setSelectedCoverId(covers[currentCategoryIndex - 1].id);
          setCurrentIndex(0);
        }
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        const currentCategoryIndex = covers.findIndex(c => c.id === selectedCoverId);
        if (currentCategoryIndex < covers.length - 1) {
          setSelectedCoverId(covers[currentCategoryIndex + 1].id);
          setCurrentIndex(0);
        }
      }
      // Backslash to toggle sidebar
      else if (e.key === '\\' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleNavigate, notes.length, covers, selectedCoverId]);

  // Transform note for MarkdownViewer
  const viewerFile = currentNote
    ? {
        id: currentNote.id,
        filename: currentNote.title,
        filepath: currentNote.filepath,
        content: currentNote.content,
        category: currentNote.category?.category || "Uncategorized",
        contentNumber: currentNote.num,
        revision: currentNote.revision,
        createdAt: format(new Date(currentNote.created), "yyyy-MM-dd HH:mm:ss"),
        revisedAt: format(new Date(currentNote.revised), "yyyy-MM-dd HH:mm:ss"),
      }
    : null;

  const isLoading = coversLoading || notesLoading;

  return (
    <div className="min-h-screen w-full">
      <Navbar onSearch={setSearchQuery} />
      <GoogleAdBannerTablet />
      <KeyboardHints />

      <div className="flex flex-col md:flex-row w-full">
        <CategorySidebar
          categories={categoryNames}
          selectedCategory={selectedCategoryName}
          onCategorySelect={handleCategorySelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          disableActiveAnimation={!hasUserSelected}
        />

        <main className="flex-1 min-w-0" {...swipeHandlers}>
          {hasUserSelected && (
            <NavigationControls
              currentIndex={currentIndex}
              totalCount={notes.length}
              fileNames={fileTitles}
              onNavigate={handleNavigate}
              onFileSelect={(title) => {
                const index = fileTitles.indexOf(title);
                if (index !== -1) handleNavigate(index);
              }}
            />
          )}

          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : !hasUserSelected && notes.length > 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome to Note Shelf</h2>
              <p className="mb-6 max-w-md text-muted-foreground">
                Select a category to explore notes or use the search to find specific content.
              </p>

              {/* Category Stack */}
              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {covers.map((cover) => (
                    <button
                        key={cover.id}
                        onClick={() => {
                          setSelectedCoverId(cover.id);
                          setCurrentIndex(0);
                          setHasUserSelected(true);
                        }}
                        className="group relative rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md steam"
                    >
                      {cover.category}
                    </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-1">← → Navigate notes</span>
                <span className="rounded-md bg-muted px-2 py-1">PageUp/Down Switch category</span>
                <span className="rounded-md bg-muted px-2 py-1">Ctrl+K Search</span>
              </div>
            </div>
          ) : viewerFile ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentNote?.id}
                initial={{ 
                  opacity: 0, 
                  x: slideDirection === "left" ? 50 : slideDirection === "right" ? -50 : 0 
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ 
                  opacity: 0, 
                  x: slideDirection === "left" ? -50 : slideDirection === "right" ? 50 : 0 
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <MarkdownViewer file={viewerFile} totalContents={notes.length} highlightOnMount={highlightFromSearch} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="p-4 sm:p-6 text-muted-foreground">
              No notes found. Try selecting a different category or adjusting your search.
            </div>
          )}
        </main>

        <GoogleAdBanner />
      </div>
    </div>
  );
};

export default Index;
