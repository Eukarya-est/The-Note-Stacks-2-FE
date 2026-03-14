import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarEvent, EventLabel, labelColors, labelIcons, useCreateEvent, useUpdateEvent } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  editEvent?: CalendarEvent | null;
}

const labels: EventLabel[] = ['reading', 'repeat', 'shadowing', 'solve', 'writing', 'development'];

export const EventDialog = ({ open, onOpenChange, selectedDate, editEvent }: EventDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState<EventLabel>("reading");
  
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description || "");
      setLabel(editEvent.label);
    } else {
      setTitle("");
      setDescription("");
      setLabel("reading");
    }
  }, [editEvent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editEvent) {
        await updateEvent.mutateAsync({
          id: editEvent.id,
          title: title.trim(),
          description: description.trim() || undefined,
          label,
          event_date: editEvent.event_date,
        });
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        await createEvent.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          label,
          event_date: format(selectedDate, "yyyy-MM-dd"),
        });
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save event",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editEvent ? "Edit Event" : `Add Event - ${format(selectedDate, "MMMM d, yyyy")}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Select value={label} onValueChange={(v) => setLabel(v as EventLabel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((l) => (
                    <SelectItem key={l} value={l}>
                      <div className="flex items-center gap-2">
                        <img src={labelIcons[l]} alt={l} className="w-4 h-4" />
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: labelColors[l] }}
                        />
                        <span className="capitalize">{l}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
              {editEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
