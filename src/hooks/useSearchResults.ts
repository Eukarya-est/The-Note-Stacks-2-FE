import { useState, useEffect } from "react";
import { SearchHit } from "@/components/SearchResults";

// Backend Note type (from Go backend API response)
interface Note {
  id: string;
  title: string;
  content: string;
  filename: string;
  filepath: string;
  cover: string;
  category?: {
    id: string;
    category: string;
    valid: boolean;
    created: string;
  };
  num: number;
  revision: string;
  created: string;
  revised: string;
  display: boolean;
}

// Transform backend Note[] response to SearchHit format with highlights
const transformBackendResponse = (notes: Note[], query: string): SearchHit[] => {
  return notes.map((note) => {
    // Check if query appears in title
    const titleMatch = note.title.toLowerCase().includes(query.toLowerCase());
    const contentMatches = extractContentSnippets(note.content, query);
    
    return {
      id: note.id,
      noteId: note.id,
      title: note.title,
      categoryId: note.cover,
      categoryName: note.category?.category, // ← Extract category name
      // Create simple highlights by finding query matches
      titleHighlights: titleMatch ? createSimpleHighlight(note.title, query) : undefined,
      contentSnippets: contentMatches.length > 0 ? contentMatches : undefined,
    };
  });
};

// Extract content snippets containing the query term
const extractContentSnippets = (content: string, query: string): { text: string; highlighted: boolean }[][] => {
  if (!query.trim()) return [];
  
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const snippets: { text: string; highlighted: boolean }[][] = [];
  
  let index = lowerContent.indexOf(lowerQuery);
  let count = 0;
  const maxSnippets = 3; // Show up to 3 snippets
  const contextChars = 80; // Characters of context around match
  
  while (index !== -1 && count < maxSnippets) {
    const start = Math.max(0, index - contextChars);
    const end = Math.min(content.length, index + query.length + contextChars);
    const snippet = content.substring(start, end);
    
    // Add ellipsis if we're not at the start/end
    const prefix = start > 0 ? "..." : "";
    const suffix = end < content.length ? "..." : "";
    const fullSnippet = prefix + snippet + suffix;
    
    snippets.push(createSimpleHighlight(fullSnippet, query));
    
    index = lowerContent.indexOf(lowerQuery, index + 1);
    count++;
  }
  
  return snippets;
};

// Create highlight segments by splitting text on query matches
const createSimpleHighlight = (text: string, query: string): { text: string; highlighted: boolean }[] => {
  if (!query.trim()) {
    return [{ text, highlighted: false }];
  }
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const segments: { text: string; highlighted: boolean }[] = [];
  
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery);
  
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, index),
        highlighted: false,
      });
    }
    
    // Add matched text (preserve original case)
    segments.push({
      text: text.substring(index, index + query.length),
      highlighted: true,
    });
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      highlighted: false,
    });
  }
  
  return segments;
};

/**
 * Hook for searching notes using backend Elasticsearch API
 * 
 * Connects to: GET /api/notes/search/advanced?q=query
 * 
 * The backend performs full-text search using Elasticsearch and returns
 * an array of matching Note objects. This hook adds client-side highlighting
 * to create the SearchHit format expected by the UI components.
 * 
 * @param query - Search query string
 * @param debounceMs - Milliseconds to debounce search requests (default: 300)
 * @returns Object with results array, loading state, and debounced query
 */
export const useSearchResults = (query: string, debounceMs = 300) => {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    const searchNotes = async () => {
      // Clear results for empty query
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        // Connect to backend Elasticsearch API
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(
          `${apiBaseUrl}/api/notes/search/advanced?q=${encodeURIComponent(debouncedQuery)}`
        );
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        
        // Backend returns Note[] array
        const notes: Note[] = await response.json();
        
        // Transform to SearchHit format with client-side highlighting
        setResults(transformBackendResponse(notes, debouncedQuery));
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchNotes();
  }, [debouncedQuery]);

  return { results, isLoading, query: debouncedQuery };
};
