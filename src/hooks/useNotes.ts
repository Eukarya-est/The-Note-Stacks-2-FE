import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook to fetch all notes in a stack
 * @param stackId - The stack ID to fetch notes from
 */
export const useNotesByStack = (stackId: string | null) => {
  return useQuery({
    queryKey: ["notes", "cover", stackId],
    queryFn: () => {
      if (!stackId) return [];
      return api.getNotesByCover(stackId);
    },
    enabled: !!stackId,
  });
};

/**
 * Hook to fetch a single note by ID
 * @param noteId - The note ID
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
 * Hook to create a new note
 * Returns a mutation object with mutate function
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createNote,
    onSuccess: (data) => {
      // Invalidate and refetch notes in the stack
      queryClient.invalidateQueries({ queryKey: ["notes", "cover", data.cover] });
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create note: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing note
 * Returns a mutation object with mutate function
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: api.UpdateNoteRequest }) =>
      api.updateNote(id, updates),
    onSuccess: (data) => {
      // Update the note in cache
      queryClient.setQueryData(["note", data.id], data);
      // Invalidate stack queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["notes", "stack"] });
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a note
 * Returns a mutation object with mutate function
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteNote,
    onSuccess: (_, noteId) => {
      // Remove note from cache
      queryClient.removeQueries({ queryKey: ["note", noteId] });
      // Invalidate stack queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["notes", "cover"] });
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
};

/**
 * Hook to check backend health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  });
};
