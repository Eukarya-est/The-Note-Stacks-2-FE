import { CalendarEvent, labelColors, labelIcons, useDeleteEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EventTooltipProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  currentUserId?: string;
}

export const EventTooltip = ({ events, onEdit, currentUserId }: EventTooltipProps) => {
  const deleteEvent = useDeleteEvent();

  const handleDelete = async (event: CalendarEvent) => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2 text-left">
      {events.map((event) => {
        const isOwner = currentUserId && event.user_id === currentUserId;
        
        return (
          <div
            key={event.id}
            className="p-2 rounded-md border border-border bg-card"
            style={{ borderLeftColor: labelColors[event.label], borderLeftWidth: '3px' }}
          >
            <div className="flex items-start gap-2">
              <img
                src={labelIcons[event.label]}
                alt={event.label}
                className="w-5 h-5 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-foreground text-sm">{event.title}</p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event);
                    }}
                    disabled={deleteEvent.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
