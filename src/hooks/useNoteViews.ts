import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";

// Generate or retrieve a session ID for view tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("note_view_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("note_view_session", sessionId);
  }
  return sessionId;
};

// Track a note view
export const useTrackNoteView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const sessionId = getSessionId();
      return api.trackNoteView(noteId, sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteViewStats"] });
    },
  });
};

export const useNoteViewCounts = () => {
  return useQuery({
    queryKey: ["noteViewCounts"],
    queryFn: async () => {
      // Get all notes
      const notes = await api.getAllNotes();

      // Fetch view count for each note from backend
      const counts: Record<string, number> = {};

      await Promise.all(
          notes.map(async (note) => {
            try {
              const result = await api.getViewCount(note.id);
              counts[note.id] = result.count;
            } catch (error) {
              counts[note.id] = 0;
            }
          })
      );

      return counts;
    },
    staleTime: 60000, // Cache for 1 minute
  });
}