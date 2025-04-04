"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AddEventDialog } from "@/components/add-event-dialog";
import { DayEventsDialog } from "@/components/day-events-dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const supabase = createClient();

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get the first and last day of the current month view
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Format dates for Supabase query
      const firstDayStr = firstDay.toISOString();
      const lastDayStr = new Date(
        lastDay.getFullYear(),
        lastDay.getMonth(),
        lastDay.getDate(),
        23, 59, 59
      ).toISOString();
      
      // Get events for the month
      const { data: eventsData, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .or(`start_date.lte.${lastDayStr},end_date.gte.${firstDayStr}`)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(eventsData || []);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    if (editingEvent) {
      // Update existing event
      const { error } = await supabase
        .from('calendar_events')
        .update({
          ...newEvent,
          user_id: user.id
        })
        .eq('id', editingEvent.id);
        
      if (error) {
        console.error('Error updating event:', error);
        return;
      }
    } else {
      // Insert new event
      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          ...newEvent,
          user_id: user.id
        }]);
        
      if (error) {
        console.error('Error adding event:', error);
        return;
      }
    }
    
    // Reset editing state
    setEditingEvent(null);
    setSelectedDate(null);
    
    // Refresh the events list
    fetchEvents();
    setDialogOpen(false);
  };
  
  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
    // Close the day dialog if it's open
    setDayDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    setIsLoading(true); // Show loading state while deleting
    
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventToDelete);
    
    if (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } else {
      // Refresh events after deletion
      await fetchEvents();
      console.log('Event successfully deleted!');
    }
    
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setIsLoading(false);
  };
  
  const handleEditClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(new Date(date));
    setDayDialogOpen(true);
  };
  
  const handleAddEventForDate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get days in month array (including padding days from prev/next month)
  const getDaysInMonth = () => {
    // ...existing code...
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Array to hold all days we'll display
    const daysArray = [];
    
    // Add days from previous month to fill first row
    const daysFromPrevMonth = firstDayWeekday;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      daysArray.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add all days from current month
    const daysInMonth = lastDayOfMonth.getDate();
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      daysArray.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // Add days from next month to complete grid (ensure we have 6 rows total)
    const totalDaysNeeded = 42; // 6 rows × 7 days
    const daysFromNextMonth = totalDaysNeeded - daysArray.length;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      daysArray.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return daysArray;
  };

  // Filter events for a specific day
  const getEventsForDay = (date: Date) => {
    if (!events || events.length === 0) return [];
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      
      // Event starts before day ends AND event ends after day starts
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // Format month and year for header
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          Calendar
        </div>
      </header>
      
      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <h2 className="text-2xl font-bold">Your Calendar</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border bg-background">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft size={18} />
              </Button>
              <div className="px-2 py-1 font-medium min-w-[160px] text-center">
                {formatMonthYear(currentMonth)}
              </div>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight size={18} />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
            <Button size="sm" onClick={() => setDialogOpen(true)} className="flex gap-2">
              <Plus size={16} />
              Add Event
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 h-[700px]">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-full w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border shadow-sm overflow-hidden">
            {/* Calendar header */}
            <div className="grid grid-cols-7 bg-muted/70">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-medium border-r border-b last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 bg-card min-h-[700px]">
              {getDaysInMonth().map((dayInfo, index) => {
                const dayEvents = getEventsForDay(dayInfo.date);
                return (
                  <div 
                    key={index}
                    className={cn(
                      "min-h-[100px] border-r border-b p-1 last:border-r-0 relative group",
                      !dayInfo.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      dayInfo.isToday && "bg-primary/5"
                    )}
                    onClick={() => handleDayClick(dayInfo.date)}
                  >
                    <div className="flex justify-between items-center">
                      <div 
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium",
                          dayInfo.isToday && "bg-primary text-primary-foreground"
                        )}
                      >
                        {dayInfo.date.getDate()}
                      </div>
                      {dayInfo.isCurrentMonth && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(dayInfo.date);
                            handleAddEventForDate();
                          }}
                        >
                          <Plus size={14} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div 
                          key={event.id}
                          className={cn(
                            "text-xs p-1 rounded-sm truncate cursor-pointer",
                            colorMap[event.color] || "bg-gray-100 dark:bg-gray-800"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">
                          + {dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Events for mobile view */}
        <div className="sm:hidden mt-4">
          <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
          <div className="flex flex-col gap-2">
            {events
              .filter(event => new Date(event.start_date) >= new Date())
              .slice(0, 5)
              .map(event => {
                const start = new Date(event.start_date);
                const end = new Date(event.end_date);
                
                return (
                  <div 
                    key={event.id} 
                    className="border p-3 rounded-md bg-card"
                    onClick={() => handleEditClick(event)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(event);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(event.id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarIcon size={14} />
                      {start.toLocaleDateString()}
                    </div>
                    {event.description && (
                      <div className="text-sm mt-2">{event.description}</div>
                    )}
                  </div>
                );
              })}
              
            {events.filter(event => new Date(event.start_date) >= new Date()).length === 0 && (
              <div className="text-muted-foreground text-center p-4">
                No upcoming events
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Event Dialog */}
      <AddEventDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteClick} // Add this prop to pass the delete function
        eventDate={selectedDate}
        editingEvent={editingEvent}
        isEditing={!!editingEvent}
      />
      
      {/* Day Events Dialog */}
      <DayEventsDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        date={selectedDate}
        events={selectedDate ? getEventsForDay(selectedDate) : []}
        onAddEvent={handleAddEventForDate}
        onEditEvent={handleEditClick}
        onDeleteEvent={handleDeleteClick}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}