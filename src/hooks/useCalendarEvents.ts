import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";

// Re-export types from API
export type { CalendarEvent } from "@/lib/api";
export type EventLabel = 'reading' | 'repeat' | 'shadowing' | 'solve' | 'writing' | 'development';

export const labelColors: Record<EventLabel, string> = {
  reading: 'hsl(210 95% 52%)',      // Blue
  repeat: 'hsl(280 70% 50%)',       // Purple
  shadowing: 'hsl(45 93% 47%)',     // Yellow/Gold
  solve: 'hsl(142 76% 36%)',        // Green
  writing: 'hsl(0 84% 60%)',        // Red
  development: 'hsl(25 95% 53%)',   // Orange
};

export const labelIcons: Record<EventLabel, string> = {
  reading: '/reading.svg',
  repeat: '/repeat.svg',
  shadowing: '/shadowing.svg',
  solve: '/solve.svg',
  writing: '/writing.svg',
  development: '/development.svg',
};

/**
 * Hook to fetch all calendar events
 */
export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const events = await api.getAllCalendarEvents();
      // Sort by event date ascending
      return events.sort((a, b) => a.event_date.localeCompare(b.event_date));
    },
  });
};

/**
 * Hook to fetch a single calendar event
 */
export const useCalendarEvent = (eventId: string | null) => {
  return useQuery({
    queryKey: ["calendar-event", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return api.getCalendarEvent(eventId);
    },
    enabled: !!eventId,
  });
};

/**
 * Hook to create a new calendar event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: {
      title: string;
      description?: string;
      label: EventLabel;
      event_date: string;
    }) => {
      // Note: For now, we don't require authentication
      // If you add auth later, you can set user_id here
      return api.createCalendarEvent({
        ...event,
        user_id: undefined, // Set this if you add authentication
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing calendar event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...event }: {
      id: string;
      title?: string;
      description?: string;
      label?: EventLabel;
      event_date?: string;
    }) => api.updateCalendarEvent(id, event),
    onSuccess: (data) => {
      queryClient.setQueryData(["calendar-event", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a calendar event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteCalendarEvent(id),
    onSuccess: (_, eventId) => {
      queryClient.removeQueries({ queryKey: ["calendar-event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
};
