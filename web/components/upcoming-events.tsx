"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the CalendarEvent type
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

// Format date helper function moved outside to prevent recreation on each render
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Event item component to optimize rendering
const EventItem = memo(({ event }: { event: CalendarEvent }) => {
  return (
    <div 
      key={event.id}
      className="flex items-start gap-2"
    >
      <div className={cn(
        "w-2 h-2 mt-1.5 rounded-full",
        `bg-${event.color}-500`
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <p className="font-medium truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(event.start_date)}
          </p>
        </div>
        {event.description && (
          <p className="text-xs mt-0.5 text-muted-foreground line-clamp-1">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
});

EventItem.displayName = "EventItem";

// Main component optimized with memoization
function UpcomingEventsBase({ events }: { events: CalendarEvent[] }) {
  // Use memoization to avoid unnecessary recalculations
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ).slice(0, 5), 
    [events]
  );

  return (
    <div className="flex flex-col h-full">
      {sortedEvents.length === 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-grow flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
            <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No upcoming events</p>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
            <Link href="/protected/calendar" className="flex justify-center items-center">
              Add your first event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-grow space-y-2.5 overflow-auto mb-4">
            {sortedEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
            <Link href="/protected/calendar" prefetch={true} className="flex justify-center items-center">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const UpcomingEvents = memo(UpcomingEventsBase);