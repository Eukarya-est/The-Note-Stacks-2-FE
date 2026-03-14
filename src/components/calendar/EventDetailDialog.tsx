import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEvent, labelColors, labelIcons } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailDialog = ({ event, open, onOpenChange }: EventDetailDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${labelColors[event.label]}20` }}
            >
              <img
                src={labelIcons[event.label]}
                alt={event.label}
                className="w-6 h-6 dark:invert"
              />
            </div>
            <div>
              <DialogTitle className="text-left">{event.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: labelColors[event.label] }}
            />
            <span className="text-sm font-medium capitalize">{event.label}</span>
          </div>

          {event.description ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description provided.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
