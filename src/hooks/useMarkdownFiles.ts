import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";

// Re-export the Note type from API
export type { Note } from "@/lib/api";

/**
 * Hook to fetch all notes
 */
export const useAllNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: api.getAllNotes,
  });
};

/**
 * Hook to fetch notes by cover/category
 * @param coverId - The cover ID to filter by
 * @param searchQuery - Optional search query
 */
export const useMarkdownFiles = (coverId?: string | null, searchQuery?: string) => {
  return useQuery({
    queryKey: ["notes", coverId, searchQuery],
    queryFn: async () => {
      let notes: api.Note[];

      if (coverId) {
        notes = await api.getNotesByCover(coverId);
      } else {
        notes = await api.getAllNotes();
      }

      // Filter by search query if provided
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        notes = notes.filter(note =>
          note.title.toLowerCase().includes(lowerQuery)
        );
      }

      // Sort by num
      return notes.sort((a, b) => a.num - b.num);
    },
  });
};

/**
 * Hook to fetch a single note by ID
 */
export const useNote = (noteId: string | null) => {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => {
      if (!noteId) throw new Error("Note ID is required");
      return api.getNote(noteId);
    },
    enabled: !!noteId,
  });
};

/**
 * Hook to search notes
 */
export const useSearchNotes = (query: string | null) => {
  return useQuery({
    queryKey: ["notes", "search", query],
    queryFn: () => {
      if (!query) return [];
      return api.searchNotes(query);
    },
    enabled: !!query,
  });
};

/**
 * Hook to create a new note
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createNote,
    onSuccess: (data) => {
      // Invalidate all note queries
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create note: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing note
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: api.UpdateNoteRequest }) =>
      api.updateNote(id, updates),
    onSuccess: (data) => {
      // Update specific note in cache
      queryClient.setQueryData(["note", data.id], data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a note
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteNote,
    onSuccess: (_, noteId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["note", noteId] });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
};
