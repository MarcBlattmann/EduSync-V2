import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
}

// Color mapping for different event colors
const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

interface EventPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function EventPreviewDialog({
  open,
  onOpenChange,
  event,
  onEditEvent,
  onDeleteEvent,
}: EventPreviewDialogProps) {
  if (!event) return null;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
    const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  // Check if the event spans multiple days
  const isMultiDay = !isSameDay(startDate, endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              `bg-${event.color}-500`
            )} />
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">Date</div>
              <p className="text-sm text-muted-foreground">
                {isMultiDay ? (
                  <>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </>
                ) : (
                  formatDate(startDate)
                )}
              </p>
            </div>
          </div>
            {event.description && (
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <div className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {event.description}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onEditEvent(event);
            }}
            className="gap-1"
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onDeleteEvent(event.id);
            }}
            className="gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
